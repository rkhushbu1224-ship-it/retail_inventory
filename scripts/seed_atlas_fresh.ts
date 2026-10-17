import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const ATLAS_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/khushbu_electronic_store';

// Schemas
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

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Movement = mongoose.models.InventoryMovement || mongoose.model('InventoryMovement', movementSchema);
const Sale = mongoose.models.Sale || mongoose.model('Sale', saleSchema);

const PRODUCTS = [
  { sku: 'LAP-APL-M3', name: 'Apple MacBook Air 15" M3 (16GB, 512GB SSD)', category: 'Laptops & Computers', purchasePrice: 1050, sellingPrice: 1299, availableStock: 14, reorderLevel: 5, unit: 'pcs', isActive: true, barcode: '194253719001', description: '15.3-inch Liquid Retina display, M3 8-core CPU, 10-core GPU, Midnight' },
  { sku: 'LAP-DEL-XPS', name: 'Dell XPS 14 Core Ultra 7 (32GB, 1TB RTX 4050)', category: 'Laptops & Computers', purchasePrice: 1450, sellingPrice: 1849, availableStock: 8, reorderLevel: 4, unit: 'pcs', isActive: true, barcode: '884116419002', description: 'Intel Core Ultra 7 155H, 3.2K OLED Touch display, CNC aluminum chassis' },
  { sku: 'PHN-APL-16P', name: 'Apple iPhone 16 Pro 256GB - Natural Titanium', category: 'Smartphones & Tablets', purchasePrice: 980, sellingPrice: 1199, availableStock: 3, reorderLevel: 5, unit: 'pcs', isActive: true, barcode: '195949019003', description: 'Grade 5 Titanium design, 48MP Fusion camera, A18 Pro chip, 5G' },
  { sku: 'PHN-SAM-S24', name: 'Samsung Galaxy S24 Ultra 512GB (Titanium Black)', category: 'Smartphones & Tablets', purchasePrice: 950, sellingPrice: 1249, availableStock: 11, reorderLevel: 4, unit: 'pcs', isActive: true, barcode: '887276819004', description: 'Snapdragon 8 Gen 3, Built-in S Pen, 200MP Quad Camera, Galaxy AI' },
  { sku: 'AUD-SNY-XM5', name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', category: 'Audio & Headphones', purchasePrice: 260, sellingPrice: 349, availableStock: 19, reorderLevel: 6, unit: 'pcs', isActive: true, barcode: '027242929005', description: 'Industry-leading noise cancellation with 2 processors and 8 microphones' },
  { sku: 'AUD-APL-APP2', name: 'Apple AirPods Pro (2nd Gen) with USB-C MagSafe Case', category: 'Audio & Headphones', purchasePrice: 180, sellingPrice: 249, availableStock: 2, reorderLevel: 5, unit: 'pcs', isActive: true, barcode: '195949119006', description: 'Up to 2x more active noise cancellation, Adaptive Audio, USB-C case' },
  { sku: 'DIS-LG-C3', name: 'LG 55" Class OLED evo C3 Series 4K Smart TV', category: 'Displays & TVs', purchasePrice: 950, sellingPrice: 1299, availableStock: 5, reorderLevel: 3, unit: 'pcs', isActive: true, barcode: '719192629007', description: 'α9 AI Processor Gen6, 120Hz refresh rate, Dolby Vision & Atmos, webOS' },
  { sku: 'ACC-ANK-65W', name: 'Anker Prime 65W GaN Fast Charger (3-Port USB-C/A)', category: 'Accessories & Cables', purchasePrice: 28, sellingPrice: 49, availableStock: 48, reorderLevel: 10, unit: 'pcs', isActive: true, barcode: '194644119008', description: 'Ultra-compact GaNPrime tech, charges laptop, tablet & phone simultaneously' },
  { sku: 'ACC-LOG-MX3', name: 'Logitech MX Master 3S Wireless Performance Mouse', category: 'Accessories & Cables', purchasePrice: 65, sellingPrice: 99, availableStock: 22, reorderLevel: 5, unit: 'pcs', isActive: true, barcode: '097855169009', description: '8K DPI optical sensor with Quiet Clicks, MagSpeed electromagnetic scrolling' },
  { sku: 'TAB-APL-A11', name: 'Apple iPad Air 11" M2 (128GB Wi-Fi, Space Gray)', category: 'Smartphones & Tablets', purchasePrice: 480, sellingPrice: 599, availableStock: 1, reorderLevel: 4, unit: 'pcs', isActive: true, barcode: '195949219010', description: 'Apple M2 chip, 11-inch Liquid Retina display with True Tone, USB-C' },
  { sku: 'WRB-APL-UW2', name: 'Apple Watch Ultra 2 GPS + Cellular 49mm Titanium', category: 'Wearables & Smart Home', purchasePrice: 620, sellingPrice: 799, availableStock: 6, reorderLevel: 3, unit: 'pcs', isActive: true, barcode: '195949319011', description: 'Rugged titanium case, precision dual-frequency GPS, up to 36 hours battery' },
  { sku: 'GAM-SNY-PS5', name: 'Sony PlayStation 5 Slim Console (1TB SSD Digital)', category: 'Gaming & Consoles', purchasePrice: 380, sellingPrice: 449, availableStock: 0, reorderLevel: 3, unit: 'pcs', isActive: true, barcode: '711719569012', description: 'Slim design, 1TB high-speed SSD, DualSense wireless controller, 4K 120Hz' },
];

async function seedFreshAtlasDatabase() {
  console.log('Connecting to MongoDB Atlas cluster...');
  await mongoose.connect(ATLAS_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to database:', mongoose.connection.name);

  // 1. Clean previous data in khushbu_electronic_store
  console.log('Clearing any existing collections in database...');
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Movement.deleteMany({}),
    Sale.deleteMany({}),
  ]);
  console.log('Cleared existing collections.');

  // 2. Seed Users with bcrypt passwords
  console.log('Creating fresh demo user accounts...');
  const adminHash = await bcrypt.hash('admin123', 10);
  const staffHash = await bcrypt.hash('staff123', 10);

  const adminUser = await User.create({
    name: 'Khushbu',
    employeeCode: 'STR-MGR-01',
    email: 'store.manager@khushbustore.com',
    password: adminHash,
    role: 'StoreManager',
    designation: 'Store Manager',
    departmentId: 'DEPT-ELEC-01',
    storeId: 'STR-CENTRAL-01',
    isActive: true,
  });

  const staffUser = await User.create({
    name: 'Store Staff Member',
    employeeCode: 'STAFF-01',
    email: 'staff@khushbustore.com',
    password: staffHash,
    role: 'Staff',
    designation: 'Sales & Inventory Associate',
    departmentId: 'DEPT-ELEC-01',
    storeId: 'STR-CENTRAL-01',
    isActive: true,
  });

  console.log('Created Users:', [adminUser.employeeCode, staffUser.employeeCode]);

  // 3. Seed Products
  console.log('Inserting 12 electronic catalog products...');
  const createdProducts = await Product.insertMany(PRODUCTS);
  console.log(`Created ${createdProducts.length} products.`);

  // 4. Seed Stock Movements
  console.log('Logging initial inventory movements...');
  const macbook = createdProducts.find((p) => p.sku === 'LAP-APL-M3')!;
  const iphone = createdProducts.find((p) => p.sku === 'PHN-APL-16P')!;
  const charger = createdProducts.find((p) => p.sku === 'ACC-ANK-65W')!;

  await Movement.insertMany([
    {
      product: macbook._id,
      sku: macbook.sku,
      productName: macbook.name,
      movementType: 'INITIAL_STOCK',
      quantity: 15,
      previousStock: 0,
      newStock: 15,
      reason: 'Initial store inventory stock intake',
      referenceId: 'PO-2026-001',
      performedBy: { id: adminUser._id.toString(), name: 'Khushbu', role: 'StoreManager' },
      timestamp: new Date(Date.now() - 86400000 * 5),
    },
    {
      product: iphone._id,
      sku: iphone.sku,
      productName: iphone.name,
      movementType: 'SALE',
      quantity: -1,
      previousStock: 4,
      newStock: 3,
      reason: 'Store retail checkout',
      referenceId: 'INV-2026-001',
      performedBy: { id: staffUser._id.toString(), name: 'Store Staff Member', role: 'Staff' },
      timestamp: new Date(Date.now() - 86400000 * 2),
    },
    {
      product: charger._id,
      sku: charger.sku,
      productName: charger.name,
      movementType: 'STOCK_RECEIVED',
      quantity: 20,
      previousStock: 28,
      newStock: 48,
      reason: 'Vendor consignment delivery',
      referenceId: 'PO-2026-004',
      performedBy: { id: adminUser._id.toString(), name: 'Khushbu', role: 'StoreManager' },
      timestamp: new Date(Date.now() - 86400000 * 1),
    },
  ]);
  console.log('Initial movements recorded.');

  // 5. Seed Initial Sales
  console.log('Creating initial demo sales transactions...');
  await Sale.insertMany([
    {
      invoiceNumber: 'INV-2026-001',
      items: [
        {
          product: iphone._id,
          sku: iphone.sku,
          name: iphone.name,
          quantity: 1,
          purchasePrice: iphone.purchasePrice,
          unitPrice: iphone.sellingPrice,
          itemTotal: iphone.sellingPrice,
        },
        {
          product: charger._id,
          sku: charger.sku,
          name: charger.name,
          quantity: 1,
          purchasePrice: charger.purchasePrice,
          unitPrice: charger.sellingPrice,
          itemTotal: charger.sellingPrice,
        },
      ],
      subtotal: 1248,
      discountPercent: 5,
      discountAmount: 62.4,
      taxPercent: 18,
      taxAmount: 213.41,
      totalAmount: 1399.01,
      totalCost: 1008,
      profitAmount: 177.6,
      paymentMethod: 'Credit Card',
      customerName: 'Vikram Mehta',
      customerPhone: '+91 98765 43210',
      soldBy: { id: staffUser._id.toString(), name: 'Store Staff Member', role: 'Staff' },
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      invoiceNumber: 'INV-2026-002',
      items: [
        {
          product: createdProducts.find((p) => p.sku === 'AUD-SNY-XM5')!._id,
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
      soldBy: { id: staffUser._id.toString(), name: 'Store Staff Member', role: 'Staff' },
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 86400000 * 1),
    },
  ]);
  console.log('Initial sales recorded.');

  // Verification counts
  const userCount = await User.countDocuments();
  const prodCount = await Product.countDocuments();
  const moveCount = await Movement.countDocuments();
  const saleCount = await Sale.countDocuments();

  console.log('\n=============================================');
  console.log('MongoDB Atlas Fresh Database Summary:');
  console.log(`Database Name: ${mongoose.connection.name}`);
  console.log(`- Users: ${userCount} (STR-MGR-01 & STAFF-01)`);
  console.log(`- Products: ${prodCount}`);
  console.log(`- Inventory Movements: ${moveCount}`);
  console.log(`- Sales Invoices: ${saleCount}`);
  console.log('=============================================\n');

  await mongoose.disconnect();
}

seedFreshAtlasDatabase()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Error seeding Atlas database:', e);
    process.exit(1);
  });
