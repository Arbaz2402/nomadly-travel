import mongoose from 'mongoose';

const itineraryItemSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'flight',
        'hotel',
        'train',
        'bus',
        'package',
        'experience',
        'car_rental',
        'restaurant',
        'sightseeing',
        'activities',
        'shopping',
        'other',
      ],
      default: 'activities',
      index: true,
      set: (val) => {
        if (!val) return 'activities';
        const n = String(val).toLowerCase().trim();
        if (n === 'activity' || n === 'activitiess') return 'activities';
        if (n === 'flights') return 'flight';
        if (n === 'hotels') return 'hotel';
        if (n === 'trains') return 'train';
        if (n === 'buses' || n === 'buss') return 'bus';
        if (['flight', 'hotel', 'train', 'bus', 'package', 'experience', 'car_rental', 'restaurant', 'sightseeing', 'activities', 'shopping', 'other'].includes(n)) {
          return n;
        }
        return 'other';
      },
    },
    sourceType: {
      type: String,
      enum: ['external_booking', 'manual_entry', 'unbooked_activity'],
      default: 'manual_entry',
      index: true,
    },
    bookingReference: {
      type: String,
      default: '',
      trim: true,
    },
    externalProvider: {
      type: String,
      default: '', // e.g. "Booking.com", "MakeMyTrip", "IRCTC", "Airbnb", "Agoda"
      trim: true,
    },
    externalBookingUrl: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      name: { type: String, default: '' },
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      default: '10:00', // HH:mm format
    },
    endTime: {
      type: String,
      default: '12:00', // HH:mm format
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    actualCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['planned', 'confirmed', 'completed', 'cancelled'],
      default: 'planned',
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
    attachments: [
      {
        name: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String, default: 'application/pdf' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient timeline queries
itineraryItemSchema.index({ trip: 1, date: 1, startTime: 1 });

export const ItineraryItem = mongoose.model('ItineraryItem', itineraryItemSchema);

