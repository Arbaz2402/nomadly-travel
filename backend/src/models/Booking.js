import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema({
  title: { type: String, default: 'Mr' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  seatNumber: { type: String },
  berthPreference: { type: String },
  mealPreference: { type: String },
  passportNumber: { type: String },
});

const priceBreakdownSchema = new mongoose.Schema({
  baseFare: { type: Number, required: true },
  taxes: { type: Number, required: true },
  serviceFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponCode: { type: String },
  addOnsAmount: { type: Number, default: 0 },
  totalPayable: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    travelCategory: {
      type: String,
      enum: ['flight', 'hotel', 'train', 'bus'],
      required: true,
      index: true,
    },
    providerName: {
      type: String,
      default: 'NOMADLY_NATIVE',
    },
    providerReference: {
      type: String,
    },
    isDemo: {
      type: Boolean,
      default: true,
    },
    // Snapshot of the reserved product to maintain history even if catalog changes
    itinerarySnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    passengers: [passengerSchema],
    contactInfo: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    pricing: {
      type: priceBreakdownSchema,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'cancelled', 'completed', 'failed'],
      default: 'pending_payment',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refund_pending', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentDetails: {
      paymentId: { type: String },
      orderId: { type: String },
      method: { type: String, default: 'razorpay' },
      paidAt: { type: Date },
    },
    cancellation: {
      isEligible: { type: Boolean, default: true },
      cancelledAt: { type: Date },
      reason: { type: String },
      refundAmount: { type: Number, default: 0 },
      refundStatus: {
        type: String,
        enum: ['none', 'requested', 'processed', 'declined'],
        default: 'none',
      },
    },
    qrCodeData: {
      type: String, // verification payload
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ travelCategory: 1, bookingStatus: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
