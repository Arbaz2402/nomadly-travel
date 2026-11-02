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

const tripParticipantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  role: {
    type: String,
    enum: ['owner', 'editor', 'viewer'],
    default: 'editor',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'accepted',
  },
  invitedAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
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
      required: true,
      trim: true,
    },
    description: { type: String, default: '' },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    additionalDestinations: [{ type: String, trim: true }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    travelersCount: { type: Number, default: 1, min: 1 },
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    budget: {
      totalBudget: { type: Number, default: 50000, min: 0 },
      currency: { type: String, default: 'INR' },
      allocatedTransport: { type: Number, default: 20000 },
      allocatedStay: { type: Number, default: 25000 },
      allocatedActivities: { type: Number, default: 5000 },
    },
    status: {
      type: String,
      enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
      index: true,
    },
    participants: [tripParticipantSchema],
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
    segments: [tripSegmentSchema], // Kept for backwards compatibility
    isPublic: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Helpful virtual to auto-evaluate dynamic trip status if not explicitly draft/cancelled
tripSchema.methods.calculateDynamicStatus = function () {
  if (this.status === 'draft' || this.status === 'cancelled') {
    return this.status;
  }
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  // Compare by dates
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'ongoing';
  return 'completed';
};

export const Trip = mongoose.model('Trip', tripSchema);
