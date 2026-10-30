import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    maxDiscountAmount: {
      type: Number, // Cap for percentage discounts
      default: 1500,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    applicableCategories: [{
      type: String,
      enum: ['flight', 'hotel', 'train', 'bus', 'all'],
      default: 'all',
    }],
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number, default: 500 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model('Coupon', couponSchema);
