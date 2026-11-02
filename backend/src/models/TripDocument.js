import mongoose from 'mongoose';

const tripDocumentSchema = new mongoose.Schema(
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
        'flight_ticket',
        'hotel_confirmation',
        'train_ticket',
        'bus_ticket',
        'travel_insurance',
        'expense_receipt',
        'passport_visa',
        'other',
      ],
      default: 'other',
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true, // e.g. application/pdf, image/jpeg, image/png
    },
    fileSize: {
      type: Number,
      required: true, // in bytes
    },
    fileData: {
      type: String,
      required: true, // Data URL / Base64 string for secure standalone storage
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploadedByName: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

tripDocumentSchema.index({ trip: 1, category: 1 });

export const TripDocument = mongoose.model('TripDocument', tripDocumentSchema);

