import { FlightOffer } from '../models/FlightOffer.js';
import { AmadeusService, AIRPORT_REGISTRY } from '../services/inventory/amadeusService.js';

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

    // 1. Try Amadeus Live API if credentials are configured
    if (AmadeusService.isConfigured() && origin && destination) {
      try {
        console.log(`📡 Querying Amadeus Live API for flights ${origin} -> ${destination}...`);
        const liveFlights = await AmadeusService.searchFlightOffers({
          origin,
          destination,
          departureDate,
          cabinClass,
          directOnly,
        });

        if (liveFlights && liveFlights.length > 0) {
          console.log(`✅ Amadeus returned ${liveFlights.length} live flight offers.`);
          return res.status(200).json({
            success: true,
            provider: 'AMADEUS_LIVE',
            count: liveFlights.length,
            data: liveFlights,
          });
        }
      } catch (amadeusErr) {
        console.warn('⚠️ Amadeus Live API failed, falling back to local catalog:', amadeusErr.message);
      }
    }

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
    const airports = Object.values(AIRPORT_REGISTRY);
    return res.status(200).json({ success: true, count: airports.length, data: airports });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
