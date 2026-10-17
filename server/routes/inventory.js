import express from 'express';
import { Product } from '../models/Product.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { authenticateJWT } from '../middleware/auth.js';
import { isDatabaseConnected } from '../config/db.js';
import { getProductsStore, getMovementsStore } from '../services/retailService.js';

const router = express.Router();

/**
 * GET /api/inventory/low-stock
 * Identify products at or below their configured reorder level
 */
router.get('/low-stock', async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      const lowStockProducts = await Product.find({
        isActive: true,
        $expr: { $lte: ['$availableStock', '$reorderLevel'] },
      }).sort({ availableStock: 1 });

      const formatted = lowStockProducts.map((p) => {
        const deficit = Math.max(0, p.reorderLevel - p.availableStock);
        return {
          ...p.toObject(),
          deficit,
          urgency: p.availableStock === 0 ? 'CRITICAL_OUT_OF_STOCK' : 'REORDER_REQUIRED',
        };
      });

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    }

    // In-memory fallback
    const memStore = getProductsStore();
    const lowStock = memStore
      .filter((p) => p.isActive && p.availableStock <= p.reorderLevel)
      .map((p) => ({
        ...p,
        deficit: Math.max(0, p.reorderLevel - p.availableStock),
        urgency: p.availableStock === 0 ? 'CRITICAL_OUT_OF_STOCK' : 'REORDER_REQUIRED',
      }))
      .sort((a, b) => a.availableStock - b.availableStock);

    return res.json({
      success: true,
      count: lowStock.length,
      data: lowStock,
    });
  } catch (error) {
    console.error('[Inventory Low-Stock Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/inventory/adjustments
 * Record stock received or manual adjustments with strict validation and audit logging
 */
router.post('/adjustments', authenticateJWT, async (req, res) => {
  try {
    const { sku, productId, adjustmentType, quantity, reason = '', referenceId = '' } = req.body;

    const numQty = Number(quantity);
    if (!sku && !productId) {
      return res.status(400).json({ success: false, message: 'Product SKU or ID is required.' });
    }
    if (isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive quantity is required.' });
    }

    const validTypes = ['STOCK_RECEIVED', 'MANUAL_ADJUSTMENT', 'DAMAGE', 'RETURN'];
    if (!validTypes.includes(adjustmentType)) {
      return res.status(400).json({
        success: false,
        message: `Adjustment type must be one of: ${validTypes.join(', ')}`,
      });
    }

    const isAdditive = adjustmentType === 'STOCK_RECEIVED' || adjustmentType === 'RETURN';
    const cleanSku = sku ? String(sku).trim().toUpperCase() : null;

    if (isDatabaseConnected()) {
      const query = cleanSku ? { sku: cleanSku } : { _id: productId };
      const product = await Product.findOne(query);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      const previousStock = product.availableStock;
      let newStock = previousStock;

      if (isAdditive) {
        newStock = previousStock + numQty;
      } else {
        // Reductive adjustment (DAMAGE or MANUAL_ADJUSTMENT reduction)
        if (previousStock < numQty) {
          return res.status(400).json({
            success: false,
            message: `Cannot deduct ${numQty} units. Only ${previousStock} units are currently in stock. Stock cannot fall below zero.`,
          });
        }
        newStock = previousStock - numQty;
      }

      product.availableStock = newStock;
      await product.save();

      const signedQty = isAdditive ? numQty : -numQty;

      const movement = new InventoryMovement({
        product: product._id,
        sku: product.sku,
        productName: product.name,
        movementType: adjustmentType,
        quantity: signedQty,
        previousStock,
        newStock,
        reason: reason || `${adjustmentType} performed by ${req.user?.name || 'Staff'}`,
        referenceId: referenceId || `ADJ-${Date.now().toString().slice(-6)}`,
        performedBy: {
          id: req.user?.id || 'staff',
          name: req.user?.name || 'Store Staff',
          role: req.user?.role || 'Staff',
        },
      });

      await movement.save();

      return res.json({
        success: true,
        message: `Stock successfully adjusted for ${product.name}. New stock: ${newStock} ${product.unit}.`,
        product,
        movement,
      });
    }

    // In-Memory Fallback
    const memStore = getProductsStore();
    const product = memStore.find((p) => p.sku === cleanSku || p.id === productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const previousStock = product.availableStock;
    let newStock = previousStock;

    if (isAdditive) {
      newStock = previousStock + numQty;
    } else {
      if (previousStock < numQty) {
        return res.status(400).json({
          success: false,
          message: `Cannot deduct ${numQty} units. Only ${previousStock} units in stock.`,
        });
      }
      newStock = previousStock - numQty;
    }

    product.availableStock = newStock;
    product.updatedAt = new Date();

    const signedQty = isAdditive ? numQty : -numQty;
    const movement = {
      id: `mov-${Date.now()}`,
      sku: product.sku,
      productName: product.name,
      movementType: adjustmentType,
      quantity: signedQty,
      previousStock,
      newStock,
      reason: reason || `${adjustmentType} recorded`,
      referenceId: referenceId || `ADJ-${Date.now().toString().slice(-6)}`,
      performedBy: {
        id: req.user?.id || 'staff',
        name: req.user?.name || 'Store Staff',
        role: req.user?.role || 'Staff',
      },
      timestamp: new Date(),
    };

    getMovementsStore().unshift(movement);

    return res.json({
      success: true,
      message: `Stock successfully adjusted for ${product.name}. New stock: ${newStock} ${product.unit}.`,
      product,
      movement,
    });
  } catch (error) {
    console.error('[Inventory Adjustment Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/inventory/movements
 * Audit trail and history of all stock deductions, receipts, and manual adjustments
 */
router.get('/movements', async (req, res) => {
  try {
    const { sku, movementType, limit = 50 } = req.query;

    if (isDatabaseConnected()) {
      const query = {};
      if (sku) query.sku = String(sku).trim().toUpperCase();
      if (movementType && movementType !== 'All') query.movementType = movementType;

      const movements = await InventoryMovement.find(query)
        .sort({ timestamp: -1, createdAt: -1 })
        .limit(Number(limit));

      return res.json({
        success: true,
        count: movements.length,
        data: movements,
      });
    }

    // In-memory fallback
    let list = [...getMovementsStore()];
    if (sku) {
      const qSku = String(sku).trim().toUpperCase();
      list = list.filter((m) => m.sku === qSku);
    }
    if (movementType && movementType !== 'All') {
      list = list.filter((m) => m.movementType === movementType);
    }

    list = list.slice(0, Number(limit));

    return res.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    console.error('[Inventory Movements Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
