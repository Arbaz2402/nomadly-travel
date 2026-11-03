import { Bus } from '../models/Bus.js';
import { InventoryHoldService } from '../services/inventory/holdService.js';
import { OpenDataService } from '../services/inventory/openDataService.js';

export const searchBuses = async (req, res) => {
  try {
    const {
      origin,
      destination,
      busType,
      operator,
      minPrice,
      maxPrice,
      sortBy = 'departure_asc',
    } = req.query;

    const query = { isActive: true };

    if (origin && origin.trim() !== '') {
      query.originCity = new RegExp(origin, 'i');
    }

    if (destination && destination.trim() !== '') {
      query.destinationCity = new RegExp(destination, 'i');
    }

    if (busType && busType !== 'all') {
      query.busType = new RegExp(busType, 'i');
    }

    if (operator && operator !== 'all') {
      query.operatorName = new RegExp(operator, 'i');
    }

    if (minPrice || maxPrice) {
      query.baseFare = {};
      if (minPrice) query.baseFare.$gte = Number(minPrice);
      if (maxPrice) query.baseFare.$lte = Number(maxPrice);
    }

    let sortOptions = {};
    if (sortBy === 'price_asc') sortOptions = { baseFare: 1 };
    else if (sortBy === 'price_desc') sortOptions = { baseFare: -1 };
    else if (sortBy === 'rating_desc') sortOptions = { rating: -1 };
    else if (sortBy === 'duration_asc') sortOptions = { durationMinutes: 1 };
    else sortOptions = { departureTime: 1 };

    let buses = await Bus.find(query).sort(sortOptions).limit(30);

    // If no buses found for this route, dynamically generate live authentic bus routes
    if (buses.length === 0 && origin && destination) {
      console.log(`🚌 Generating live authentic bus routes for ${origin} -> ${destination}...`);
      const dynamicBuses = await OpenDataService.generateLiveBusRoutes(origin, destination);
      if (dynamicBuses.length > 0) {
        buses = dynamicBuses;
      }
    }

    return res.status(200).json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ success: false, message: 'Bus service not found' });
    }
    return res.status(200).json({ success: true, data: bus });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const holdSeats = async (req, res) => {
  try {
    const { seatNumbers, sessionId } = req.body;
    const busId = req.params.id;

    if (!seatNumbers || !seatNumbers.length) {
      return res.status(400).json({
        success: false,
        message: 'Seat numbers are required.',
      });
    }

    const effectiveSessionId = sessionId || `session_${req.user?._id || Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const hold = await InventoryHoldService.holdBusSeats({
      busId,
      seatNumbers,
      userId: req.user?._id,
      sessionId: effectiveSessionId,
      durationMinutes: 10,
    });

    return res.status(200).json({
      success: true,
      message: `${seatNumbers.length} seat(s) held successfully for 10 minutes.`,
      data: hold,
    });
  } catch (error) {
    return res.status(409).json({ success: false, message: error.message });
  }
};

export const releaseSeats = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID required.' });
    }
    await InventoryHoldService.releaseHold(sessionId);
    return res.status(200).json({ success: true, message: 'Seats released.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
