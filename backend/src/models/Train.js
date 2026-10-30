import mongoose from 'mongoose';

const trainStopSchema = new mongoose.Schema({
  stationCode: { type: String, required: true },
  stationName: { type: String, required: true },
  arrivalTime: { type: String }, // e.g. "08:15"
  departureTime: { type: String }, // e.g. "08:20"
  haltMinutes: { type: Number, default: 5 },
  distanceKm: { type: Number, default: 0 },
  dayNumber: { type: Number, default: 1 },
});

const trainClassAvailabilitySchema = new mongoose.Schema({
  classCode: {
    type: String,
    enum: ['1A', '2A', '3A', 'CC', 'EC', 'SL', '3E'],
    required: true,
  },
  className: { type: String, required: true }, // e.g. "Executive Chair Car (EC)" or "AC 3 Tier (3A)"
  fare: { type: Number, required: true },
  availableSeats: { type: Number, default: 42 },
  status: { type: String, enum: ['AVAILABLE', 'RAC', 'WL', 'REGRET'], default: 'AVAILABLE' },
  statusText: { type: String, default: 'AVL 42' },
});

const trainSchema = new mongoose.Schema(
  {
    trainNumber: { type: String, required: true, unique: true, index: true }, // e.g. "20901"
    trainName: { type: String, required: true, index: true }, // e.g. "Vande Bharat Express"
    trainType: {
      type: String,
      enum: ['Vande Bharat', 'Rajdhani', 'Shatabdi', 'Tejas', 'Superfast', 'Mail Express'],
      default: 'Superfast',
    },
    originStationCode: { type: String, required: true, index: true },
    originStationName: { type: String, required: true },
    originCity: { type: String, required: true, index: true },
    destinationStationCode: { type: String, required: true, index: true },
    destinationStationName: { type: String, required: true },
    destinationCity: { type: String, required: true, index: true },
    departureTime: { type: String, required: true }, // "06:00"
    arrivalTime: { type: String, required: true }, // "11:25"
    durationMinutes: { type: Number, required: true },
    daysRunning: [{ type: String }], // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    stops: [trainStopSchema],
    classes: [trainClassAvailabilitySchema],
    cateringAvailable: { type: Boolean, default: true },
    pantryCar: { type: Boolean, default: true },
    punctualityScore: { type: Number, default: 94 }, // percentage
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

trainSchema.index({ originCity: 1, destinationCity: 1 });
trainSchema.index({ originStationCode: 1, destinationStationCode: 1 });

export const Train = mongoose.model('Train', trainSchema);
