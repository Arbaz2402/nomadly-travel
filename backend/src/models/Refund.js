import mongoose from 'mongoose';

const refundSchema = new mongoose.Schema(
  {
    refundReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['initiated', 'processed', 'failed'],
      default: 'processed',
      index: true,
    },
    gatewayRefundId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Refund = mongoose.model('Refund', refundSchema);
