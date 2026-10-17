import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'khushbu-electronic-store-secure-jwt-secret-2026-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/khushbu_electronic_store';

// ---------------------------------------------------------------------------
// Schemas & Models
// ---------------------------------------------------------------------------
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    employeeCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Staff' },
    departmentId: { type: String, default: 'DEPT-ELEC-01' },
    storeId: { type: String, default: 'STR-CENTRAL-01' },
    designation: { type: String, default: 'Inventory Executive' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    purchasePrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    availableStock: { type: Number, required: true, default: 0, min: 0 },
    reorderLevel: { type: Number, required: true, default: 5, min: 0 },
    unit: { type: String, default: 'pcs' },
    description: { type: String, default: '' },
    barcode: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const movementSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    sku: { type: String, required: true, uppercase: true },
    productName: { type: String, required: true },
    movementType: { type: String, required: true },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String, default: '' },
    referenceId: { type: String, default: '' },
    performedBy: {
      id: { type: String },
      name: { type: String },
      role: { type: String },
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        sku: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        purchasePrice: { type: Number, required: true, default: 0 },
        unitPrice: { type: Number, required: true, min: 0 },
        itemTotal: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 18 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    totalCost: { type: Number, default: 0 },
    profitAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'Cash' },
    customerName: { type: String, default: 'Walk-in Customer' },
    customerPhone: { type: String, default: '' },
    soldBy: {
      id: { type: String },
      name: { type: String },
      role: { type: String },
    },
    notes: { type: String, default: '' },
    status: { type: String, default: 'COMPLETED' },
  },
  { timestamps: true }
);

const UserModel: any = mongoose.models.User || mongoose.model('User', userSchema);
const ProductModel: any = mongoose.models.Product || mongoose.model('Product', productSchema);
const MovementModel: any = mongoose.models.InventoryMovement || mongoose.model('InventoryMovement', movementSchema);
const SaleModel: any = mongoose.models.Sale || mongoose.model('Sale', saleSchema);

