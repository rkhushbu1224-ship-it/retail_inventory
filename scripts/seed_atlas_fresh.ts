import 'dotenv/config';
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

async function seedFreshAtlasDatabase() {
  console.log('Connecting to MongoDB Atlas cluster...');
  await mongoose.connect(ATLAS_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to database:', mongoose.connection.name);

  // 1. Clean previous data
  console.log('Clearing existing collections in database...');
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Movement.deleteMany({}),
    Sale.deleteMany({}),
  ]);
  console.log('Cleared existing collections.');

  // 2. Seed Users
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

  const prodMap = new Map(createdProducts.map((p) => [p.sku, p]));

  // 4. Seed Stock Movements
  console.log('Logging initial inventory movements...');
  const macbook = prodMap.get('LAP-APL-M3')!;
  const iphone = prodMap.get('PHN-APL-16P')!;
  const charger = prodMap.get('ACC-ANK-65W')!;
  const xm5 = prodMap.get('AUD-SNY-XM5')!;
  const airpods = prodMap.get('AUD-APL-APP2')!;

  await Movement.insertMany([
    {
      product: macbook._id,
      sku: macbook.sku,
      productName: macbook.name,
      movementType: 'INITIAL_STOCK',
      quantity: 16,
      previousStock: 0,
      newStock: 16,
      reason: 'Initial store inventory stock intake',
      referenceId: 'PO-2026-001',
      performedBy: { id: adminUser._id.toString(), name: 'Khushbu', role: 'StoreManager' },
      timestamp: new Date(Date.now() - 30 * 86400000),
    },
    {
      product: iphone._id,
      sku: iphone.sku,
      productName: iphone.name,
      movementType: 'INITIAL_STOCK',
      quantity: 5,
      previousStock: 0,
      newStock: 5,
      reason: 'Initial intake',
      referenceId: 'PO-2026-002',
      performedBy: { id: adminUser._id.toString(), name: 'Khushbu', role: 'StoreManager' },
      timestamp: new Date(Date.now() - 30 * 86400000),
    },
    {
      product: charger._id,
      sku: charger.sku,
      productName: charger.name,
      movementType: 'STOCK_RECEIVED',
      quantity: 55,
      previousStock: 0,
      newStock: 55,
      reason: 'Vendor batch shipment received',
      referenceId: 'PO-2026-003',
      performedBy: { id: adminUser._id.toString(), name: 'Khushbu', role: 'StoreManager' },
      timestamp: new Date(Date.now() - 25 * 86400000),
    },
    {
      product: iphone._id,
      sku: iphone.sku,
      productName: iphone.name,
      movementType: 'SALE',
      quantity: -1,
      previousStock: 5,
      newStock: 4,
      reason: 'Customer purchase checkout',
      referenceId: 'INV-2026-1001',
      performedBy: { id: staffUser._id.toString(), name: 'Store Staff Member', role: 'Staff' },
      timestamp: new Date(Date.now() - 28 * 86400000),
    },
    {
      product: xm5._id,
      sku: xm5.sku,
      productName: xm5.name,
      movementType: 'SALE',
      quantity: -1,
      previousStock: 20,
      newStock: 19,
      reason: 'Customer purchase checkout',
      referenceId: 'INV-2026-1003',
      performedBy: { id: staffUser._id.toString(), name: 'Store Staff Member', role: 'Staff' },
      timestamp: new Date(Date.now() - 24 * 86400000),
    },
    {
      product: airpods._id,
      sku: airpods.sku,
      productName: airpods.name,
      movementType: 'SALE',
      quantity: -1,
      previousStock: 4,
      newStock: 3,
      reason: 'Customer purchase checkout',
      referenceId: 'INV-2026-1006',
      performedBy: { id: staffUser._id.toString(), name: 'Store Staff Member', role: 'Staff' },
      timestamp: new Date(Date.now() - 18 * 86400000),
    },
    {
      product: airpods._id,
      sku: airpods.sku,
      productName: airpods.name,
      movementType: 'SALE',
      quantity: -1,
      previousStock: 3,
      newStock: 2,
      reason: 'Low stock triggered from sale',
      referenceId: 'INV-2026-1018',
      performedBy: { id: staffUser._id.toString(), name: 'Store Staff Member', role: 'Staff' },
      timestamp: new Date(Date.now() - 1 * 86400000),
    },
  ]);
  console.log('Initial movements recorded.');

  // 5. Seed Sales
  console.log('Creating 18 demo sales transactions across the last 30 days...');
  const salesToInsert = SEED_SALES_SPEC.map((spec) => {
    const validatedItems = spec.items.map((it) => {
      const p = prodMap.get(it.sku)!;
      const itemTotal = parseFloat((it.quantity * p.sellingPrice).toFixed(2));
      return {
        product: p._id,
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
        id: adminUser._id.toString(),
        name: 'Khushbu',
        role: 'StoreManager',
      },
      status: 'COMPLETED',
      createdAt,
      updatedAt: createdAt,
    };
  });

  await Sale.insertMany(salesToInsert);
  console.log(`Created ${salesToInsert.length} sales invoices.`);

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
