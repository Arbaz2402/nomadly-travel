import { Hotel } from '../models/Hotel.js';
import { FlightOffer } from '../models/FlightOffer.js';

// Curated destinations for combo packages
const POPULAR_DESTINATIONS = [
  {
    city: 'Goa',
    origin: 'DEL',
    originCity: 'New Delhi',
    nights: 3,
    tagline: 'Sun, Sand & Sunset Catamarans',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1000&q=80',
    perks: ['Daily Champagne Breakfast', 'Private Airport Transfers in AC SUV', 'Grand Island Scuba Dive Credit'],
    discountPercent: 15,
  },
  {
    city: 'Udaipur',
    origin: 'BOM',
    originCity: 'Mumbai',
    nights: 3,
    tagline: 'Lakeside Royalty & Heritage Palaces',
    heroImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&q=80',
    perks: ['Heritage Welcome with Folk Music', 'Royal Lake Pichola Boat Charter', '20% Spa & Dining Voucher'],
    discountPercent: 18,
  },
  {
    city: 'Dubai',
    origin: 'DEL',
    originCity: 'New Delhi',
    nights: 4,
    tagline: 'Futuristic Luxury & Crimson Dunes',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&q=80',
    perks: ['Complimentary Red Dunes 4x4 Safari', 'Burj Khalifa At The Top Access', 'Luxury Airport Limousine'],
    discountPercent: 20,
  },
  {
    city: 'Jaipur',
    origin: 'BOM',
    originCity: 'Mumbai',
    nights: 2,
    tagline: 'Royal Haveli Heritage Retreat',
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1000&q=80',
    perks: ['Guided Amer Fort Heritage Walk', 'Complimentary Traditional Rajasthani Thali', 'Late Check-out until 4 PM'],
    discountPercent: 15,
  },
  {
    city: 'Srinagar',
    origin: 'DEL',
    originCity: 'New Delhi',
    nights: 4,
    tagline: 'Dal Lake Houseboats & Alpine Meadows',
    heroImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80',
    perks: ['Shikara Boat Sunset Ride on Dal Lake', 'Traditional Kashmiri Wazwan Feast', 'Gulmarg Gondola Transfer'],
    discountPercent: 18,
  },
  {
    city: 'Mumbai',
    origin: 'DEL',
    originCity: 'New Delhi',
    nights: 2,
    tagline: 'Marine Drive & Arabian Sea Yachting',
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1000&q=80',
    perks: ['Sunset Yacht Cruise from Gateway of India', 'Breakfast at Sea Lounge', 'VIP Concierge'],
    discountPercent: 15,
  },
];

/**
 * Fetch dynamic flight + hotel vacation packages
 */
export const getVacationPackages = async (req, res) => {
  try {
    const { destination, nights } = req.query;

    const filteredConfigs = destination
      ? POPULAR_DESTINATIONS.filter(
          (d) => d.city.toLowerCase() === destination.toLowerCase()
        )
      : POPULAR_DESTINATIONS;

    const targetList = filteredConfigs.length > 0 ? filteredConfigs : POPULAR_DESTINATIONS;

    const packages = await Promise.all(
      targetList.map(async (destConfig) => {
        // Find best real hotel for this city
        const hotel = await Hotel.findOne({
          city: new RegExp(destConfig.city, 'i'),
        }).sort({ rating: -1, starRating: -1 });

        // Find best real flight for this route
        let flight = await FlightOffer.findOne({
          originCity: new RegExp(destConfig.originCity, 'i'),
          destinationCity: new RegExp(destConfig.city, 'i'),
        }).sort({ 'pricing.baseFare': 1 });

        if (!flight) {
          flight = await FlightOffer.findOne({
            destinationCity: new RegExp(destConfig.city, 'i'),
          }).sort({ 'pricing.baseFare': 1 });
        }

        // If no matching flight in DB, fallback to typical airline fare
        const flightPrice = flight ? flight.pricing?.totalPayable || flight.pricing?.baseFare || 5200 : 5400;
        const hotelNightly = hotel ? hotel.cheapestPrice || 4800 : 5200;
        const totalDurationNights = nights ? Number(nights) : destConfig.nights;

        const originalTotal = flightPrice * 2 + hotelNightly * totalDurationNights; // return flight + nights
        const discountAmount = Math.round((originalTotal * destConfig.discountPercent) / 100);
        const packagePrice = originalTotal - discountAmount;

        return {
          id: `pkg-${destConfig.city.toLowerCase()}-${destConfig.nights}n`,
          title: `${destConfig.city} Exclusive ${totalDurationNights}N Getaway`,
          tagline: destConfig.tagline,
          destinationCity: destConfig.city,
          originCity: destConfig.originCity,
          originAirportCode: destConfig.origin,
          nights: totalDurationNights,
          heroImage: destConfig.heroImage,
          discountPercent: destConfig.discountPercent,
          pricing: {
            originalTotal,
            packagePrice,
            savings: discountAmount,
            perPerson: Math.round(packagePrice / 2),
            currency: 'INR',
          },
          hotel: hotel
            ? {
                id: hotel._id,
                name: hotel.name,
                starRating: hotel.starRating,
                rating: hotel.rating,
                photos: hotel.photos,
                address: hotel.address,
              }
            : null,
          flight: flight
            ? {
                id: flight._id,
                flightNumber: flight.legs?.[0]?.flightNumber || 'AI-842',
                airline: flight.legs?.[0]?.airline || 'Air India',
                airlineLogo: flight.legs?.[0]?.airlineLogo,
                durationMinutes: flight.totalDurationMinutes || 135,
              }
            : null,
          perks: destConfig.perks,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get package details by ID
 */
export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const all = await getVacationPackagesList();
    const pkg = all.find((p) => p.id === id);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Vacation package not found.' });
    }

    return res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Helper internal getter
const getVacationPackagesList = async () => {
  const packages = await Promise.all(
    POPULAR_DESTINATIONS.map(async (destConfig) => {
      const hotel = await Hotel.findOne({
        city: new RegExp(destConfig.city, 'i'),
      }).sort({ rating: -1 });

      const flight = await FlightOffer.findOne({
        destinationCity: new RegExp(destConfig.city, 'i'),
      }).sort({ 'pricing.baseFare': 1 });

      const flightPrice = flight ? flight.pricing?.totalPayable || 5200 : 5400;
      const hotelNightly = hotel ? hotel.cheapestPrice || 4800 : 5200;
      const originalTotal = flightPrice * 2 + hotelNightly * destConfig.nights;
      const discountAmount = Math.round((originalTotal * destConfig.discountPercent) / 100);
      const packagePrice = originalTotal - discountAmount;

      return {
        id: `pkg-${destConfig.city.toLowerCase()}-${destConfig.nights}n`,
        title: `${destConfig.city} Exclusive ${destConfig.nights}N Getaway`,
        tagline: destConfig.tagline,
        destinationCity: destConfig.city,
        originCity: destConfig.originCity,
        nights: destConfig.nights,
        heroImage: destConfig.heroImage,
        discountPercent: destConfig.discountPercent,
        pricing: {
          originalTotal,
          packagePrice,
          savings: discountAmount,
          perPerson: Math.round(packagePrice / 2),
          currency: 'INR',
        },
        hotel,
        flight,
        perks: destConfig.perks,
      };
    })
  );
  return packages;
};
