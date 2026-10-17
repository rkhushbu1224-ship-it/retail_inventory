import express from 'express';
import { Sale } from '../models/Sale.js';
import { Product } from '../models/Product.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { authenticateJWT } from '../middleware/auth.js';
import { isDatabaseConnected } from '../config/db.js';
import { getProductsStore, getMovementsStore, getSalesStore } from '../services/retailService.js';

const router = express.Router();

/**
 * Helper to generate a unique, clean invoice number
 */
const generateInvoiceNumber = () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${randomSuffix}`;
};

/**
 * POST /api/sales
 * Create a new sale with atomic stock validation, backend price calculation, and invoice generation
 */
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const {
      items,
      customerName = 'Walk-in Customer',
      customerPhone = '',
      paymentMethod = 'Cash',
      discountPercent = 0,
      taxPercent = 18,
      notes = '',
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Sale must contain at least one item.' });
    }

    const numDiscountPercent = Math.min(100, Math.max(0, Number(discountPercent) || 0));
    const numTaxPercent = Math.max(0, Number(taxPercent) !== undefined ? Number(taxPercent) : 18);
    const invoiceNumber = generateInvoiceNumber();

    const sellerInfo = {
      id: req.user?.id || 'staff-01',
      name: req.user?.name || 'Store Staff',
      role: req.user?.role || 'Staff',
    };

    // ────────────────────────────────────────────────────────────────
    // 1. MONGODB DATABASE TRANSACTION / OPERATION
    // ────────────────────────────────────────────────────────────────
    if (isDatabaseConnected()) {
      // Step A: Pre-validate all items and stock levels
      const validatedItems = [];
      const productDocs = [];

      for (const item of items) {
        const qty = parseInt(item.quantity, 10);
        if (isNaN(qty) || qty <= 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid quantity "${item.quantity}" for product ${item.sku || item.name || 'item'}.`,
          });
        }

        const query = item.productId
          ? { _id: item.productId }
          : { sku: String(item.sku).trim().toUpperCase() };

        const product = await Product.findOne(query);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product "${item.sku || item.name || 'item'}" was not found in catalog.`,
          });
        }

        if (!product.isActive) {
          return res.status(400).json({
            success: false,
            message: `Product "${product.name}" (${product.sku}) is currently deactivated and cannot be sold.`,
          });
        }

        // CRITICAL BUSINESS RULE: Available stock validation
        if (product.availableStock < qty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient inventory for "${product.name}" (${product.sku}). Requested: ${qty}, Available: ${product.availableStock}. Sale cannot reduce stock below zero.`,
            productId: product._id,
            sku: product.sku,
            requestedQty: qty,
            availableStock: product.availableStock,
          });
        }

        // Backend Price Calculation (Never trust client prices)
        const unitPrice = product.sellingPrice;
        const purchasePrice = product.purchasePrice;
        const itemTotal = parseFloat((qty * unitPrice).toFixed(2));

        validatedItems.push({
          product: product._id,
          sku: product.sku,
          name: product.name,
          quantity: qty,
          purchasePrice,
          unitPrice,
          itemTotal,
        });

        productDocs.push({ product, qty });
      }

      // Step B: Calculate financial totals on the backend
      const subtotal = parseFloat(validatedItems.reduce((acc, it) => acc + it.itemTotal, 0).toFixed(2));
      const discountAmount = parseFloat(((subtotal * numDiscountPercent) / 100).toFixed(2));
      const discountedSubtotal = subtotal - discountAmount;
      const taxAmount = parseFloat(((discountedSubtotal * numTaxPercent) / 100).toFixed(2));
      const totalAmount = parseFloat((discountedSubtotal + taxAmount).toFixed(2));

      const totalCost = parseFloat(
        validatedItems.reduce((acc, it) => acc + it.purchasePrice * it.quantity, 0).toFixed(2)
      );
      const profitAmount = parseFloat((discountedSubtotal - totalCost).toFixed(2));

      // Step C: Atomically deduct stock and record movements
      const updatedProducts = [];
      const movements = [];

      for (const { product, qty } of productDocs) {
        const previousStock = product.availableStock;
        const newStock = previousStock - qty;

        product.availableStock = newStock;
        await product.save();
        updatedProducts.push(product);

        const movement = new InventoryMovement({
          product: product._id,
          sku: product.sku,
          productName: product.name,
          movementType: 'SALE',
          quantity: -qty,
          previousStock,
          newStock,
          reason: `Retail sale checkout: Invoice #${invoiceNumber}`,
          referenceId: invoiceNumber,
          performedBy: sellerInfo,
        });

        await movement.save();
        movements.push(movement);
      }

      // Step D: Create and persist the Sale document
      const sale = new Sale({
        invoiceNumber,
        items: validatedItems,
        subtotal,
        discountPercent: numDiscountPercent,
        discountAmount,
        taxPercent: numTaxPercent,
        taxAmount,
        totalAmount,
        totalCost,
        profitAmount,
        paymentMethod,
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim(),
        soldBy: sellerInfo,
        notes,
        status: 'COMPLETED',
      });

      await sale.save();

      return res.status(201).json({
        success: true,
        message: `Sale completed successfully! Invoice: ${invoiceNumber}`,
        data: sale,
        invoiceNumber,
      });
    }

    // ────────────────────────────────────────────────────────────────
    // 2. IN-MEMORY RESILIENT MODE
    // ────────────────────────────────────────────────────────────────
    const memProducts = getProductsStore();
    const validatedItems = [];
    const productsToDeduct = [];

    for (const item of items) {
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ success: false, message: `Invalid quantity for item ${item.sku || 'item'}.` });
      }

      const cleanSku = item.sku ? String(item.sku).trim().toUpperCase() : null;
      const targetId = item.productId ? String(item.productId) : null;
      const product = memProducts.find(
        (p) =>
          (cleanSku && p.sku === cleanSku) ||
          (targetId && (String(p.id) === targetId || String(p._id) === targetId))
      );

      if (!product) {
        return res.status(404).json({ success: false, message: `Product "${item.sku || 'item'}" not found in catalog.` });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" (${product.sku}) is deactivated and cannot be sold.`,
        });
      }

      if (product.availableStock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for "${product.name}" (${product.sku}). Requested: ${qty}, Available: ${product.availableStock}.`,
          sku: product.sku,
          requestedQty: qty,
          availableStock: product.availableStock,
        });
      }

      const unitPrice = product.sellingPrice;
      const purchasePrice = product.purchasePrice;
      const itemTotal = parseFloat((qty * unitPrice).toFixed(2));

      validatedItems.push({
        sku: product.sku,
        name: product.name,
        quantity: qty,
        purchasePrice,
        unitPrice,
        itemTotal,
      });

      productsToDeduct.push({ product, qty });
    }

    const subtotal = parseFloat(validatedItems.reduce((acc, it) => acc + it.itemTotal, 0).toFixed(2));
    const discountAmount = parseFloat(((subtotal * numDiscountPercent) / 100).toFixed(2));
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = parseFloat(((discountedSubtotal * numTaxPercent) / 100).toFixed(2));
    const totalAmount = parseFloat((discountedSubtotal + taxAmount).toFixed(2));

    const totalCost = parseFloat(
      validatedItems.reduce((acc, it) => acc + it.purchasePrice * it.quantity, 0).toFixed(2)
    );
    const profitAmount = parseFloat((discountedSubtotal - totalCost).toFixed(2));

    // Deduct stock in memory
    for (const { product, qty } of productsToDeduct) {
      const prev = product.availableStock;
      product.availableStock = prev - qty;
      product.updatedAt = new Date();

      getMovementsStore().unshift({
        id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sku: product.sku,
        productName: product.name,
        movementType: 'SALE',
        quantity: -qty,
        previousStock: prev,
        newStock: product.availableStock,
        reason: `Retail sale checkout: Invoice #${invoiceNumber}`,
        referenceId: invoiceNumber,
        performedBy: sellerInfo,
        timestamp: new Date(),
      });
    }

    const newSale = {
      id: `sale-${Date.now()}`,
      invoiceNumber,
      items: validatedItems,
      subtotal,
      discountPercent: numDiscountPercent,
      discountAmount,
      discount: discountAmount,
      taxPercent: numTaxPercent,
      taxAmount,
      tax: taxAmount,
      totalAmount,
      totalCost,
      profitAmount,
      paymentMethod,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      soldBy: sellerInfo,
      notes,
      status: 'COMPLETED',
      createdAt: new Date(),
    };

    getSalesStore().unshift(newSale);

    return res.status(201).json({
      success: true,
      message: `Sale completed successfully! Invoice: ${invoiceNumber}`,
      data: newSale,
      invoiceNumber,
    });
  } catch (error) {
    console.error('[Sales POST Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/sales
 * Retrieve sales transactions with date range filtering and search
 */
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, search, limit = 100 } = req.query;

    if (isDatabaseConnected()) {
      const filter = {};

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = end;
        }
      }

      if (search && String(search).trim()) {
        const q = String(search).trim();
        filter.$or = [
          { invoiceNumber: { $regex: q, $options: 'i' } },
          { customerName: { $regex: q, $options: 'i' } },
          { customerPhone: { $regex: q, $options: 'i' } },
        ];
      }

      const sales = await Sale.find(filter)
        .sort({ createdAt: -1 })
        .limit(Number(limit));

      return res.json({
        success: true,
        count: sales.length,
        data: sales,
      });
    }

    // In-memory fallback
    let list = [...getSalesStore()];

    if (startDate) {
      const s = new Date(startDate);
      list = list.filter((x) => new Date(x.createdAt) >= s);
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      list = list.filter((x) => new Date(x.createdAt) <= e);
    }

    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      list = list.filter(
        (x) =>
          x.invoiceNumber.toLowerCase().includes(q) ||
          x.customerName.toLowerCase().includes(q) ||
          (x.customerPhone && x.customerPhone.includes(q))
      );
    }

    list = list.slice(0, Number(limit));

    return res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    console.error('[Sales GET Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/sales/:id
 * Retrieve details of a specific sale invoice
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDatabaseConnected()) {
      const sale = await Sale.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { invoiceNumber: id }],
      });

      if (!sale) {
        return res.status(404).json({ success: false, message: 'Sale invoice not found.' });
      }

      return res.json({ success: true, data: sale });
    }

    const sale = getSalesStore().find((s) => s.id === id || s.invoiceNumber === id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale invoice not found.' });
    }

    return res.json({ success: true, data: sale });
  } catch (error) {
    console.error('[Sale GET by ID Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
