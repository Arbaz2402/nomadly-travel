import { Trip } from '../models/Trip.js';

export const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ startDate: 1 });
    return res.status(200).json({ success: true, count: trips.length, data: trips });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('segments.bookingId');
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }
    if (trip.user.toString() !== req.user._id.toString() && !trip.isPublic) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }
    return res.status(200).json({ success: true, data: trip });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTrip = async (req, res) => {
  try {
    const { title, destination, startDate, endDate, budget, description } = req.body;
    const trip = await Trip.create({
      user: req.user._id,
      title,
      destination,
      startDate,
      endDate,
      budget: budget || { totalBudget: 50000, allocatedTransport: 20000, allocatedStay: 25000 },
      description,
    });
    return res.status(201).json({ success: true, data: trip });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addSegmentToTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    trip.segments.push(req.body);
    // Sort segments chronologically
    trip.segments.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
    await trip.save();

    return res.status(200).json({ success: true, data: trip });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTripBudget = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }
    trip.budget = { ...trip.budget, ...req.body };
    await trip.save();
    return res.status(200).json({ success: true, data: trip });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
