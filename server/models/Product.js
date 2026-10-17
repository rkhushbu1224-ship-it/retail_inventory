import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'Product SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'General Electronics',
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    availableStock: {
      type: Number,
      required: true,
      min: [0, 'Available stock cannot be negative'],
      default: 0,
    },
    reorderLevel: {
      type: Number,
      required: true,
      min: [0, 'Reorder level cannot be negative'],
      default: 5,
    },
    unit: {
      type: String,
      default: 'pcs',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    barcode: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for low stock status
productSchema.virtual('isLowStock').get(function () {
  return this.availableStock <= this.reorderLevel;
});

// Ensure virtuals are serialized in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
