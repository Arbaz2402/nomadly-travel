import mongoose from 'mongoose';

const inventoryHoldSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['flight', 'hotel', 'train', 'bus'],
      required: true,
      index: true,
    },
    inventoryId: {
      type: String,
      required: true,
      index: true,
    },
    seatNumbers: [{ type: String }],
    roomIds: [{ type: String }],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '0s' }, // MongoDB TTL index to auto-purge
    },
    status: {
      type: String,
      enum: ['active', 'confirmed', 'released', 'expired'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

inventoryHoldSchema.index({ inventoryId: 1, seatNumbers: 1, status: 1 });

export const InventoryHold = mongoose.model('InventoryHold', inventoryHoldSchema);
