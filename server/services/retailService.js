import { Product } from '../models/Product.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { Sale } from '../models/Sale.js';
import { User } from '../models/User.js';
import { isDatabaseConnected } from '../config/db.js';

// Pre-seeded initial catalog for Khushbu Electronic Store
export const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    sku: 'LAP-APL-M3',
    name: 'Apple MacBook Air 15" M3 (16GB, 512GB SSD)',
    category: 'Laptops & Computers',
    purchasePrice: 1050,
    sellingPrice: 1299,
    availableStock: 14,
    reorderLevel: 5,
    unit: 'pcs',
    isActive: true,
    barcode: '194253719001',
    description: '15.3-inch Liquid Retina display, M3 8-core CPU, 10-core GPU, Midnight',
  },
  {
    id: 'prod-002',
    sku: 'LAP-DL-XPS',
    name: 'Dell XPS 15 OLED Touch (Core i7, 32GB, RTX 4060)',
    category: 'Laptops & Computers',
    purchasePrice: 1350,
    sellingPrice: 1699,
    availableStock: 8,
    reorderLevel: 4,
    unit: 'pcs',
    isActive: true,
    barcode: '884116429002',
    description: '3.5K OLED InfinityEdge touch display, Platinum silver machined aluminum',
  },
  {
    id: 'prod-003',
    sku: 'PHN-APL-16P',
    name: 'Apple iPhone 16 Pro 256GB - Natural Titanium',
    category: 'Smartphones & Tablets',
    purchasePrice: 980,
    sellingPrice: 1199,
    availableStock: 3,
    reorderLevel: 5,
    unit: 'pcs',
    isActive: true,
    barcode: '195949019003',
    description: 'Grade 5 Titanium design, 48MP Fusion camera, A18 Pro chip, 5G',
  },
  {
    id: 'prod-004',
    sku: 'PHN-SAM-S24',
    name: 'Samsung Galaxy S24 Ultra 512GB (Titanium Black)',
    category: 'Smartphones & Tablets',
    purchasePrice: 950,
    sellingPrice: 1249,
    availableStock: 11,
    reorderLevel: 4,
    unit: 'pcs',
    isActive: true,
    barcode: '887276819004',
    description: 'Snapdragon 8 Gen 3, Built-in S Pen, 200MP Quad Camera, Galaxy AI',
  },
  {
    id: 'prod-005',
    sku: 'AUD-SNY-XM5',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    category: 'Audio & Headphones',
    purchasePrice: 260,
    sellingPrice: 349,
    availableStock: 19,
    reorderLevel: 6,
    unit: 'pcs',
    isActive: true,
    barcode: '027242929005',
    description: 'Industry-leading noise cancellation with 2 processors and 8 microphones',
  },
  {
    id: 'prod-006',
    sku: 'AUD-APL-APP2',
    name: 'Apple AirPods Pro (2nd Gen) with USB-C MagSafe Case',
    category: 'Audio & Headphones',
    purchasePrice: 180,
    sellingPrice: 249,
    availableStock: 2,
    reorderLevel: 5,
    unit: 'pcs',
    isActive: true,
    barcode: '195949119006',
    description: 'Up to 2x more active noise cancellation, Adaptive Audio, USB-C case',
  },
  {
    id: 'prod-007',
    sku: 'DIS-LG-C3',
    name: 'LG 55" Class OLED evo C3 Series 4K Smart TV',
    category: 'Displays & TVs',
    purchasePrice: 950,
    sellingPrice: 1299,
    availableStock: 5,
    reorderLevel: 3,
    unit: 'pcs',
    isActive: true,
    barcode: '719192629007',
    description: 'α9 AI Processor Gen6, 120Hz refresh rate, Dolby Vision & Atmos, webOS',
  },
  {
    id: 'prod-008',
    sku: 'ACC-ANK-65W',
    name: 'Anker Prime 65W GaN Fast Charger (3-Port USB-C/A)',
    category: 'Accessories & Cables',
    purchasePrice: 28,
    sellingPrice: 49,
    availableStock: 48,
    reorderLevel: 10,
    unit: 'pcs',
    isActive: true,
    barcode: '194644119008',
    description: 'Ultra-compact GaNPrime tech, charges laptop, tablet & phone simultaneously',
  },
  {
    id: 'prod-009',
    sku: 'ACC-LOG-MX3',
    name: 'Logitech MX Master 3S Wireless Performance Mouse',
    category: 'Accessories & Cables',
    purchasePrice: 65,
    sellingPrice: 99,
    availableStock: 22,
    reorderLevel: 5,
    unit: 'pcs',
    isActive: true,
    barcode: '097855169009',
    description: '8K DPI optical sensor with Quiet Clicks, MagSpeed electromagnetic scrolling',
  },
  {
    id: 'prod-010',
    sku: 'TAB-APL-A11',
    name: 'Apple iPad Air 11" M2 (128GB Wi-Fi, Space Gray)',
    category: 'Smartphones & Tablets',
    purchasePrice: 480,
    sellingPrice: 599,
    availableStock: 1,
    reorderLevel: 4,
    unit: 'pcs',
    isActive: true,
    barcode: '195949219010',
    description: 'Apple M2 chip, 11-inch Liquid Retina display with True Tone, USB-C',
  },
  {
    id: 'prod-011',
    sku: 'WRB-APL-UW2',
    name: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titanium',
    category: 'Wearables & Smart Home',
    purchasePrice: 620,
    sellingPrice: 799,
    availableStock: 6,
    reorderLevel: 3,
    unit: 'pcs',
    isActive: true,
    barcode: '195949319011',
    description: 'Rugged titanium case, precision dual-frequency GPS, up to 36 hours battery',
  },
  {
    id: 'prod-012',
    sku: 'GAM-SNY-PS5',
    name: 'Sony PlayStation 5 Slim Console (1TB SSD Digital)',
    category: 'Gaming & Consoles',
    purchasePrice: 380,
    sellingPrice: 449,
    availableStock: 0,
    reorderLevel: 3,
    unit: 'pcs',
    isActive: true,
    barcode: '711719569012',
    description: 'Slim design, 1TB high-speed SSD, DualSense wireless controller, 4K 120Hz',
  },
];

