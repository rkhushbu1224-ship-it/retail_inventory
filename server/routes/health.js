import express from 'express';
import { isDatabaseConnected } from '../config/db.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Khushbu - Enterprise Inventory & Retail Management',
    server: 'Node.js & Express.js',
    database: {
      engine: 'MongoDB',
      connected: isDatabaseConnected(),
      status: isDatabaseConnected() ? 'Connected & Synced' : 'Offline / Standby (Resilient Fallback Active)',
    },
    authentication: 'JWT (JSON Web Token)',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

export default router;
