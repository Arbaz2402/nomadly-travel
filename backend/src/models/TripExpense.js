import mongoose from 'mongoose';

const expenseSplitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  shareAmount: { type: Number, required: true, default: 0 }, // In trip base currency
  sharePercentage: { type: Number, default: 0 },
  isSettled: { type: Boolean, default: false },
});

const tripExpenseSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: [
        'flights',
        'hotels',
        'trains',
        'buses',
        'local_transportation',
        'food',
        'activities',
        'shopping',
        'insurance',
        'other',
      ],
      default: 'food',
      index: true,
      set: (val) => {
        if (!val) return 'other';
        const normalized = String(val).toLowerCase().trim();
        if (normalized === 'activitiess' || normalized === 'activity' || normalized === 'sightseeing' || normalized === 'activities' || normalized === 'experience' || normalized === 'experiences') return 'activities';
        if (normalized === 'flight' || normalized === 'flights') return 'flights';
        if (normalized === 'hotel' || normalized === 'hotels' || normalized === 'package' || normalized === 'packages') return 'hotels';
        if (normalized === 'train' || normalized === 'trains') return 'trains';
        if (normalized === 'bus' || normalized === 'buss' || normalized === 'buses') return 'buses';
        if (normalized === 'restaurant' || normalized === 'food') return 'food';
        if (normalized === 'car_rental' || normalized === 'local_transportation' || normalized === 'transport') return 'local_transportation';
        if (normalized === 'shopping') return 'shopping';
        if (normalized === 'insurance') return 'insurance';
        if (['flights', 'hotels', 'trains', 'buses', 'local_transportation', 'food', 'activities', 'shopping', 'insurance', 'other'].includes(normalized)) {
          return normalized;
        }
        return 'other';
      },
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
      uppercase: true,
    },
    exchangeRate: {
      type: Number,
      required: true,
      default: 1.0,
      min: 0,
    },
    convertedAmount: {
      type: Number,
      required: true,
      default: 0, // Amount in Trip's primary currency
      min: 0,
    },
    conversionTimestamp: {
      type: Date,
      default: Date.now,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    paidBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      name: { type: String, required: true },
      email: { type: String, default: '' },
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    itineraryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ItineraryItem',
      default: null,
    },
    splitType: {
      type: String,
      enum: ['equal', 'custom', 'percentage'],
      default: 'equal',
    },
    splits: [expenseSplitSchema],
  },
  {
    timestamps: true,
  }
);

tripExpenseSchema.index({ trip: 1, date: -1 });

export const TripExpense = mongoose.model('TripExpense', tripExpenseSchema);

