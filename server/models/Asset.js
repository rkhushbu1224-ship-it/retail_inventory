import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    assetTag: { type: String, required: true, unique: true, trim: true },
    itemName: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      default: 'Consumer Electronics',
    },
    make: { type: String, default: '' },
    model: { type: String, default: '' },
    serialNo: { type: String, default: '', trim: true },
    barcode: { type: String, default: '' },
    purchaseOrderNo: { type: String, default: '' },
    purchaseDate: { type: Date, default: Date.now },
    purchasePrice: { type: Number, default: 0 },
    currentCost: { type: Number, default: 0 },
    warrantyExpiry: { type: Date },
    status: {
      type: String,
      enum: ['Active', 'In_Stock', 'Issued', 'Under_Maintenance', 'Condemned', 'Disposed', 'Pending_Transfer'],
      default: 'In_Stock',
    },
    storeId: { type: String, default: 'STR-CENTRAL-01' },
    departmentId: { type: String, default: 'DEPT-ELEC-01' },
    locationRoom: { type: String, default: 'Store Floor 1' },
    custodianId: { type: String, default: '' },
    custodianName: { type: String, default: '' },
    specifications: { type: Map, of: String },
    remarks: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const Asset = mongoose.models.Asset || mongoose.model('Asset', assetSchema);
