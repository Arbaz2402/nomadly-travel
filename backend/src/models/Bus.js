import mongoose from 'mongoose';

const busSeatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true }, // e.g. "L1", "L2", "U1"
  deck: { type: String, enum: ['lower', 'upper'], default: 'lower' },
  seatType: { type: String, enum: ['sleeper', 'seater'], default: 'seater' },
  row: { type: Number, required: true },
  column: { type: Number, required: true },
  price: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  isBooked: { type: Boolean, default: false },
  isHeld: { type: Boolean, default: false },
  heldUntil: { type: Date },
  heldBySession: { type: String },
  genderPreference: { type: String, enum: ['any', 'female_only', 'male_only'], default: 'any' },
});

const busPointSchema = new mongoose.Schema({
  locationName: { type: String, required: true },
  landmark: { type: String },
  time: { type: String, required: true }, // e.g. "21:30"
  contactNumber: { type: String },
});

const busSchema = new mongoose.Schema(
  {
    operatorName: { type: String, required: true, index: true }, // e.g. "Zingbus Electric", "IntrCity SmartBus", "SRS Travels"
    busNumber: { type: String, required: true },
    busType: {
      type: String,
      enum: ['Volvo Multi-Axle AC Sleeper', 'Mercedes Multi-Axle AC Seater', 'Scania AC Seater/Sleeper', 'BharatBenz AC Sleeper', 'AC Seater Pushback'],
      default: 'Volvo Multi-Axle AC Sleeper',
    },
    originCity: { type: String, required: true, index: true },
    destinationCity: { type: String, required: true, index: true },
    departureTime: { type: String, required: true }, // "21:00"
    arrivalTime: { type: String, required: true }, // "06:30"
    durationMinutes: { type: Number, required: true },
    totalSeats: { type: Number, default: 36 },
    availableSeatsCount: { type: Number, default: 18 },
    rating: { type: Number, default: 4.6 },
    reviewsCount: { type: Number, default: 420 },
    baseFare: { type: Number, required: true },
    amenities: [{ type: String }], // ["Live Tracking", "WiFi", "Charging Point", "Water Bottle", "Blanket", "Emergency Exit"]
    boardingPoints: [busPointSchema],
    droppingPoints: [busPointSchema],
    seats: [busSeatSchema],
    cancellationPolicy: { type: String, default: 'Free cancellation until 6 hours before departure' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

busSchema.index({ originCity: 1, destinationCity: 1, isActive: 1 });

export const Bus = mongoose.model('Bus', busSchema);
