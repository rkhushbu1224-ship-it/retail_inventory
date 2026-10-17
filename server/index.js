import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import inventoryRoutes from './routes/inventory.js';
import salesRoutes from './routes/sales.js';
import reportRoutes from './routes/reports.js';
import stateRoutes from './routes/state.js';
import assetRoutes from './routes/assets.js';
import healthRoutes from './routes/health.js';
import directoryRoutes from './routes/directory.js';
import { seedMongoIfEmpty } from './services/retailService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 47191;

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[Khushbu Server] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api', stateRoutes);
app.use('/api', healthRoutes);
app.use('/api', directoryRoutes);

// Root information endpoint documenting all Retail Inventory & Sales Management endpoints
app.get('/', (req, res) => {
  res.json({
    system: 'Khushbu - Retail Inventory & Sales Management System',
    version: '2.0.0',
    techStack: {
      frontend: 'Next.js with React (TypeScript)',
      backend: 'Node.js and Express.js',
      database: 'MongoDB (Mongoose ORM)',
      authentication: 'JWT (JSON Web Token)',
    },
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/me',
      },
      products: {
        listAndFilter: 'GET /api/products?search=&category=&status=',
        create: 'POST /api/products (Admin)',
        update: 'PUT /api/products/:id (Admin)',
        deactivate: 'PATCH /api/products/:id/deactivate (Admin)',
      },
      inventory: {
        lowStock: 'GET /api/inventory/low-stock',
        adjustments: 'POST /api/inventory/adjustments (Stock in & Manual Adjustments)',
        movementsAudit: 'GET /api/inventory/movements',
      },
      sales: {
        createSale: 'POST /api/sales (Atomic stock validation & invoice generation)',
        listSales: 'GET /api/sales?startDate=&endDate=&search=',
        getSaleById: 'GET /api/sales/:id',
      },
      reports: {
        salesReport: 'GET /api/reports/sales?startDate=&endDate=',
        profitReport: 'GET /api/reports/profit?startDate=&endDate=',
      },
      health: 'GET /api/health',
    },
  });
});

// Start server and initialize database concurrently
const startServer = () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(`  KHUSHBU ELECTRONIC STORE - RETAIL INVENTORY & SALES SYSTEM     `);
    console.log(`  Backend: Node.js & Express.js running on http://localhost:${PORT}`);
    console.log(`  Database: MongoDB (with Resilient In-Memory Fallback)         `);
    console.log(`  Authentication: JWT Bearer Protection Active                  `);
    console.log(`================================================================`);
  });

  // Connect MongoDB & seed initial catalog
  connectDB()
    .then(() => seedMongoIfEmpty())
    .catch((err) => console.log('[MongoDB Notice]:', err.message));
};

startServer();

export default app;
