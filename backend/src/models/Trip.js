import mongoose from 'mongoose';

const tripSegmentSchema = new mongoose.Schema({
  segmentType: {
    type: String,
    enum: ['flight', 'hotel', 'train', 'bus'],
    required: true,
  },
  title: { type: String, required: true },
  fromLocation: { type: String },
  toLocation: { type: String },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  bookingRef: { type: String },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  status: {
    type: String,
    enum: ['planned', 'held', 'confirmed', 'completed'],
    default: 'planned',
  },
  estimatedCost: { type: Number, default: 0 },
  actualCost: { type: Number, default: 0 },
  notes: { type: String },
});

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true, // e.g. "Golden Triangle Tour 2026"
    },
    description: { type: String },
    coverImage: { type: String },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: {
      totalBudget: { type: Number, default: 50000 },
      currency: { type: String, default: 'INR' },
      allocatedTransport: { type: Number, default: 20000 },
      allocatedStay: { type: Number, default: 25000 },
      allocatedActivities: { type: Number, default: 5000 },
    },
    segments: [tripSegmentSchema],
    isPublic: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['planning', 'confirmed', 'in_progress', 'completed', 'archived'],
      default: 'planning',
    },
  },
  {
    timestamps: true,
  }
);

export const Trip = mongoose.model('Trip', tripSchema);
