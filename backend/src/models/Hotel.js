import mongoose from 'mongoose';

const roomTypeSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  name: { type: String, required: true }, // e.g. "Deluxe Ocean View King"
  description: { type: String },
  maxOccupancy: {
    adults: { type: Number, default: 2 },
    children: { type: Number, default: 1 },
  },
  bedConfiguration: { type: String, default: '1 King Bed' },
  sizeSqFt: { type: Number, default: 420 },
  amenities: [{ type: String }],
  photos: [{ type: String }],
  pricePerNight: { type: Number, required: true },
  taxesPerNight: { type: Number, default: 500 },
  totalRooms: { type: Number, default: 10 },
  availableRooms: { type: Number, default: 5 },
  mealPlan: { type: String, enum: ['room_only', 'breakfast_included', 'all_inclusive'], default: 'breakfast_included' },
  freeCancellationBeforeDays: { type: Number, default: 2 },
});

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, unique: true, index: true },
    brand: { type: String },
    propertyType: {
      type: String,
      enum: ['hotel', 'resort', 'villa', 'boutique', 'heritage', 'apartment'],
      default: 'hotel',
    },
    starRating: { type: Number, min: 1, max: 5, default: 4, index: true },
    guestRating: { type: Number, min: 1, max: 10, default: 8.8 },
    reviewsCount: { type: Number, default: 240 },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String },
      country: { type: String, default: 'India' },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
      neighborhood: { type: String },
    },
    overview: { type: String, required: true },
    featuredPhoto: { type: String, required: true },
    gallery: [{ type: String }],
    amenities: [{ type: String }],
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '11:00' },
    policies: {
      cancellation: { type: String, default: 'Free cancellation up to 48 hours prior to check-in' },
      childPolicy: { type: String, default: 'Children under 6 stay free when using existing bedding' },
      petFriendly: { type: Boolean, default: false },
    },
    rooms: [roomTypeSchema],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

hotelSchema.index({ 'location.city': 1, starRating: 1, isActive: 1 });

export const Hotel = mongoose.model('Hotel', hotelSchema);