export const INITIAL_MOVEMENTS = [
  {
    id: 'mov-001',
    sku: 'LAP-APL-M3',
    productName: 'Apple MacBook Air 15" M3 (16GB, 512GB SSD)',
    movementType: 'INITIAL_STOCK',
    quantity: 15,
    previousStock: 0,
    newStock: 15,
    reason: 'Initial store inventory stock intake',
    referenceId: 'PO-2026-001',
    performedBy: { id: 'admin-01', name: 'Khushbu Admin', role: 'Admin' },
    timestamp: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: 'mov-002',
    sku: 'PHN-APL-16P',
    productName: 'Apple iPhone 16 Pro 256GB - Natural Titanium',
    movementType: 'SALE',
    quantity: -1,
    previousStock: 4,
    newStock: 3,
    reason: 'Store retail checkout',
    referenceId: 'INV-2026-001',
    performedBy: { id: 'staff-01', name: 'Store Staff', role: 'Staff' },
    timestamp: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'mov-003',
    sku: 'ACC-ANK-65W',
    productName: 'Anker Prime 65W GaN Fast Charger (3-Port USB-C/A)',
    movementType: 'STOCK_RECEIVED',
    quantity: 20,
    previousStock: 28,
    newStock: 48,
    reason: 'Vendor consignment delivery',
    referenceId: 'PO-2026-004',
    performedBy: { id: 'admin-01', name: 'Khushbu Admin', role: 'Admin' },
    timestamp: new Date(Date.now() - 86400000 * 1),
  },
];

