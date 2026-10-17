import express from 'express';
import { Product } from '../models/Product.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { isDatabaseConnected } from '../config/db.js';
import { getProductsStore, getMovementsStore } from '../services/retailService.js';

const router = express.Router();

/**
 * GET /api/products
 * Search and filter retail products (name, SKU, category, stock status)
 */
router.get('/', async (req, res) => {
  try {
    const { search, category, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (isDatabaseConnected()) {
      const filter = {};

      if (search && String(search).trim()) {
        const term = String(search).trim();
        filter.$or = [
          { name: { $regex: term, $options: 'i' } },
          { sku: { $regex: term, $options: 'i' } },
          { barcode: { $regex: term, $options: 'i' } },
        ];
      }

      if (category && category !== 'All') {
        filter.category = category;
      }

      if (status === 'active') {
        filter.isActive = true;
      } else if (status === 'inactive') {
        filter.isActive = false;
      } else if (status === 'low_stock') {
        filter.isActive = true;
        filter.$expr = { $lte: ['$availableStock', '$reorderLevel'] };
      }

      const sortDir = sortOrder === 'asc' ? 1 : -1;
      const products = await Product.find(filter).sort({ [sortBy]: sortDir });
      const allCategories = await Product.distinct('category');

      return res.json({
        success: true,
        count: products.length,
        data: products,
        categories: ['All', ...allCategories],
      });
    }

    // In-Memory Resilient Store
    let list = [...getProductsStore()];

    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.includes(q))
      );
    }

    if (category && category !== 'All') {
      list = list.filter((p) => p.category === category);
    }

    if (status === 'active') {
      list = list.filter((p) => p.isActive);
    } else if (status === 'inactive') {
      list = list.filter((p) => !p.isActive);
    } else if (status === 'low_stock') {
      list = list.filter((p) => p.isActive && p.availableStock <= p.reorderLevel);
    }

    const categories = ['All', ...new Set(getProductsStore().map((p) => p.category))];

    return res.json({
      success: true,
      count: list.length,
      data: list,
      categories,
    });
  } catch (error) {
    console.error('[Products GET Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/products
 * Create a new retail product (Admin restricted)
 */
router.post('/', authenticateJWT, authorizeRoles('Admin', 'SuperAdmin', 'StoreManager'), async (req, res) => {
  try {
    const { sku, name, category, purchasePrice, sellingPrice, availableStock = 0, reorderLevel = 5, unit = 'pcs', description = '', barcode = '' } = req.body;

    // Strict Validations
    if (!sku || !name) {
      return res.status(400).json({ success: false, message: 'Product SKU and Name are required.' });
    }

    const numPurchase = Number(purchasePrice);
    const numSelling = Number(sellingPrice);
    const numStock = Number(availableStock);
    const numReorder = Number(reorderLevel);

    if (isNaN(numPurchase) || numPurchase < 0) {
      return res.status(400).json({ success: false, message: 'Valid non-negative purchase price is required.' });
    }
    if (isNaN(numSelling) || numSelling < 0) {
      return res.status(400).json({ success: false, message: 'Valid non-negative selling price is required.' });
    }
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({ success: false, message: 'Valid non-negative available stock is required.' });
    }

    const cleanSku = String(sku).trim().toUpperCase();

    if (isDatabaseConnected()) {
      const existing = await Product.findOne({ sku: cleanSku });
      if (existing) {
        return res.status(409).json({ success: false, message: `Product with SKU "${cleanSku}" already exists.` });
      }

      const newProduct = new Product({
        sku: cleanSku,
        name: String(name).trim(),
        category: category || 'General Electronics',
        purchasePrice: numPurchase,
        sellingPrice: numSelling,
        availableStock: numStock,
        reorderLevel: numReorder,
        unit,
        description,
        barcode,
        isActive: true,
      });

      await newProduct.save();

      // Log initial stock movement if initial stock > 0
      if (numStock > 0) {
        const movement = new InventoryMovement({
          product: newProduct._id,
          sku: cleanSku,
          productName: newProduct.name,
          movementType: 'INITIAL_STOCK',
          quantity: numStock,
          previousStock: 0,
          newStock: numStock,
          reason: 'Initial stock entered on product registration',
          referenceId: `REG-${newProduct.sku}`,
          performedBy: {
            id: req.user?.id || 'admin',
            name: req.user?.name || 'Administrator',
            role: req.user?.role || 'Admin',
          },
        });
        await movement.save();
      }

      return res.status(201).json({
        success: true,
        message: `Product ${newProduct.name} (SKU: ${cleanSku}) created successfully.`,
        data: newProduct,
      });
    }

    // In-memory fallback
    const memStore = getProductsStore();
    if (memStore.some((p) => p.sku === cleanSku)) {
      return res.status(409).json({ success: false, message: `Product with SKU "${cleanSku}" already exists.` });
    }

    const newProd = {
      id: `prod-${Date.now()}`,
      sku: cleanSku,
      name: String(name).trim(),
      category: category || 'General Electronics',
      purchasePrice: numPurchase,
      sellingPrice: numSelling,
      availableStock: numStock,
      reorderLevel: numReorder,
      unit,
      description,
      barcode,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memStore.unshift(newProd);

    if (numStock > 0) {
      getMovementsStore().unshift({
        id: `mov-${Date.now()}`,
        sku: cleanSku,
        productName: newProd.name,
        movementType: 'INITIAL_STOCK',
        quantity: numStock,
        previousStock: 0,
        newStock: numStock,
        reason: 'Initial stock entered on product registration',
        referenceId: `REG-${cleanSku}`,
        performedBy: {
          id: req.user?.id || 'admin',
          name: req.user?.name || 'Administrator',
          role: req.user?.role || 'Admin',
        },
        timestamp: new Date(),
      });
    }

    return res.status(201).json({
      success: true,
      message: `Product ${newProd.name} (SKU: ${cleanSku}) created successfully.`,
      data: newProd,
    });
  } catch (error) {
    console.error('[Products POST Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/products/:id
 * Update product details (Admin restricted)
 */
router.put('/:id', authenticateJWT, authorizeRoles('Admin', 'SuperAdmin', 'StoreManager'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, purchasePrice, sellingPrice, reorderLevel, unit, description, barcode, isActive } = req.body;

    const updates = {};
    if (name) updates.name = String(name).trim();
    if (category) updates.category = category;
    if (purchasePrice !== undefined) updates.purchasePrice = Math.max(0, Number(purchasePrice));
    if (sellingPrice !== undefined) updates.sellingPrice = Math.max(0, Number(sellingPrice));
    if (reorderLevel !== undefined) updates.reorderLevel = Math.max(0, Number(reorderLevel));
    if (unit) updates.unit = unit;
    if (description !== undefined) updates.description = description;
    if (barcode !== undefined) updates.barcode = barcode;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    if (isDatabaseConnected()) {
      const updated = await Product.findByIdAndUpdate(id, updates, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      return res.json({ success: true, message: 'Product updated successfully.', data: updated });
    }

    // In-memory fallback
    const memStore = getProductsStore();
    const idx = memStore.findIndex((p) => p.id === id || p.sku === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    memStore[idx] = { ...memStore[idx], ...updates, updatedAt: new Date() };
    return res.json({ success: true, message: 'Product updated successfully.', data: memStore[idx] });
  } catch (error) {
    console.error('[Products PUT Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PATCH /api/products/:id/deactivate
 * Toggle active / deactivated status of a product (Admin restricted)
 */
router.patch('/:id/deactivate', authenticateJWT, authorizeRoles('Admin', 'SuperAdmin', 'StoreManager'), async (req, res) => {
  try {
    const { id } = req.params;

    if (isDatabaseConnected()) {
      const prod = await Product.findById(id);
      if (!prod) return res.status(404).json({ success: false, message: 'Product not found.' });
      prod.isActive = !prod.isActive;
      await prod.save();
      return res.json({
        success: true,
        message: `Product ${prod.name} has been ${prod.isActive ? 'activated' : 'deactivated'}.`,
        data: prod,
      });
    }

    const memStore = getProductsStore();
    const target = memStore.find((p) => p.id === id || p.sku === id);
    if (!target) return res.status(404).json({ success: false, message: 'Product not found.' });

    target.isActive = !target.isActive;
    target.updatedAt = new Date();

    return res.json({
      success: true,
      message: `Product ${target.name} has been ${target.isActive ? 'activated' : 'deactivated'}.`,
      data: target,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
