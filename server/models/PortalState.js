import mongoose from 'mongoose';

const portalStateSchema = new mongoose.Schema(
  {
    stateId: { type: String, required: true, unique: true, default: 'portal_state_1' },
    revision: { type: Number, required: true, default: 1 },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
  }
);

export const PortalState = mongoose.models.PortalState || mongoose.model('PortalState', portalStateSchema);