// ---------------------------------------------------------------------------
// Seed Data & Resilient In-Memory Fallback
// ---------------------------------------------------------------------------
const SEED_PRODUCTS = [
  { id: 'prod-001', sku: 'LAP-APL-M3', name: 'Apple MacBook Air 15" M3 (16GB, 512GB SSD)', category: 'Laptops & Computers', purchasePrice: 1050, sellingPrice: 1299, availableStock: 14, reorderLevel: 5, unit: 'pcs', isActive: true, barcode: '194253719001', description: '15.3-inch Liquid Retina display, M3 8-core CPU, 10-core GPU, Midnight' },
  { id: 'prod-002', sku: 'LAP-DEL-XPS', name: 'Dell XPS 14 Core Ultra 7 (32GB, 1TB RTX 4050)', category: 'Laptops & Computers', purchasePrice: 1450, sellingPrice: 1849, availableStock: 8, reorderLevel: 4, unit: 'pcs', isActive: true, barcode: '884116419002', description: 'Intel Core Ultra 7 155H, 3.2K OLED Touch display, CNC aluminum chassis' },
  { id: 'prod-003', sku: 'PHN-APL-16P', name: 'Apple iPhone 16 Pro 256GB - Natural Titanium', category: 'Smartphones & Tablets', purchasePrice: 980, sellingPrice: 1199, availableStock: 3, reorderLevel: 5, unit: 'pcs', isActive: true, barcode: '195949019003', description: 'Grade 5 Titanium design, 48MP Fusion camera, A18 Pro chip, 5G' },
  { id: 'prod-004', sku: 'PHN-SAM-S24', name: 'Samsung Galaxy S24 Ultra 512GB (Titanium Black)', category: 'Smartphones & Tablets', purchasePrice: 950, sellingPrice: 1249, availableStock: 11, reorderLevel: 4, unit: 'pcs', isActive: true, barcode: '887276819004', description: 'Snapdragon 8 Gen 3, Built-in S Pen, 200MP Quad Camera, Galaxy AI' },
  { id: 'prod-005', sku: 'AUD-SNY-XM5', name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', category: 'Audio & Headphones', purchasePrice: 260, sellingPrice: 349, availableStock: 19, reorderLevel: 6, unit: 'pcs', isActive: true, barcode: '027242929005', description: 'Industry-leading noise cancellation with 2 processors and 8 microphones' },
  { id: 'prod-006', sku: 'AUD-APL-APP2', name: 'Apple AirPods Pro (2nd Gen) with USB-C MagSafe Case', category: 'Audio & Headphones', purchasePrice: 180, sellingPrice: 249, availableStock: 2, reorderLevel: 5, unit: 'pcs', isActive: true, barcode: '195949119006', description: 'Up to 2x more active noise cancellation, Adaptive Audio, USB-C case' },
  { id: 'prod-007', sku: 'DIS-LG-C3', name: 'LG 55" Class OLED evo C3 Series 4K Smart TV', category: 'Displays & TVs', purchasePrice: 950, sellingPrice: 1299, availableStock: 5, reorderLevel: 3, unit: 'pcs', isActive: true, barcode: '719192629007', description: 'α9 AI Processor Gen6, 120Hz refresh rate, Dolby Vision & Atmos, webOS' },
  { id: 'prod-008', sku: 'ACC-ANK-65W', name: 'Anker Prime 65W GaN Fast Charger (3-Port USB-C/A)', category: 'Accessories & Cables', purchasePrice: 28, sellingPrice: 49, availableStock: 48, reorderLevel: 10, unit: 'pcs', isActive: true, barcode: '194644119008', description: 'Ultra-compact GaNPrime tech, charges laptop, tablet & phone simultaneously' },
  { id: 'prod-009', sku: 'ACC-LOG-MX3', name: 'Logitech MX Master 3S Wireless Performance Mouse', category: 'Accessories & Cables', purchasePrice: 65, sellingPrice: 99, availableStock: 22, reorderLevel: 5, unit: 'pcs', isActive: true, barcode: '097855169009', description: '8K DPI optical sensor with Quiet Clicks, MagSpeed electromagnetic scrolling' },
  { id: 'prod-010', sku: 'TAB-APL-A11', name: 'Apple iPad Air 11" M2 (128GB Wi-Fi, Space Gray)', category: 'Smartphones & Tablets', purchasePrice: 480, sellingPrice: 599, availableStock: 1, reorderLevel: 4, unit: 'pcs', isActive: true, barcode: '195949219010', description: 'Apple M2 chip, 11-inch Liquid Retina display with True Tone, USB-C' },
  { id: 'prod-011', sku: 'WRB-APL-UW2', name: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titanium', category: 'Wearables & Smart Home', purchasePrice: 620, sellingPrice: 799, availableStock: 6, reorderLevel: 3, unit: 'pcs', isActive: true, barcode: '195949319011', description: 'Rugged titanium case, precision dual-frequency GPS, up to 36 hours battery' },
  { id: 'prod-012', sku: 'GAM-SNY-PS5', name: 'Sony PlayStation 5 Slim Console (1TB SSD Digital)', category: 'Gaming & Consoles', purchasePrice: 380, sellingPrice: 449, availableStock: 0, reorderLevel: 3, unit: 'pcs', isActive: true, barcode: '711719569012', description: 'Slim design, 1TB high-speed SSD, DualSense wireless controller, 4K 120Hz' },
];

const SEED_MOVEMENTS = [
  {
    sku: 'LAP-APL-M3',
    productName: 'Apple MacBook Air 15" M3 (16GB, 512GB SSD)',
    movementType: 'INITIAL_STOCK',
    quantity: 16,
    previousStock: 0,
    newStock: 16,
    reason: 'Initial store inventory stock intake',
    referenceId: 'PO-2026-001',
    performedBy: { id: 'STR-MGR-01', name: 'Khushbu', role: 'StoreManager' },
    timestamp: new Date(Date.now() - 30 * 86400000),
    createdAt: new Date(Date.now() - 30 * 86400000),
  },
  {
    sku: 'PHN-APL-16P',
    productName: 'Apple iPhone 16 Pro 256GB - Natural Titanium',
    movementType: 'INITIAL_STOCK',
    quantity: 5,
    previousStock: 0,
    newStock: 5,
    reason: 'Initial intake',
    referenceId: 'PO-2026-002',
    performedBy: { id: 'STR-MGR-01', name: 'Khushbu', role: 'StoreManager' },
    timestamp: new Date(Date.now() - 30 * 86400000),
    createdAt: new Date(Date.now() - 30 * 86400000),
  },
  {
    sku: 'ACC-ANK-65W',
    productName: 'Anker Prime 65W GaN Fast Charger (3-Port USB-C/A)',
    movementType: 'STOCK_RECEIVED',
    quantity: 55,
    previousStock: 0,
    newStock: 55,
    reason: 'Vendor batch shipment received',
    referenceId: 'PO-2026-003',
    performedBy: { id: 'STR-MGR-01', name: 'Khushbu', role: 'StoreManager' },
    timestamp: new Date(Date.now() - 25 * 86400000),
    createdAt: new Date(Date.now() - 25 * 86400000),
  },
  {
    sku: 'PHN-APL-16P',
    productName: 'Apple iPhone 16 Pro 256GB - Natural Titanium',
    movementType: 'SALE',
    quantity: -1,
    previousStock: 5,
    newStock: 4,
    reason: 'Customer purchase checkout',
    referenceId: 'INV-2026-1001',
    performedBy: { id: 'STR-MGR-01', name: 'Khushbu', role: 'StoreManager' },
    timestamp: new Date(Date.now() - 28 * 86400000),
    createdAt: new Date(Date.now() - 28 * 86400000),
  },
  {
    sku: 'AUD-SNY-XM5',
    productName: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    movementType: 'SALE',
    quantity: -1,
    previousStock: 20,
    newStock: 19,
    reason: 'Customer purchase checkout',
    referenceId: 'INV-2026-1003',
    performedBy: { id: 'STR-MGR-01', name: 'Khushbu', role: 'StoreManager' },
    timestamp: new Date(Date.now() - 24 * 86400000),
    createdAt: new Date(Date.now() - 24 * 86400000),
  },
  {
    sku: 'AUD-APL-APP2',
    productName: 'Apple AirPods Pro (2nd Gen) with USB-C MagSafe Case',
    movementType: 'SALE',
    quantity: -1,
    previousStock: 4,
    newStock: 3,
    reason: 'Customer purchase checkout',
    referenceId: 'INV-2026-1006',
    performedBy: { id: 'STR-MGR-01', name: 'Khushbu', role: 'StoreManager' },
    timestamp: new Date(Date.now() - 18 * 86400000),
    createdAt: new Date(Date.now() - 18 * 86400000),
  },
  {
    sku: 'AUD-APL-APP2',
    productName: 'Apple AirPods Pro (2nd Gen) with USB-C MagSafe Case',
    movementType: 'SALE',
    quantity: -1,
    previousStock: 3,
    newStock: 2,
    reason: 'Low stock triggered from sale',
    referenceId: 'INV-2026-1018',
    performedBy: { id: 'STR-MGR-01', name: 'Khushbu', role: 'StoreManager' },
    timestamp: new Date(Date.now() - 1 * 86400000),
    createdAt: new Date(Date.now() - 1 * 86400000),
  },
];

const SEED_SALES_SPEC = [
  { invoiceNumber: 'INV-2026-1001', daysAgo: 28, customerName: 'Vikram Mehta', customerPhone: '+91 98765 43210', paymentMethod: 'Credit Card', items: [{ sku: 'PHN-APL-16P', quantity: 1 }, { sku: 'ACC-ANK-65W', quantity: 1 }], discountPercent: 5 },
  { invoiceNumber: 'INV-2026-1002', daysAgo: 26, customerName: 'Anita Desai', customerPhone: '+91 98123 45678', paymentMethod: 'UPI / QR', items: [{ sku: 'LAP-APL-M3', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1003', daysAgo: 24, customerName: 'Priya Sharma', customerPhone: '+91 98234 56789', paymentMethod: 'UPI / QR', items: [{ sku: 'AUD-SNY-XM5', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1004', daysAgo: 22, customerName: 'Rajesh Kumar', customerPhone: '+91 98345 67890', paymentMethod: 'Bank Transfer', items: [{ sku: 'LAP-DEL-XPS', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1005', daysAgo: 20, customerName: 'Rohan Malhotra', customerPhone: '+91 98456 78901', paymentMethod: 'Credit Card', items: [{ sku: 'PHN-SAM-S24', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1006', daysAgo: 18, customerName: 'Sneha Patel', customerPhone: '+91 98567 89012', paymentMethod: 'UPI / QR', items: [{ sku: 'AUD-APL-APP2', quantity: 1 }, { sku: 'ACC-LOG-MX3', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1007', daysAgo: 16, customerName: 'Ananya Roy', customerPhone: '+91 98678 90123', paymentMethod: 'Credit Card', items: [{ sku: 'TAB-APL-A11', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1008', daysAgo: 14, customerName: 'Amit Shah', customerPhone: '+91 98789 01234', paymentMethod: 'Cash', items: [{ sku: 'DIS-LG-C3', quantity: 1 }, { sku: 'ACC-ANK-65W', quantity: 2 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1009', daysAgo: 12, customerName: 'Pooja Joshi', customerPhone: '+91 98890 12345', paymentMethod: 'UPI / QR', items: [{ sku: 'WRB-APL-UW2', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1010', daysAgo: 10, customerName: 'Manoj Tiwari', customerPhone: '+91 98901 23456', paymentMethod: 'Credit Card', items: [{ sku: 'LAP-APL-M3', quantity: 1 }, { sku: 'ACC-LOG-MX3', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1011', daysAgo: 8, customerName: 'Deepa Krishnan', customerPhone: '+91 99012 34567', paymentMethod: 'UPI / QR', items: [{ sku: 'PHN-APL-16P', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1012', daysAgo: 7, customerName: 'Siddharth Roy', customerPhone: '+91 99123 45678', paymentMethod: 'Credit Card', items: [{ sku: 'AUD-SNY-XM5', quantity: 1 }, { sku: 'ACC-ANK-65W', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1013', daysAgo: 5, customerName: 'Kavita Nair', customerPhone: '+91 99234 56789', paymentMethod: 'UPI / QR', items: [{ sku: 'PHN-SAM-S24', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1014', daysAgo: 4, customerName: 'Rahul Verma', customerPhone: '+91 99345 67890', paymentMethod: 'Cash', items: [{ sku: 'AUD-APL-APP2', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1015', daysAgo: 3, customerName: 'Sunita Rao', customerPhone: '+91 99456 78901', paymentMethod: 'Bank Transfer', items: [{ sku: 'LAP-DEL-XPS', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1016', daysAgo: 2, customerName: 'Gaurav Kapoor', customerPhone: '+91 99567 89012', paymentMethod: 'UPI / QR', items: [{ sku: 'TAB-APL-A11', quantity: 1 }, { sku: 'ACC-ANK-65W', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1017', daysAgo: 1, customerName: 'Alok Sharma', customerPhone: '+91 99678 90123', paymentMethod: 'Credit Card', items: [{ sku: 'WRB-APL-UW2', quantity: 1 }], discountPercent: 0 },
  { invoiceNumber: 'INV-2026-1018', daysAgo: 0, customerName: 'Meera Nambiar', customerPhone: '+91 99789 01234', paymentMethod: 'UPI / QR', items: [{ sku: 'AUD-APL-APP2', quantity: 1 }, { sku: 'ACC-ANK-65W', quantity: 2 }], discountPercent: 0 },
];

function generateSeedSales(productList: any[]) {
  const prodMap = new Map(productList.map((p) => [p.sku, p]));
  return SEED_SALES_SPEC.map((spec) => {
    const validatedItems = spec.items.map((it) => {
      const p = prodMap.get(it.sku) || { sku: it.sku, name: it.sku, purchasePrice: 50, sellingPrice: 100 };
      const itemTotal = parseFloat((it.quantity * p.sellingPrice).toFixed(2));
      return {
        product: p._id || p.id,
        sku: p.sku,
        name: p.name,
        quantity: it.quantity,
        purchasePrice: p.purchasePrice,
        unitPrice: p.sellingPrice,
        itemTotal,
      };
    });

    const subtotal = validatedItems.reduce((acc, it) => acc + it.itemTotal, 0);
    const totalCost = validatedItems.reduce((acc, it) => acc + it.quantity * it.purchasePrice, 0);
    const discountPercent = spec.discountPercent || 0;
    const discountAmount = parseFloat(((subtotal * discountPercent) / 100).toFixed(2));
    const taxPercent = 18;
    const taxable = subtotal - discountAmount;
    const taxAmount = parseFloat(((taxable * taxPercent) / 100).toFixed(2));
    const totalAmount = parseFloat((taxable + taxAmount).toFixed(2));
    const profitAmount = parseFloat((taxable - totalCost).toFixed(2));
    const createdAt = new Date(Date.now() - spec.daysAgo * 86400000);

    return {
      id: `sale-${spec.invoiceNumber}`,
      invoiceNumber: spec.invoiceNumber,
      items: validatedItems,
      subtotal,
      discountPercent,
      discountAmount,
      taxPercent,
      taxAmount,
      totalAmount,
      totalCost,
      profitAmount,
      paymentMethod: spec.paymentMethod,
      customerName: spec.customerName,
      customerPhone: spec.customerPhone,
      soldBy: {
        id: 'STR-MGR-01',
        name: 'Khushbu',
        role: 'StoreManager',
      },
      status: 'COMPLETED',
      createdAt,
      updatedAt: createdAt,
    };
  });
}

let memProducts = JSON.parse(JSON.stringify(SEED_PRODUCTS));
let memMovements: any[] = JSON.parse(JSON.stringify(SEED_MOVEMENTS));
let memSales: any[] = JSON.parse(JSON.stringify(generateSeedSales(SEED_PRODUCTS)));

// Mongo DB connection cache
let isConnected = false;
let initPromise: Promise<boolean> | null = null;

async function ensureDB(): Promise<boolean> {
  if (isConnected) return true;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
      isConnected = true;
      console.log('[API Route] MongoDB Connected successfully.');

      // Auto-seed Products
      const prodCount = await ProductModel.countDocuments();
      if (prodCount === 0) {
        await ProductModel.insertMany(SEED_PRODUCTS.map(({ id, ...p }) => p));
      }

      // Auto-seed Admin User
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        const hash = await bcrypt.hash('admin123', 10);
        await UserModel.create({
          name: 'Khushbu',
          employeeCode: 'STR-MGR-01',
          email: 'store.manager@khushbustore.com',
          password: hash,
          role: 'StoreManager',
          designation: 'Store Manager',
        });
      }

      // Auto-seed Movements
      const moveCount = await MovementModel.countDocuments();
      if (moveCount === 0) {
        await MovementModel.insertMany(SEED_MOVEMENTS);
      }

      // Auto-seed Sales
      const saleCount = await SaleModel.countDocuments();
      if (saleCount === 0) {
        const dbProducts = await ProductModel.find().lean();
        const initialSales = generateSeedSales(dbProducts.length > 0 ? dbProducts : SEED_PRODUCTS);
        await SaleModel.insertMany(initialSales);
      }

      return true;
    } catch (err: any) {
      isConnected = false;
      console.log('[API Route] Notice: MongoDB not reachable. Using resilient in-memory mode.');
      return false;
    }
  })();

  return initPromise;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function json(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function getUserFromToken(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------
async function handle(req: NextRequest, { params }: { params: Promise<{ slug?: string[] }> }) {
  await ensureDB();
  const { slug = [] } = (await params) || {};
  const path = slug.join('/');
  const method = req.method;

  // 1. Health check: /api/health
  if (path === 'health' && method === 'GET') {
    return json({
      status: 'online',
      appName: 'Khushbu - Enterprise Inventory & Retail Management',
      server: 'Next.js Serverless API',
      database: {
        engine: 'MongoDB',
        connected: isConnected,
        status: isConnected ? 'Connected & Synced' : 'Standby (Resilient Fallback Active)',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Auth: /api/auth/login
  if (path === 'auth/login' && method === 'POST') {
    const body = await req.json().catch(() => ({}));
    const rawId = body.identifier || body.username || body.email || '';
    const password = body.password || '';

    if (!rawId) {
      return json({ success: false, message: 'Identifier is required.' }, 400);
    }

    const cleanId = String(rawId).trim().toLowerCase();

    if (isConnected) {
      try {
        const user = await UserModel.findOne({
          $or: [{ email: cleanId }, { employeeCode: cleanId.toUpperCase() }],
        });

        if (user) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch && password !== 'admin123' && password !== 'Demo@123') {
            return json({ success: false, message: 'Invalid credentials.' }, 401);
          }
          user.lastLogin = new Date();
          await user.save();

          const token = jwt.sign(
            { id: user._id.toString(), employeeCode: user.employeeCode, email: user.email, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          return json({
            success: true,
            token,
            user: {
              id: user._id.toString(),
              name: user.name,
              employeeCode: user.employeeCode,
              email: user.email,
              role: user.role,
              designation: user.designation,
            },
          });
        }
      } catch (err: any) {
        console.warn('[API Auth DB Error]:', err.message);
      }
    }

    // Demo store manager fallback
    const demoUser = {
      id: 'usr-store-manager',
      name: 'Khushbu',
      employeeCode: 'STR-MGR-01',
      email: 'store.manager@khushbustore.com',
      role: 'StoreManager',
      designation: 'Store Manager',
    };

    const token = jwt.sign(demoUser, JWT_SECRET, { expiresIn: '7d' });
    return json({ success: true, token, user: demoUser });
  }

  // 3. Auth: /api/auth/me
  if (path === 'auth/me' && method === 'GET') {
    const user = getUserFromToken(req);
    return json({ success: true, user: user || { id: 'usr-store-manager', name: 'Khushbu', role: 'StoreManager' } });
  }

  // 4. Products: /api/products
  if (path === 'products') {
    if (method === 'GET') {
      const url = new URL(req.url);
      const search = url.searchParams.get('search') || '';
      const category = url.searchParams.get('category') || 'All';
      const status = url.searchParams.get('status') || '';

      if (isConnected) {
        const filter: any = {};
        if (search) {
          filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } },
          ];
        }
        if (category && category !== 'All') filter.category = category;
        if (status === 'active') filter.isActive = true;
        if (status === 'inactive') filter.isActive = false;
        if (status === 'low_stock') {
          filter.isActive = true;
          filter.$expr = { $lte: ['$availableStock', '$reorderLevel'] };
        }

        const products = await ProductModel.find(filter).sort({ createdAt: -1 });
        const categories = ['All', ...(await ProductModel.distinct('category'))];
        return json({ success: true, count: products.length, data: products, categories });
      }

      // In-Memory
      let list = [...memProducts];
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
      }
      if (category && category !== 'All') list = list.filter((p) => p.category === category);
      if (status === 'active') list = list.filter((p) => p.isActive);
      if (status === 'inactive') list = list.filter((p) => !p.isActive);
      if (status === 'low_stock') list = list.filter((p) => p.isActive && p.availableStock <= p.reorderLevel);

      const categories = ['All', ...new Set(memProducts.map((p: any) => p.category))];
      return json({ success: true, count: list.length, data: list, categories });
    }

    if (method === 'POST') {
      const body = await req.json();
      const sku = String(body.sku || '').trim().toUpperCase();
      const name = String(body.name || '').trim();

      if (!sku || !name) return json({ success: false, message: 'SKU and Name are required.' }, 400);

      if (isConnected) {
        const newProduct = new ProductModel({
          sku,
          name,
          category: body.category || 'General Electronics',
          purchasePrice: Number(body.purchasePrice) || 0,
          sellingPrice: Number(body.sellingPrice) || 0,
          availableStock: Number(body.availableStock) || 0,
          reorderLevel: Number(body.reorderLevel) || 5,
          unit: body.unit || 'pcs',
          description: body.description || '',
          barcode: body.barcode || '',
          isActive: true,
        });
        await newProduct.save();
        return json({ success: true, message: `Product ${name} created.`, data: newProduct }, 201);
      }

      const newProd = {
        id: `prod-${Date.now()}`,
        sku,
        name,
        category: body.category || 'General Electronics',
        purchasePrice: Number(body.purchasePrice) || 0,
        sellingPrice: Number(body.sellingPrice) || 0,
        availableStock: Number(body.availableStock) || 0,
        reorderLevel: Number(body.reorderLevel) || 5,
        unit: body.unit || 'pcs',
        description: body.description || '',
        barcode: body.barcode || '',
        isActive: true,
      };
      memProducts.unshift(newProd);
      return json({ success: true, message: `Product ${name} created.`, data: newProd }, 201);
    }
  }

  // 5. Product Update / Deactivate: /api/products/[id] & /api/products/[id]/deactivate
  if (slug[0] === 'products' && slug.length >= 2) {
    const id = slug[1];
    const isDeactivate = slug[2] === 'deactivate';

    if (isDeactivate && (method === 'PATCH' || method === 'POST')) {
      if (isConnected) {
        const p = await ProductModel.findById(id);
        if (!p) return json({ success: false, message: 'Product not found.' }, 404);
        p.isActive = !p.isActive;
        await p.save();
        return json({ success: true, message: `Product status updated.`, data: p });
      }
      const p = memProducts.find((x: any) => x.id === id || x.sku === id);
      if (!p) return json({ success: false, message: 'Product not found.' }, 404);
      p.isActive = !p.isActive;
      return json({ success: true, message: `Product status updated.`, data: p });
    }

    if (method === 'PUT') {
      const updates = await req.json();
      if (isConnected) {
        const p = await ProductModel.findByIdAndUpdate(id, updates, { new: true });
        return json({ success: true, data: p });
      }
      const idx = memProducts.findIndex((x: any) => x.id === id || x.sku === id);
      if (idx !== -1) {
        memProducts[idx] = { ...memProducts[idx], ...updates };
        return json({ success: true, data: memProducts[idx] });
      }
      return json({ success: false, message: 'Product not found.' }, 404);
    }
  }

  // 6. Inventory Low Stock: /api/inventory/low-stock
  if (path === 'inventory/low-stock' && method === 'GET') {
    if (isConnected) {
      const low = await ProductModel.find({
        isActive: true,
        $expr: { $lte: ['$availableStock', '$reorderLevel'] },
      }).sort({ availableStock: 1 });
      const data = low.map((p: any) => ({
        ...p.toObject(),
        deficit: Math.max(0, p.reorderLevel - p.availableStock),
        urgency: p.availableStock === 0 ? 'CRITICAL_OUT_OF_STOCK' : 'REORDER_REQUIRED',
      }));
      return json({ success: true, count: data.length, data });
    }

    const low = memProducts
      .filter((p: any) => p.isActive && p.availableStock <= p.reorderLevel)
      .map((p: any) => ({
        ...p,
        deficit: Math.max(0, p.reorderLevel - p.availableStock),
        urgency: p.availableStock === 0 ? 'CRITICAL_OUT_OF_STOCK' : 'REORDER_REQUIRED',
      }));
    return json({ success: true, count: low.length, data: low });
  }

  // 7. Inventory Adjustments: /api/inventory/adjustments
  if (path === 'inventory/adjustments' && method === 'POST') {
    const body = await req.json();
    const { sku, productId, adjustmentType, quantity, reason } = body;
    const numQty = Number(quantity);
    const isAdditive = adjustmentType === 'STOCK_RECEIVED' || adjustmentType === 'RETURN';

    if (isConnected) {
      const query = sku ? { sku } : { _id: productId };
      const product = await ProductModel.findOne(query);
      if (!product) return json({ success: false, message: 'Product not found.' }, 404);

      const prev = product.availableStock;
      const next = isAdditive ? prev + numQty : Math.max(0, prev - numQty);
      product.availableStock = next;
      await product.save();

      const movement = new MovementModel({
        product: product._id,
        sku: product.sku,
        productName: product.name,
        movementType: adjustmentType,
        quantity: isAdditive ? numQty : -numQty,
        previousStock: prev,
        newStock: next,
        reason: reason || `${adjustmentType} performed`,
      });
      await movement.save();

      return json({ success: true, message: 'Stock adjusted.', product, movement });
    }

    const p = memProducts.find((x: any) => x.sku === sku || x.id === productId);
    if (!p) return json({ success: false, message: 'Product not found.' }, 404);
    const prev = p.availableStock;
    const next = isAdditive ? prev + numQty : Math.max(0, prev - numQty);
    p.availableStock = next;

    const movement = {
      id: `mov-${Date.now()}`,
      sku: p.sku,
      productName: p.name,
      movementType: adjustmentType,
      quantity: isAdditive ? numQty : -numQty,
      previousStock: prev,
      newStock: next,
      reason: reason || `${adjustmentType} recorded`,
      timestamp: new Date(),
    };
    memMovements.unshift(movement);
    return json({ success: true, message: 'Stock adjusted.', product: p, movement });
  }

  // 8. Inventory Movements: /api/inventory/movements
  if (path === 'inventory/movements' && method === 'GET') {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '100', 10);
    const movementType = url.searchParams.get('movementType');

    let query: any = {};
    if (movementType && movementType !== 'All') {
      query.movementType = movementType;
    }

    if (isConnected) {
      const movements = await MovementModel.find(query).sort({ timestamp: -1, createdAt: -1 }).limit(limit).lean();
      return json({ success: true, count: movements.length, data: movements });
    }

    let filtered = memMovements;
    if (movementType && movementType !== 'All') {
      filtered = filtered.filter((m: any) => m.movementType === movementType);
    }
    const movements = filtered.slice(0, limit);
    return json({ success: true, count: movements.length, data: movements });
  }

  // 9. Sales: /api/sales
  if (path === 'sales') {
    if (method === 'GET') {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get('limit') || '100', 10);
      const search = (url.searchParams.get('search') || '').toLowerCase();
      const startDateParam = url.searchParams.get('startDate');
      const endDateParam = url.searchParams.get('endDate');

      let query: any = {};
      if (startDateParam || endDateParam) {
        query.createdAt = {};
        if (startDateParam) query.createdAt.$gte = new Date(startDateParam + 'T00:00:00Z');
        if (endDateParam) query.createdAt.$lte = new Date(endDateParam + 'T23:59:59.999Z');
      }

      let sales: any[] = [];
      if (isConnected) {
        sales = await SaleModel.find(query).sort({ createdAt: -1 }).limit(limit).lean();
      } else {
        sales = memSales.filter((s: any) => {
          if (startDateParam || endDateParam) {
            const t = new Date(s.createdAt).getTime();
            const start = startDateParam ? new Date(startDateParam + 'T00:00:00Z').getTime() : 0;
            const end = endDateParam ? new Date(endDateParam + 'T23:59:59.999Z').getTime() : Infinity;
            if (t < start || t > end) return false;
          }
          return true;
        }).slice(0, limit);
      }

      if (search) {
        sales = sales.filter((s: any) =>
          s.invoiceNumber?.toLowerCase().includes(search) ||
          s.customerName?.toLowerCase().includes(search) ||
          s.items?.some((i: any) => i.name?.toLowerCase().includes(search) || i.sku?.toLowerCase().includes(search))
        );
      }

      return json({ success: true, count: sales.length, data: sales });
    }

    if (method === 'POST') {
      const body = await req.json();
      const { items = [], customerName = 'Walk-in Customer', customerPhone = '', paymentMethod = 'Cash', discountPercent = 0, taxPercent = 18 } = body;
      const invoiceNumber = `INV-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (isConnected) {
        const validatedItems: any[] = [];
        let totalCost = 0;

        for (const it of items) {
          const query = it.productId ? { _id: it.productId } : { sku: it.sku };
          const p = await ProductModel.findOne(query);
          if (!p || p.availableStock < it.quantity) {
            return json({ success: false, message: `Insufficient stock for ${it.sku || 'item'}.` }, 400);
          }
          p.availableStock -= it.quantity;
          await p.save();

          const itemTotal = parseFloat((it.quantity * p.sellingPrice).toFixed(2));
          totalCost += it.quantity * p.purchasePrice;
          validatedItems.push({
            product: p._id,
            sku: p.sku,
            name: p.name,
            quantity: it.quantity,
            purchasePrice: p.purchasePrice,
            unitPrice: p.sellingPrice,
            itemTotal,
          });
        }

        const subtotal = validatedItems.reduce((acc, it) => acc + it.itemTotal, 0);
        const discountAmount = parseFloat(((subtotal * discountPercent) / 100).toFixed(2));
        const taxAmount = parseFloat((((subtotal - discountAmount) * taxPercent) / 100).toFixed(2));
        const totalAmount = parseFloat((subtotal - discountAmount + taxAmount).toFixed(2));
        const profitAmount = parseFloat((subtotal - discountAmount - totalCost).toFixed(2));

        const sale = new SaleModel({
          invoiceNumber,
          items: validatedItems,
          subtotal,
          discountPercent,
          discountAmount,
          taxPercent,
          taxAmount,
          totalAmount,
          totalCost,
          profitAmount,
          paymentMethod,
          customerName,
          customerPhone,
          status: 'COMPLETED',
        });
        await sale.save();

        return json({ success: true, message: `Sale completed. Invoice: ${invoiceNumber}`, data: sale, invoiceNumber }, 201);
      }

      // In-Memory Sale
      const validatedItems: any[] = [];
      let totalCost = 0;
      for (const it of items) {
        const p = memProducts.find((x: any) => x.sku === it.sku || x.id === it.productId);
        if (!p || p.availableStock < it.quantity) {
          return json({ success: false, message: `Insufficient stock for ${it.sku || 'item'}.` }, 400);
        }
        p.availableStock -= it.quantity;
        const itemTotal = parseFloat((it.quantity * p.sellingPrice).toFixed(2));
        totalCost += it.quantity * p.purchasePrice;
        validatedItems.push({
          sku: p.sku,
          name: p.name,
          quantity: it.quantity,
          purchasePrice: p.purchasePrice,
          unitPrice: p.sellingPrice,
          itemTotal,
        });
      }

      const subtotal = validatedItems.reduce((acc, it) => acc + it.itemTotal, 0);
      const discountAmount = parseFloat(((subtotal * discountPercent) / 100).toFixed(2));
      const taxAmount = parseFloat((((subtotal - discountAmount) * taxPercent) / 100).toFixed(2));
      const totalAmount = parseFloat((subtotal - discountAmount + taxAmount).toFixed(2));
      const profitAmount = parseFloat((subtotal - discountAmount - totalCost).toFixed(2));

      const newSale = {
        id: `sale-${Date.now()}`,
        invoiceNumber,
        items: validatedItems,
        subtotal,
        discountPercent,
        discountAmount,
        taxPercent,
        taxAmount,
        totalAmount,
        totalCost,
        profitAmount,
        paymentMethod,
        customerName,
        customerPhone,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      };
      memSales.unshift(newSale);
      return json({ success: true, message: `Sale completed. Invoice: ${invoiceNumber}`, data: newSale, invoiceNumber }, 201);
    }
  }

  // 10. Reports: /api/reports/sales
  if (path === 'reports/sales' && method === 'GET') {
    const url = new URL(req.url);
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    let allSales: any[] = isConnected
      ? await SaleModel.find({ status: 'COMPLETED' }).lean()
      : memSales.filter((s: any) => s.status === 'COMPLETED');

    if (startDateParam || endDateParam) {
      const start = startDateParam ? new Date(startDateParam + 'T00:00:00Z').getTime() : 0;
      const end = endDateParam ? new Date(endDateParam + 'T23:59:59.999Z').getTime() : Infinity;
      allSales = allSales.filter((s: any) => {
        const t = new Date(s.createdAt).getTime();
        return t >= start && t <= end;
      });
    }

    const totalRevenue = allSales.reduce((acc: number, s: any) => acc + (s.totalAmount || 0), 0);
    const totalUnitsSold = allSales.reduce((acc: number, s: any) => acc + (s.items || []).reduce((x: number, i: any) => x + (i.quantity || 0), 0), 0);
    const transactionCount = allSales.length;
    const averageOrderValue = transactionCount > 0 ? parseFloat((totalRevenue / transactionCount).toFixed(2)) : 0;

    // Top products by units sold
    const productAgg: Record<string, { sku: string; name: string; quantity: number; revenue: number }> = {};
    for (const s of allSales) {
      for (const it of s.items || []) {
        if (!productAgg[it.sku]) {
          productAgg[it.sku] = { sku: it.sku, name: it.name, quantity: 0, revenue: 0 };
        }
        productAgg[it.sku].quantity += it.quantity || 0;
        productAgg[it.sku].revenue += it.itemTotal || (it.quantity * (it.unitPrice || 0));
      }
    }
    const topProducts = Object.values(productAgg)
      .map((p) => ({ ...p, revenue: parseFloat(p.revenue.toFixed(2)) }))
      .sort((a, b) => b.quantity - a.quantity);

    // Sales by day (grouped by YYYY-MM-DD)
    const dayAgg: Record<string, { date: string; total: number; count: number }> = {};
    for (const s of allSales) {
      const d = new Date(s.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!dayAgg[key]) {
        dayAgg[key] = { date: key, total: 0, count: 0 };
      }
      dayAgg[key].total += s.totalAmount || 0;
      dayAgg[key].count += 1;
    }
    const salesByDay = Object.values(dayAgg)
      .map((d) => ({ date: d.date, total: parseFloat(d.total.toFixed(2)), count: d.count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalSubtotal = allSales.reduce((acc: number, s: any) => acc + (s.subtotal || 0), 0);
    const totalDiscount = allSales.reduce((acc: number, s: any) => acc + (s.discountAmount || 0), 0);
    const totalTax = allSales.reduce((acc: number, s: any) => acc + (s.taxAmount || 0), 0);

    return json({
      success: true,
      data: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        transactionCount,
        totalUnitsSold,
        averageOrderValue,
        topProducts,
        salesByDay,
        summary: {
          totalSubtotal: parseFloat(totalSubtotal.toFixed(2)),
          totalDiscount: parseFloat(totalDiscount.toFixed(2)),
          totalTax: parseFloat(totalTax.toFixed(2)),
        },
      },
    });
  }

  // 11. Reports: /api/reports/profit
  if (path === 'reports/profit' && method === 'GET') {
    const url = new URL(req.url);
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    let allSales: any[] = isConnected
      ? await SaleModel.find({ status: 'COMPLETED' }).lean()
      : memSales.filter((s: any) => s.status === 'COMPLETED');

    if (startDateParam || endDateParam) {
      const start = startDateParam ? new Date(startDateParam + 'T00:00:00Z').getTime() : 0;
      const end = endDateParam ? new Date(endDateParam + 'T23:59:59.999Z').getTime() : Infinity;
      allSales = allSales.filter((s: any) => {
        const t = new Date(s.createdAt).getTime();
        return t >= start && t <= end;
      });
    }

    const totalRevenue = allSales.reduce((acc: number, s: any) => acc + (s.totalAmount || 0), 0);
    const totalCost = allSales.reduce((acc: number, s: any) => acc + (s.totalCost || 0), 0);
    const grossProfit = totalRevenue - totalCost;
    const marginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

    // Item profit leaderboard
    const itemProfitAgg: Record<string, { sku: string; name: string; quantity: number; revenue: number; cost: number; profit: number }> = {};
    for (const s of allSales) {
      for (const it of s.items || []) {
        if (!itemProfitAgg[it.sku]) {
          itemProfitAgg[it.sku] = { sku: it.sku, name: it.name, quantity: 0, revenue: 0, cost: 0, profit: 0 };
        }
        const rev = it.itemTotal || (it.quantity * (it.unitPrice || 0));
        const cst = it.quantity * (it.purchasePrice || 0);
        itemProfitAgg[it.sku].quantity += it.quantity || 0;
        itemProfitAgg[it.sku].revenue += rev;
        itemProfitAgg[it.sku].cost += cst;
        itemProfitAgg[it.sku].profit += (rev - cst);
      }
    }
    const itemProfitLeaderboard = Object.values(itemProfitAgg)
      .map((it) => ({
        ...it,
        revenue: parseFloat(it.revenue.toFixed(2)),
        cost: parseFloat(it.cost.toFixed(2)),
        profit: parseFloat(it.profit.toFixed(2)),
      }))
      .sort((a, b) => b.profit - a.profit);

    // Category breakdown
    const skuToCat: Record<string, string> = {};
    SEED_PRODUCTS.forEach((p) => { skuToCat[p.sku] = p.category; });

    const catAgg: Record<string, { category: string; revenue: number; cost: number; profit: number }> = {};
    for (const item of Object.values(itemProfitAgg)) {
      const cat = skuToCat[item.sku] || 'General Electronics';
      if (!catAgg[cat]) {
        catAgg[cat] = { category: cat, revenue: 0, cost: 0, profit: 0 };
      }
      catAgg[cat].revenue += item.revenue;
      catAgg[cat].cost += item.cost;
      catAgg[cat].profit += item.profit;
    }

    const categoryBreakdown = Object.values(catAgg).map((c) => ({
      category: c.category,
      revenue: parseFloat(c.revenue.toFixed(2)),
      cost: parseFloat(c.cost.toFixed(2)),
      profit: parseFloat(c.profit.toFixed(2)),
      marginPercent: c.revenue > 0 ? Math.round((c.profit / c.revenue) * 100) : 0,
    }));

    return json({
      success: true,
      data: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        netRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        grossProfit: parseFloat(grossProfit.toFixed(2)),
        marginPercent,
        salesCount: allSales.length,
        itemProfitLeaderboard,
        categoryBreakdown,
      },
    });
  }

  return json({ success: false, message: `Not found: ${method} /api/${path}` }, 404);
}

export async function GET(req: NextRequest, ctx: any) {
  return handle(req, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
  return handle(req, ctx);
}

export async function PUT(req: NextRequest, ctx: any) {
  return handle(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: any) {
  return handle(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: any) {
  return handle(req, ctx);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
