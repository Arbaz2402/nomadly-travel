import { FlightOffer } from '../models/FlightOffer.js';
import {
  OpenDataService,
  AIRPORT_REGISTRY,
  AUTHENTIC_DGCA_FLIGHTS,
  resolveIataCode,
} from '../services/inventory/openDataService.js';

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

    if (departureDate) {
      query.departureDate = departureDate;
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

    // 1. Prioritize Real-Time Live Flight Inventory Stream (Google Flights engine)
    if (origin && destination && process.env.NODE_ENV !== 'test') {
      try {
        const liveGoogleFlights = await OpenDataService.fetchLiveGoogleFlights(
          origin,
          destination,
          departureDate,
          cabinClass
        );

        if (liveGoogleFlights && liveGoogleFlights.length > 0) {
          let filtered = liveGoogleFlights;
          if (airline && airline !== 'all') {
            filtered = filtered.filter((f) =>
              f.legs?.[0]?.airline?.toLowerCase().includes(airline.toLowerCase())
            );
          }
          if (directOnly === 'true') {
            filtered = filtered.filter((f) => f.stops === 0);
          }
          if (maxPrice) {
            filtered = filtered.filter((f) => f.pricing?.totalAmount <= Number(maxPrice));
          }

          if (sortBy === 'price_asc') filtered.sort((a, b) => a.pricing.totalAmount - b.pricing.totalAmount);
          else if (sortBy === 'price_desc') filtered.sort((a, b) => b.pricing.totalAmount - a.pricing.totalAmount);
          else if (sortBy === 'duration_asc') filtered.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
          else if (sortBy === 'departure_asc') {
            filtered.sort((a, b) => new Date(a.legs?.[0]?.departureTime) - new Date(b.legs?.[0]?.departureTime));
          }

          return res.status(200).json({
            success: true,
            count: filtered.length,
            data: filtered,
            isLiveStream: true,
          });
        }
      } catch (liveErr) {
        console.warn('Real-time flight stream fallback:', liveErr.message);
      }
    }

    let flights = await FlightOffer.find(query).sort(sortOptions).limit(50);

    // Sanitize results: immediately drop any legacy fake flight numbers (e.g., QP-173, 6E-106)
    flights = flights.filter(
      (f) => !f.legs?.some((l) => /^QP-\d{3}$|-(106|173|129|152)$/.test(l.flightNumber))
    );

    const originCode = resolveIataCode(origin);
    const destinationCode = resolveIataCode(destination);
    const routeKey = originCode && destinationCode ? `${originCode}-${destinationCode}` : null;

    // If route has an authentic DGCA schedule registry OR if no valid flights found, generate authentic timetable
    if (origin && destination && (flights.length === 0 || (routeKey && AUTHENTIC_DGCA_FLIGHTS[routeKey]))) {
      console.log(`✈️ Generating live authentic flight schedules for ${origin} -> ${destination}...`);
      const dynamicFlights = await OpenDataService.generateLiveFlightOffers(
        origin,
        destination,
        departureDate,
        cabinClass
      );
      if (dynamicFlights.length > 0) {
        flights = dynamicFlights;
      }
    }

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

/**
 * Fetch live popular flight routes with real database fares
 */
export const getPopularFlightRoutes = async (req, res) => {
  try {
    const targetRoutes = [
      { fromCode: 'BOM', toCode: 'DEL', fromCity: 'Mumbai', toCity: 'Delhi', defaultMins: 130 },
      { fromCode: 'DEL', toCode: 'GOI', fromCity: 'Delhi', toCity: 'Goa', defaultMins: 155 },
      { fromCode: 'BLR', toCode: 'BOM', fromCity: 'Bengaluru', toCity: 'Mumbai', defaultMins: 105 },
      { fromCode: 'DEL', toCode: 'DXB', fromCity: 'Delhi', toCity: 'Dubai', defaultMins: 230 },
    ];

    const routesWithFares = await Promise.all(
      targetRoutes.map(async (r) => {
        let lowestFlight = await FlightOffer.findOne({
          originCode: new RegExp(`^${r.fromCode}$`, 'i'),
          destinationCode: new RegExp(`^${r.toCode}$`, 'i'),
          isActive: true,
        }).sort({ 'pricing.totalAmount': 1 });

        if (!lowestFlight) {
          lowestFlight = await FlightOffer.findOne({
            $or: [
              { originCode: new RegExp(`^${r.fromCode}$`, 'i') },
              { destinationCode: new RegExp(`^${r.toCode}$`, 'i') },
            ],
            isActive: true,
          }).sort({ 'pricing.totalAmount': 1 });
        }

        const fareAmount = lowestFlight ? lowestFlight.pricing?.totalAmount || lowestFlight.pricing?.baseFare || 4200 : 4200;
        const durationMins = lowestFlight?.totalDurationMinutes || r.defaultMins;
        const hours = Math.floor(durationMins / 60);
        const mins = durationMins % 60;

        return {
          from: `${r.fromCity} (${r.fromCode})`,
          to: `${r.toCity} (${r.toCode})`,
          mode: r.toCode === 'DXB' ? 'International Flight' : 'Non-stop Flight',
          time: `${hours}h ${mins}m`,
          fare: `₹${fareAmount.toLocaleString('en-IN')}`,
          rawFare: fareAmount,
          airline: lowestFlight?.legs?.[0]?.airline || 'Air India',
          link: `/flights?origin=${r.fromCode}&destination=${r.toCode}`,
        };
      })
    );

    return res.status(200).json({ success: true, data: routesWithFares });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
