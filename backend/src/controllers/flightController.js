import { FlightOffer } from '../models/FlightOffer.js';

export const searchFlights = async (req, res) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      cabinClass = 'economy',
      directOnly,
      airline,
      maxPrice,
      sortBy = 'price_asc',
    } = req.query;

    const query = { isActive: true };

    if (origin) {
      query.$or = [
        { originCode: new RegExp(`^${origin}$`, 'i') },
        { originCity: new RegExp(origin, 'i') },
      ];
    }

    if (destination) {
      const destMatch = [
        { destinationCode: new RegExp(`^${destination}$`, 'i') },
        { destinationCity: new RegExp(destination, 'i') },
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: destMatch }];
        delete query.$or;
      } else {
        query.$or = destMatch;
      }
    }

    if (cabinClass && cabinClass !== 'all') {
      query.cabinClass = cabinClass;
    }

    if (directOnly === 'true') {
      query.stops = 0;
    }

    if (airline && airline !== 'all') {
      query['legs.airline'] = new RegExp(airline, 'i');
    }

    if (maxPrice) {
      query['pricing.totalAmount'] = { $lte: Number(maxPrice) };
    }

    let sortOptions = {};
    if (sortBy === 'price_asc') sortOptions = { 'pricing.totalAmount': 1 };
    else if (sortBy === 'price_desc') sortOptions = { 'pricing.totalAmount': -1 };
    else if (sortBy === 'duration_asc') sortOptions = { totalDurationMinutes: 1 };
    else if (sortBy === 'departure_asc') sortOptions = { 'legs.0.departureTime': 1 };

    const flights = await FlightOffer.find(query).sort(sortOptions).limit(50);

    return res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFlightById = async (req, res) => {
  try {
    const flight = await FlightOffer.findById(req.params.id);
    if (!flight) {
      return res.status(404).json({ success: false, message: 'Flight offer not found' });
    }
    return res.status(200).json({ success: true, data: flight });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFlightAirports = async (req, res) => {
  try {
    const airports = [
      { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport', country: 'India' },
      { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International Airport', country: 'India' },
      { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport', country: 'India' },
      { code: 'GOI', city: 'Goa', name: 'Dabolim Airport / Mopa', country: 'India' },
      { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport', country: 'India' },
      { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport', country: 'India' },
      { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhash Chandra Bose Airport', country: 'India' },
      { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'United Arab Emirates' },
      { code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport', country: 'Singapore' },
      { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'United Kingdom' },
    ];
    return res.status(200).json({ success: true, data: airports });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
