import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'adventure',
        'sightseeing',
        'culture',
        'water_sports',
        'food_dining',
        'day_trips',
        'wellness',
      ],
      default: 'sightseeing',
      index: true,
    },
    destinationCity: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    durationHours: {
      type: Number,
      required: true,
      min: 0.5,
    },
    pricePerPerson: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 120,
    },
    featuredPhoto: {
      type: String,
      required: true,
    },
    gallery: {
      type: [String],
      default: [],
    },
    overview: {
      type: String,
      required: true,
    },
    highlights: {
      type: [String],
      default: [],
    },
    inclusions: {
      type: [String],
      default: [],
    },
    meetingPoint: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Experience = mongoose.model('Experience', experienceSchema);
