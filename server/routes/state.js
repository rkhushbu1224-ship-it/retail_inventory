import express from 'express';
import { PortalState } from '../models/PortalState.js';
import { isDatabaseConnected } from '../config/db.js';

const router = express.Router();

// In-memory state cache when MongoDB is connecting or operating in resilient mode
let memoryState = null;
let memoryRevision = 1;

/**
 * GET /api/state
 * Retrieves complete enterprise portal state snapshot from MongoDB
 */
router.get('/state', async (req, res) => {
  try {
    if (isDatabaseConnected()) {
      const doc = await PortalState.findOne({ stateId: 'portal_state_1' });
      if (doc) {
        return res.json({
          revision: doc.revision,
          payload: doc.payload,
          data: doc.payload,
          source: 'mongodb',
          updatedAt: doc.updatedAt,
        });
      }
    }

    if (memoryState) {
      return res.json({
        revision: memoryRevision,
        payload: memoryState,
        data: memoryState,
        source: 'memory_cache',
      });
    }

    return res.json({
      revision: 1,
      payload: null,
      data: null,
      isInitial: true,
      message: 'Initial state ready. Frontend will initialize default electronics catalogue.',
    });
  } catch (error) {
    console.error('[State GET Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/state
 * Persists complete enterprise portal state snapshot into MongoDB with optimistic locking
 */
router.put('/state', async (req, res) => {
  try {
    const payload = req.body.payload || req.body.data;
    const revision = req.body.revision !== undefined ? req.body.revision : req.body.expectedRevision;

    if (!payload) {
      return res.status(400).json({ error: 'Payload (or data) is required.' });
    }

    if (isDatabaseConnected()) {
      const existing = await PortalState.findOne({ stateId: 'portal_state_1' });
      const currentRev = existing ? existing.revision : 0;

      // Optimistic concurrency check (if revision supplied)
      if (existing && revision !== undefined && revision !== currentRev) {
        return res.status(409).json({
          error: 'Conflict: Stale state revision.',
          currentRevision: currentRev,
          submittedRevision: revision,
        });
      }

      const nextRev = (existing ? existing.revision : 0) + 1;
      const updated = await PortalState.findOneAndUpdate(
        { stateId: 'portal_state_1' },
        {
          revision: nextRev,
          payload: payload,
        },
        { upsert: true, new: true }
      );

      memoryState = payload;
      memoryRevision = nextRev;

      return res.json({
        success: true,
        revision: updated.revision,
        message: 'Portal state synced and persisted into MongoDB.',
      });
    }

    // Resilient fallback memory cache
    memoryRevision = (revision || memoryRevision) + 1;
    memoryState = payload;

    return res.json({
      success: true,
      revision: memoryRevision,
      message: 'Portal state cached in server memory (MongoDB offline).',
    });
  } catch (error) {
    console.error('[State PUT Error]:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
