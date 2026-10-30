import mongoose from 'mongoose';

const savedTravelerSchema = new mongoose.Schema({
  title: { type: String, enum: ['Mr', 'Ms', 'Mrs', 'Dr'], default: 'Mr' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  passportNumber: { type: String },
  passportExpiry: { type: Date },
  nationality: { type: String, default: 'Indian' },
  frequentFlyerNo: { type: String },
});

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String, // Hashed for native demo accounts if not using Firebase
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    photoURL: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'supplier'],
      default: 'customer',
      index: true,
    },
    preferences: {
      currency: { type: String, default: 'INR' },
      seatPreference: { type: String, enum: ['window', 'aisle', 'middle', 'any'], default: 'window' },
      mealPreference: { type: String, default: 'Vegetarian' },
      notificationsEnabled: { type: Boolean, default: true },
    },
    savedTravelers: [savedTravelerSchema],
    isSuspended: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