export const INITIAL_SALES = [
  {
    id: 'sale-001',
    invoiceNumber: 'INV-2026-001',
    items: [
      {
        sku: 'PHN-APL-16P',
        name: 'Apple iPhone 16 Pro 256GB - Natural Titanium',
        quantity: 1,
        purchasePrice: 980,
        unitPrice: 1199,
        itemTotal: 1199,
      },
      {
        sku: 'ACC-ANK-65W',
        name: 'Anker Prime 65W GaN Fast Charger (3-Port USB-C/A)',
        quantity: 1,
        purchasePrice: 28,
        unitPrice: 49,
        itemTotal: 49,
      },
    ],
    subtotal: 1248,
    discountPercent: 5,
    discountAmount: 62.4,
    taxPercent: 18,
    taxAmount: 213.41,
    totalAmount: 1399.01,
    totalCost: 1008,
    profitAmount: 177.6, // (subtotal - discount) - totalCost = 1185.6 - 1008 = 177.6
    paymentMethod: 'Credit Card',
    customerName: 'Vikram Mehta',
    customerPhone: '+91 98765 43210',
    soldBy: { id: 'staff-01', name: 'Store Staff', role: 'Staff' },
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'sale-002',
    invoiceNumber: 'INV-2026-002',
    items: [
      {
        sku: 'AUD-SNY-XM5',
        name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
        quantity: 1,
        purchasePrice: 260,
        unitPrice: 349,
        itemTotal: 349,
      },
    ],
    subtotal: 349,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 18,
    taxAmount: 62.82,
    totalAmount: 411.82,
    totalCost: 260,
    profitAmount: 89,
    paymentMethod: 'UPI / QR',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98123 45678',
    soldBy: { id: 'staff-01', name: 'Store Staff', role: 'Staff' },
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 86400000 * 1),
  },
];

// In-Memory resilient stores
let memoryProducts = [...INITIAL_PRODUCTS];
let memoryMovements = [...INITIAL_MOVEMENTS];
let memorySales = [...INITIAL_SALES];

export const seedMongoIfEmpty = async () => {
  if (!isDatabaseConnected()) return;
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Retail Seed] Seeding default users into MongoDB...');
      await User.create([
        {
          name: 'Khushbu',
          employeeCode: 'STR-MGR-01',
          email: 'store.manager@khushbu.com',
          password: 'admin123',
          role: 'StoreManager',
          designation: 'Store Manager',
          departmentId: 'DEPT-ELEC-01',
          storeId: 'STR-CENTRAL-01',
        },
        {
          name: 'Store Staff Member',
          employeeCode: 'STAFF-01',
          email: 'staff@khushbu.com',
          password: 'staff123',
          role: 'Staff',
          designation: 'Sales & Inventory Associate',
          departmentId: 'DEPT-ELEC-01',
          storeId: 'STR-CENTRAL-01',
        },
      ]);
      console.log('[Retail Seed] Seeded default users in MongoDB.');
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('[Retail Seed] Seeding default products into MongoDB...');
      await Product.insertMany(INITIAL_PRODUCTS.map(({ id, ...p }) => p));
      console.log(`[Retail Seed] Seeded ${INITIAL_PRODUCTS.length} products.`);
    }

    const movementCount = await InventoryMovement.countDocuments();
    if (movementCount === 0) {
      await InventoryMovement.insertMany(INITIAL_MOVEMENTS.map(({ id, ...m }) => m));
    }

    const salesCount = await Sale.countDocuments();
    if (salesCount === 0) {
      await Sale.insertMany(INITIAL_SALES.map(({ id, ...s }) => s));
    }
  } catch (err) {
    console.warn('[Retail Seed Notice]:', err.message);
  }
};

export const getProductsStore = () => memoryProducts;
export const getMovementsStore = () => memoryMovements;
export const getSalesStore = () => memorySales;
