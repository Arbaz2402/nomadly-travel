import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['flight', 'hotel', 'train', 'bus', 'destination'],
      required: true,
    },
    itemId: {
      type: String,
      required: true,
    },
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String },
    basePrice: { type: Number },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

wishlistSchema.index({ user: 1, category: 1, itemId: 1 }, { unique: true });

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
