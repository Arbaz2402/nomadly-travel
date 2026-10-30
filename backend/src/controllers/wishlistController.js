import { Wishlist } from '../models/Wishlist.js';
import { PriceAlert } from '../models/PriceAlert.js';

export const getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { category, itemId, title, subtitle, image, basePrice, metadata } = req.body;
    const item = await Wishlist.findOneAndUpdate(
      { user: req.user._id, category, itemId },
      { title, subtitle, image, basePrice, metadata },
      { upsert: true, new: true }
    );
    return res.status(201).json({ success: true, message: 'Saved to wishlist', data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ user: req.user._id, _id: req.params.id });
    return res.status(200).json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPriceAlerts = async (req, res) => {
  try {
    const alerts = await PriceAlert.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPriceAlert = async (req, res) => {
  try {
    const { category, origin, destination, travelDate, targetPrice, currentPrice } = req.body;
    const alert = await PriceAlert.create({
      user: req.user._id,
      category,
      origin,
      destination,
      travelDate,
      targetPrice,
      currentPrice,
    });
    return res.status(201).json({ success: true, message: 'Price alert created', data: alert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
