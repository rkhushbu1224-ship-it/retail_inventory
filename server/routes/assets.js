import express from 'express';
import { Asset } from '../models/Asset.js';
import { authenticateJWT, authorizeRoles } from '../middleware/auth.js';
import { isDatabaseConnected } from '../config/db.js';

const router = express.Router();

/**
 * GET /api/assets
 * Lists all electronic assets with optional category, status, and search filters
 */
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;

    if (isDatabaseConnected()) {
      const query = {};
      if (category) query.category = category;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { itemName: { $regex: search, $options: 'i' } },
          { assetTag: { $regex: search, $options: 'i' } },
          { serialNo: { $regex: search, $options: 'i' } },
          { make: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } },
        ];
      }
      const assets = await Asset.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: assets.length, data: assets });
    }

    return res.json({
      success: true,
      message: 'MongoDB in resilient mode; electronic assets are managed via /api/state sync.',
      count: 0,
      data: [],
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/assets
 * Registers a new electronic item into inventory (Protected by JWT)
 */
router.post('/', authenticateJWT, async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      const { assetTag, itemName, category, make, model, serialNo, purchasePrice, warrantyExpiry } = req.body;

      if (!assetTag || !itemName) {
        return res.status(400).json({ success: false, message: 'assetTag and itemName are required.' });
      }

      const asset = new Asset({
        assetTag,
        itemName,
        category: category || 'Consumer Electronics',
        make,
        model,
        serialNo,
        purchasePrice: purchasePrice || 0,
        warrantyExpiry,
        status: req.body.status || 'In_Stock',
        storeId: req.body.storeId || 'STR-CENTRAL-01',
        departmentId: req.body.departmentId || 'DEPT-ELEC-01',
        locationRoom: req.body.locationRoom || 'Main Warehouse',
      });

      await asset.save();
      return res.status(201).json({ success: true, message: 'Electronic asset registered', data: asset });
    }

    return res.status(201).json({
      success: true,
      message: 'Electronic asset created in memory mode.',
      data: req.body,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
