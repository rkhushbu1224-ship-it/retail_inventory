import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
    },
    sku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    movementType: {
      type: String,
      required: true,
      enum: ['STOCK_RECEIVED', 'SALE', 'MANUAL_ADJUSTMENT', 'DAMAGE', 'RETURN', 'INITIAL_STOCK'],
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: '',
      trim: true,
    },
    referenceId: {
      type: String,
      default: '',
      trim: true,
    },
    performedBy: {
      id: { type: String, default: 'system' },
      name: { type: String, default: 'System' },
      role: { type: String, default: 'Admin' },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const InventoryMovement =
  mongoose.models.InventoryMovement || mongoose.model('InventoryMovement', inventoryMovementSchema);
