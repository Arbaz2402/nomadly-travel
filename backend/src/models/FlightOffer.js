import mongoose from 'mongoose';

const flightLegSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true },
  airline: { type: String, required: true },
  airlineCode: { type: String, required: true },
  airlineLogo: { type: String },
  aircraft: { type: String, default: 'Airbus A321neo' },
  origin: {
    code: { type: String, required: true, uppercase: true }, // e.g. BOM
    city: { type: String, required: true }, // Mumbai
    airport: { type: String, required: true },
    terminal: { type: String, default: 'T2' },
  },
  destination: {
    code: { type: String, required: true, uppercase: true }, // e.g. DEL
    city: { type: String, required: true }, // Delhi
    airport: { type: String, required: true },
    terminal: { type: String, default: 'T3' },
  },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  durationMinutes: { type: Number, required: true },
});

const flightOfferSchema = new mongoose.Schema(
  {
    offerReference: { type: String, unique: true, index: true },
    provider: { type: String, default: 'NOMADLY_AIR', index: true },
    isDemo: { type: Boolean, default: true },
    originCity: { type: String, required: true, index: true },
    originCode: { type: String, required: true, uppercase: true, index: true },
    destinationCity: { type: String, required: true, index: true },
    destinationCode: { type: String, required: true, uppercase: true, index: true },
    departureDate: { type: String, required: true, index: true }, // YYYY-MM-DD
    returnDate: { type: String }, // Optional for round trip
    tripType: { type: String, enum: ['one-way', 'round-trip'], default: 'one-way' },
    cabinClass: {
      type: String,
      enum: ['economy', 'premium_economy', 'business', 'first'],
      default: 'economy',
      index: true,
    },
    totalDurationMinutes: { type: Number, required: true },
    stops: { type: Number, default: 0 },
    legs: [flightLegSchema],
    availableSeats: { type: Number, default: 24 },
    pricing: {
      currency: { type: String, default: 'INR' },
      baseFare: { type: Number, required: true },
      taxes: { type: Number, required: true },
      serviceFee: { type: Number, default: 250 },
      totalAmount: { type: Number, required: true },
    },
    baggage: {
      cabin: { type: String, default: '7 kg' },
      checkIn: { type: String, default: '15 kg' },
    },
    fareRules: {
      isRefundable: { type: Boolean, default: true },
      cancellationFee: { type: Number, default: 2500 },
      dateChangeFee: { type: Number, default: 1500 },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

flightOfferSchema.index({ originCode: 1, destinationCode: 1, departureDate: 1, cabinClass: 1 });

export const FlightOffer = mongoose.model('FlightOffer', flightOfferSchema);
