import mongoose from 'mongoose';

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  sku: {
    type: String,
    required: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  purchasePrice: {
    type: Number,
    required: true,
    default: 0,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  itemTotal: {
    type: Number,
    required: true,
  },
});

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    items: {
      type: [saleItemSchema],
      required: true,
      validate: [(val) => val.length > 0, 'Sale must contain at least one product'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxPercent: {
      type: Number,
      default: 18,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    profitAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Credit Card', 'UPI / QR', 'Bank Transfer'],
      default: 'Cash',
    },
    customerName: {
      type: String,
      default: 'Walk-in Customer',
      trim: true,
    },
    customerPhone: {
      type: String,
      default: '',
      trim: true,
    },
    soldBy: {
      id: { type: String, default: 'staff-01' },
      name: { type: String, default: 'Store Staff' },
      role: { type: String, default: 'Staff' },
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'CANCELLED', 'REFUNDED'],
      default: 'COMPLETED',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Sale = mongoose.models.Sale || mongoose.model('Sale', saleSchema);
