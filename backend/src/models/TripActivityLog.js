import mongoose from 'mongoose';

const tripActivityLogSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      default: 'System',
    },
    action: {
      type: String,
      required: true, // e.g. "CREATED_TRIP", "ADDED_ITINERARY_ITEM", "RECORDED_EXPENSE", "UPLOADED_DOCUMENT", "INVITED_MEMBER"
    },
    details: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

tripActivityLogSchema.index({ trip: 1, createdAt: -1 });

export const TripActivityLog = mongoose.model('TripActivityLog', tripActivityLogSchema);

