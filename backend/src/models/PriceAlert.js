import mongoose from 'mongoose';

const priceAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['flight', 'hotel', 'train', 'bus'],
      required: true,
    },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    travelDate: { type: String }, // YYYY-MM-DD
    targetPrice: { type: Number, required: true },
    currentPrice: { type: Number },
    currency: { type: String, default: 'INR' },
    isTriggered: { type: Boolean, default: false },
    lastCheckedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const PriceAlert = mongoose.model('PriceAlert', priceAlertSchema);
