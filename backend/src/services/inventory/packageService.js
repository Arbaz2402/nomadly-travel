import { Hotel } from '../../models/Hotel.js';
import { FlightOffer } from '../../models/FlightOffer.js';
import { POPULAR_DESTINATIONS } from './curatedPackagesData.js';

/**
 * Helper to build complete package object with real DB hotel and flight data
 */
export const buildPackageObject = async (destConfig, nightsOverride) => {
  const totalDurationNights = nightsOverride ? Number(nightsOverride) : destConfig.nights;

  // Find best real hotel for this city from DB
  const hotel = await Hotel.findOne({
    city: new RegExp(destConfig.city, 'i'),
  }).sort({ rating: -1, starRating: -1 });

  // Find best real flight for this route from DB
  let flight = await FlightOffer.findOne({
    originCity: new RegExp(destConfig.originCity, 'i'),
    destinationCity: new RegExp(destConfig.city, 'i'),
  }).sort({ 'pricing.baseFare': 1 });

  if (!flight) {
    flight = await FlightOffer.findOne({
      destinationCity: new RegExp(destConfig.city, 'i'),
    }).sort({ 'pricing.baseFare': 1 });
  }

  // Calculate prices based on real flights & hotels with safe fallbacks
  const flightPrice = flight ? flight.pricing?.totalPayable || flight.pricing?.baseFare || 5200 : 5400;
  const hotelNightly = hotel ? hotel.cheapestPrice || 4800 : 5200;

  const originalTotal = flightPrice * 2 + hotelNightly * totalDurationNights; // return flight + hotel nights
  const discountAmount = Math.round((originalTotal * destConfig.discountPercent) / 100);
  const packagePrice = originalTotal - discountAmount;

  const packageId = `pkg-${destConfig.city.toLowerCase()}-${destConfig.nights}n`;

  return {
    id: packageId,
    title: `${destConfig.city} Exclusive ${totalDurationNights}N Getaway`,
    tagline: destConfig.tagline,
    destinationCity: destConfig.city,
    originCity: destConfig.originCity,
    originAirportCode: destConfig.origin,
    nights: totalDurationNights,
    days: totalDurationNights + 1,
    heroImage: destConfig.heroImage,
    gallery: destConfig.gallery || [destConfig.heroImage],
    overview: destConfig.overview,
    highlights: destConfig.highlights,
    roomType: destConfig.roomType,
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
          starRating: hotel.starRating || 5,
          rating: hotel.rating || 4.8,
          photos: hotel.photos?.length ? hotel.photos : [destConfig.heroImage],
          address: hotel.address || `${destConfig.city}, India`,
          amenities: hotel.amenities || ['Free Wi-Fi', 'Swimming Pool', 'Spa & Wellness', 'Fine Dining Restaurant', '24/7 Room Service'],
          cheapestPrice: hotel.cheapestPrice || hotelNightly,
        }
      : {
          id: `hotel-curated-${destConfig.city.toLowerCase()}`,
          name: `${destConfig.city} Luxury Boutique Palace Resort`,
          starRating: 5,
          rating: 4.8,
          photos: [destConfig.heroImage],
          address: `Luxury Enclave, ${destConfig.city}`,
          amenities: ['Ocean/Lake View', 'Swimming Pool', 'Luxury Spa', 'Chef Table Restaurant', 'Butler Service'],
          cheapestPrice: hotelNightly,
        },
    flight: flight
      ? {
          id: flight._id,
          flightNumber: flight.legs?.[0]?.flightNumber || 'AI-842',
          airline: flight.legs?.[0]?.airline || 'Air India',
          airlineLogo: flight.legs?.[0]?.airlineLogo || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&q=80',
          durationMinutes: flight.totalDurationMinutes || 135,
          originAirport: destConfig.origin,
          destinationAirport: destConfig.city.substring(0, 3).toUpperCase(),
          departureTime: '08:30 AM',
          arrivalTime: '10:45 AM',
          cabinClass: 'Economy Prime',
          baggageAllowance: '15 kg Check-in + 7 kg Cabin',
        }
      : {
          id: `flt-curated-${destConfig.city.toLowerCase()}`,
          flightNumber: 'AI-842',
          airline: 'Air India',
          airlineLogo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&q=80',
          durationMinutes: 135,
          originAirport: destConfig.origin,
          destinationAirport: destConfig.city.substring(0, 3).toUpperCase(),
          departureTime: '08:30 AM',
          arrivalTime: '10:45 AM',
          cabinClass: 'Economy Prime',
          baggageAllowance: '15 kg Check-in + 7 kg Cabin',
        },
    perks: destConfig.perks,
    inclusions: destConfig.inclusions,
    exclusions: destConfig.exclusions,
    cancellationPolicy: destConfig.cancellationPolicy,
    itinerary: destConfig.itinerary,
  };
};

/**
 * Fetch filtered or all vacation packages
 */
export const fetchVacationPackages = async ({ destination, nights } = {}) => {
  const filteredConfigs = destination
    ? POPULAR_DESTINATIONS.filter(
        (d) => d.city.toLowerCase() === destination.toLowerCase()
      )
    : POPULAR_DESTINATIONS;

  const targetList = filteredConfigs.length > 0 ? filteredConfigs : POPULAR_DESTINATIONS;

  return Promise.all(
    targetList.map((destConfig) => buildPackageObject(destConfig, nights))
  );
};

/**
 * Fetch a single package by ID, city name, or slug
 */
export const fetchPackageByIdOrCity = async (identifier) => {
  const cleanId = String(identifier).toLowerCase().trim();

  const destConfig = POPULAR_DESTINATIONS.find(
    (d) =>
      `pkg-${d.city.toLowerCase()}-${d.nights}n` === cleanId ||
      d.city.toLowerCase() === cleanId ||
      cleanId.includes(d.city.toLowerCase())
  );

  if (!destConfig) return null;
  return buildPackageObject(destConfig);
};
