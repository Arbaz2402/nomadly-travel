import { Hotel } from '../models/Hotel.js';
import { FlightOffer } from '../models/FlightOffer.js';

// Curated destinations with rich itineraries, galleries, and perks for combo packages
const POPULAR_DESTINATIONS = [
  {
    city: 'Goa',
    origin: 'DEL',
    originCity: 'New Delhi',
    nights: 3,
    tagline: 'Sun, Sand & Sunset Catamarans',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1000&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&q=80',
    ],
    overview:
      'Immerse yourself in the ultimate tropical coastal escape. From the golden palm-fringed sands of South Goa to the vibrant sunset catamarans across Mandovi River, this luxury package pairs non-stop return flights with a 5-star oceanfront resort.',
    highlights: [
      'Return non-stop flights with 15kg check-in & 7kg cabin baggage',
      '3 Nights in a Luxury Sea-View Cottage with private balcony',
      'Daily chef-curated champagne breakfast & sunset high tea',
      'Private AC SUV airport pickup and drop-off included',
      'Grand Island dolphin sighting & catamaran cruise voucher',
      'Complimentary 45-minute Swedish couples massage credit',
    ],
    roomType: 'Luxury Sea-Facing Cottage with Plunge Balcony',
    perks: ['Daily Champagne Breakfast', 'Private Airport Transfers in AC SUV', 'Grand Island Scuba Dive Credit'],
    inclusions: [
      'Roundtrip Economy flights from New Delhi (DEL) to Goa (GOI)',
      '3 Nights accommodation at premium 5★ beachfront resort',
      'All airport transfers via private executive SUV',
      'Daily gourmet buffet breakfast and evening cocktails',
      'Half-day private sunset catamaran cruise with mocktails',
      'All local taxes, resort amenity fees & GST included',
    ],
    exclusions: [
      'Personal water-sports not mentioned in highlights',
      'Room service meals beyond breakfast & designated high tea',
      'Early check-in prior to 12:00 PM without advance notice',
    ],
    cancellationPolicy: 'Free cancellation up to 48 hours before scheduled departure. 100% refund processed within 24 hours.',
    discountPercent: 15,
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Paradise & Sunset High Tea',
        description:
          'Chauffeured pickup from Goa Dabolim/Mopa airport in a private AC SUV. Check into your sea-facing luxury room, unwind with a chilled welcome coconut drink, and enjoy a curated sunset high tea by the infinity pool overlooking the Arabian Sea.',
      },
      {
        day: 2,
        title: 'Grand Island Catamaran & Dolphin Sighting',
        description:
          'Board an exclusive private catamaran for a morning voyage to Grand Island. Enjoy coastal dolphin watching, snorkeling in clear reef waters, and a freshly prepared barbecue lunch on a private sandbar.',
      },
      {
        day: 3,
        title: 'Latin Quarter Heritage Walk & Fine Dining',
        description:
          'Explore the colorful Portuguese architecture and art cafes of Fontainhas in Panjim with a dedicated local historian. Return to the resort for your complimentary couples spa treatment followed by a candlelit beachfront dinner.',
      },
      {
        day: 4,
        title: 'Leisure Morning & Departure Transfer',
        description:
          'Indulge in a leisurely champagne breakfast. Enjoy the resort private beach and pool amenities until your private transfer whisks you to the airport for your return flight home.',
      },
    ],
  },
  {
    city: 'Udaipur',
    origin: 'BOM',
    originCity: 'Mumbai',
    nights: 3,
    tagline: 'Lakeside Royalty & Heritage Palaces',
    heroImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1000&q=80',
    ],
    overview:
      'Step into royal majesty in the City of Lakes. Experience timeless Rajasthani hospitality, grand marble courtyards, and sunset boat rides past illuminated palace facades on Lake Pichola.',
    highlights: [
      'Return flights from Mumbai (BOM) to Udaipur (UDR)',
      '3 Nights in a Royal Heritage Suite with Pichola lake views',
      'Traditional ceremonial welcome with rose petals and shehnai',
      'Private sunset solar boat charter on Lake Pichola to Jagmandir Island',
      'Guided private tour of the majestic City Palace and Crystal Gallery',
      '20% dining & Ayurvedic spa wellness voucher',
    ],
    roomType: 'Royal Lake View Suite with Rajasthani Jharokha',
    perks: ['Heritage Welcome with Folk Music', 'Royal Lake Pichola Boat Charter', '20% Spa & Dining Voucher'],
    inclusions: [
      'Return non-stop flights from Mumbai to Udaipur',
      '3 Nights stay in 5★ Heritage Palace resort',
      'Daily royal breakfast at courtyard restaurant',
      'Private Lake Pichola boat tour with high tea at Jagmandir',
      'All monument entry tickets and English-speaking royal guide',
      'Roundtrip private airport transfers',
    ],
    exclusions: [
      'Alcoholic beverages and items of personal nature',
      'Discretionary tips for palace chauffeurs and guides',
    ],
    cancellationPolicy: 'Flexible cancellation: full refund up to 72 hours before check-in date.',
    discountPercent: 18,
    itinerary: [
      {
        day: 1,
        title: 'Royal Arrival & Pichola Sunset',
        description:
          'Arrive at Maharana Pratap Airport where your private royal chauffeur meets you. Check into your heritage suite with traditional garland greeting. Watch the golden hour over Lake Pichola from the palace terrace.',
      },
      {
        day: 2,
        title: 'City Palace Splendor & Jagdish Temple',
        description:
          'Morning guided private walk through the corridors of Udaipur City Palace and the 400-year-old Jagdish Temple. Evening solar boat charter to Jagmandir Island Palace for royal high tea.',
      },
      {
        day: 3,
        title: 'Saheliyon-ki-Bari & Rajasthani Folk Evening',
        description:
          'Visit the serene royal gardens of Saheliyon-ki-Bari and artisan craft centers. In the evening, witness an authentic Dharohar folk dance and puppet show at Bagore Ki Haveli.',
      },
      {
        day: 4,
        title: 'Morning Yoga & Departure Transfer',
        description:
          'Sunrise yoga overlooking the lake, followed by a lavish royal breakfast. Leisure time for souvenir shopping at Bada Bazaar before your departure flight.',
      },
    ],
  },
  {
    city: 'Dubai',
    origin: 'DEL',
    originCity: 'New Delhi',
    nights: 4,
    tagline: 'Futuristic Luxury & Crimson Dunes',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&q=80',
      'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1000&q=80',
      'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1000&q=80',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1000&q=80',
    ],
    overview:
      'Experience the pinnacle of Arabian glamour, futuristic skyscrapers, world-class shopping, and thrilling desert adventures. Featuring return international flights and a prestigious Marina skyscraper hotel.',
    highlights: [
      'Direct return international flights between New Delhi and Dubai',
      '4 Nights in a Premium Marina Skyline Suite',
      'VIP At The Top access to Burj Khalifa 124th & 125th floors',
      'Red Dunes Desert 4x4 Safari with BBQ dinner, camel ride & fire show',
      'Dubai Marina Luxury Yacht Cruise with buffet dinner',
      'Exclusive private Mercedes-Benz airport transfers',
    ],
    roomType: 'Executive Marina View High-Floor Suite',
    perks: ['Complimentary Red Dunes 4x4 Safari', 'Burj Khalifa At The Top Access', 'Luxury Airport Limousine'],
    inclusions: [
      'Return Emirates / Air India flights (DEL - DXB)',
      '4 Nights luxury hotel stay in Dubai Marina / Downtown',
      'Daily international buffet breakfast',
      'Burj Khalifa Level 124+125 non-peak entry tickets',
      'Desert Safari with dune bashing, tanoura dance & BBQ feast',
      'Marina dinner cruise with live entertainment',
      'Roundtrip airport transfers in luxury vehicle',
    ],
    exclusions: [
      'UAE Tourist Visa (can be assisted on request)',
      'Tourism Dirham fee payable directly at hotel check-in',
    ],
    cancellationPolicy: 'Free cancellation up to 5 days prior to international departure.',
    discountPercent: 20,
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Glamorous Dubai & Marina Check-in',
        description:
          'Arrive at DXB International Airport. Private luxury transfer to your Dubai Marina hotel. Spend the evening strolling along the dazzling Marina Promenade with its waterfront restaurants.',
      },
      {
        day: 2,
        title: 'Burj Khalifa, Dubai Mall & Fountain Show',
        description:
          'Visit the iconic Dubai Mall, witness the giant Dubai Aquarium, and ascend the Burj Khalifa high-speed elevator to the 124th floor observation deck. End the evening watching the synchronized Fountain Show.',
      },
      {
        day: 3,
        title: 'Red Dunes Desert Safari with Arabian BBQ',
        description:
          'Afternoon pickup in a 4x4 Land Cruiser. Thrilling dune bashing over crimson sand dunes, sandboarding, camel rides, followed by an open-air bedouin camp feast with tanoura and fire performances.',
      },
      {
        day: 4,
        title: 'Old Dubai Gold Souk & Marina Yacht Dinner',
        description:
          'Explore traditional Dubai: cross Dubai Creek on a wooden abra to the spice and gold souks. In the evening, embark on a glass-enclosed yacht cruise along Dubai Marina and Palm Jumeirah.',
      },
      {
        day: 5,
        title: 'Duty Free Shopping & Homeward Flight',
        description:
          'Enjoy a leisurely breakfast and pool time. Your chauffeur transfers you to DXB for duty-free shopping and your return flight home.',
      },
    ],
  },
  {
    city: 'Jaipur',
    origin: 'BOM',
    originCity: 'Mumbai',
    nights: 2,
    tagline: 'Royal Haveli Heritage Retreat',
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1000&q=80',
      'https://images.unsplash.com/photo-1603258849062-870341c3038a?w=1000&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80',
    ],
    overview:
      'Immerse yourself in the Pink Citys majestic history. Explore ancient hilltop forts, ornate pink sandstone palaces, and vibrant spice bazaars on a curated luxury getaway.',
    highlights: [
      'Direct return flights Mumbai to Jaipur',
      '2 Nights in a converted 5★ Royal Haveli',
      'Privileged jeep ride to the gates of Amer Fort',
      'Exclusive photography session at Hawa Mahal & Jal Mahal',
      'Traditional 7-course Rajasthani thali banquet',
      'Late check-out guaranteed until 4:00 PM',
    ],
    roomType: 'Heritage Deluxe Haveli Suite with Antique Furnishings',
    perks: ['Guided Amer Fort Heritage Walk', 'Complimentary Traditional Rajasthani Thali', 'Late Check-out until 4 PM'],
    inclusions: [
      'Return flights from Mumbai to Jaipur',
      '2 Nights accommodation in 5★ Heritage Haveli',
      'Daily royal breakfast and one celebratory thali dinner',
      'All local sightseeing in private AC car with certified guide',
      'Amer Fort jeep transfer & monument entrance fees',
    ],
    exclusions: ['Camera fees at heritage monuments', 'Personal shopping and artisan handicraft purchases'],
    cancellationPolicy: '100% refund on cancellations requested 48+ hours before travel date.',
    discountPercent: 15,
    itinerary: [
      {
        day: 1,
        title: 'Pink City Welcome & Jal Mahal Sunset',
        description:
          'Fly into Jaipur. Check into your heritage haveli, sip royal spiced chai, and enjoy an evening drive past the glowing Jal Mahal in the middle of Man Sagar Lake.',
      },
      {
        day: 2,
        title: 'Amer Fort, Hawa Mahal & Artisan Bazaars',
        description:
          'Ascend Amer Fort in an open-top jeep, marvel at the mirrorwork of Sheesh Mahal, visit the honeycomb windows of Hawa Mahal, and browse Johari Bazaar for blue pottery and jewels.',
      },
      {
        day: 3,
        title: 'City Palace & Return Flight',
        description:
          'Morning visit to the Royal City Palace and Jantar Mantar sundials. Late check-out at 4:00 PM and airport transfer for your evening flight back to Mumbai.',
      },
    ],
  },
  {
    city: 'Srinagar',
    origin: 'DEL',
    originCity: 'New Delhi',
    nights: 4,
    tagline: 'Dal Lake Houseboats & Alpine Meadows',
    heroImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&q=80',
    ],
    overview:
      'Lose yourself in paradise on earth. Wake up to misty waters on a hand-carved cedarwood luxury houseboat on Dal Lake, float through lotus blossoms in a shikara, and ride the highest cable car in the world in Gulmarg.',
    highlights: [
      'Return flights between New Delhi and Srinagar',
      '2 Nights on a Royal Dal Lake Houseboat + 2 Nights in Gulmarg Resort',
      'Sunset Shikara boat ride through Dal Lake floating vegetable gardens',
      'Gulmarg Gondola Phase 1 & 2 tickets included',
      'Authentic 12-dish Kashmiri Wazwan dinner experience',
      'Private 4WD heating-equipped vehicle for all transfers',
    ],
    roomType: 'Hand-Carved Walnut Wood Heritage Houseboat Suite',
    perks: ['Shikara Boat Sunset Ride on Dal Lake', 'Traditional Kashmiri Wazwan Feast', 'Gulmarg Gondola Transfer'],
    inclusions: [
      'Roundtrip flights DEL - SXR',
      '4 Nights total accommodation (Houseboat + Alpine Resort)',
      'Daily hot Kashmiri Kahwa tea & traditional buffet breakfasts',
      'Shikara rides on Dal Lake and Nigeen Lake',
      'Full-day private excursion to Gulmarg with snow gear assistance',
    ],
    exclusions: ['Gulmarg sledge and pony ride fees', 'Personal winter jacket hire'],
    cancellationPolicy: 'Full refund up to 72 hours before flight departure.',
    discountPercent: 18,
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Srinagar & Dal Lake Shikara',
        description:
          'Airport transfer to the jetty. Cross Dal Lake by wooden shikara to your ornate cedar houseboat. Enjoy hot saffron Kahwa tea as the sun sets behind the Zabarwan mountains.',
      },
      {
        day: 2,
        title: 'Mughal Gardens & Floating Markets',
        description:
          'Early dawn shikara tour through the tranquil floating flower and vegetable markets. Afternoon visit to the terraced Mughal gardens of Nishat Bagh and Shalimar Bagh.',
      },
      {
        day: 3,
        title: 'Alpine Wonderland in Gulmarg',
        description:
          'Scenic drive up to Gulmarg. Check into your mountain resort, ride the famous Gulmarg Gondola up to Apharwat Peak, and enjoy panoramic views of snow-clad Himalayan ranges.',
      },
      {
        day: 4,
        title: 'Pahalgam Valley & Saffron Fields of Pampore',
        description:
          'Day excursion through the fragrant saffron fields of Pampore to the emerald waters of the Lidder River in Pahalgam. Evening multi-course Wazwan feast.',
      },
      {
        day: 5,
        title: 'Morning Saffron Shopping & Departure',
        description:
          'Pick up authentic Kashmiri walnuts, saffron, and pashmina shawls before your chauffeur transfers you to Srinagar Airport for your return flight.',
      },
    ],
  },
  {
    city: 'Mumbai',
    origin: 'DEL',
    originCity: 'New Delhi',
    nights: 2,
    tagline: 'Marine Drive & Arabian Sea Yachting',
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1000&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&q=80',
    ],
    overview:
      'Feel the electric pulse of the Maximum City. Stay at a premier 5-star seafront hotel, charter an evening sailboat from the historic Gateway of India, and dine at celebrated culinary hotspots.',
    highlights: [
      'Return flights between New Delhi and Mumbai',
      '2 Nights at a Luxury 5★ Seafront Hotel on Marine Drive / Colaba',
      'Private sunset yacht charter departing from Gateway of India',
      'Daily gourmet breakfast buffet at iconic sea-facing restaurant',
      'Guided art deco architecture walk through South Mumbai',
      'VIP airport concierge and private chauffeur',
    ],
    roomType: 'Arabian Sea View Grand Executive Room',
    perks: ['Sunset Yacht Cruise from Gateway of India', 'Breakfast at Sea Lounge', 'VIP Concierge'],
    inclusions: [
      'Return flights DEL - BOM',
      '2 Nights 5★ luxury seafront hotel stay',
      'Private 90-minute sunset yacht sailing charter',
      'Daily breakfast and luxury lounge access',
      'Private executive airport transfers in Mercedes/BMW',
    ],
    exclusions: ['Dinner reservations at external restaurants', 'Discretionary tips'],
    cancellationPolicy: 'Free cancellation up to 48 hours prior to check-in.',
    discountPercent: 15,
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Mumbai & Sunset Yacht Sailing',
        description:
          'Touch down at Mumbai Terminal 2 and enjoy private executive transfer to South Mumbai. Board your private sailboat from Gateway of India for sunset wine and views of the Mumbai skyline from the harbor.',
      },
      {
        day: 2,
        title: 'Heritage South Mumbai, Art Deco & Bandra',
        description:
          'Morning architectural walk around Oval Maidan, Victoria Terminus, and Kala Ghoda art district. Cross the Bandra-Worli Sea Link for boutique shopping and sunset dining in Bandra.',
      },
      {
        day: 3,
        title: 'Marine Drive Queens Necklace & Departure',
        description:
          'Sunrise jog or walk along Marine Drive, lavish breakfast at the hotel, followed by private chauffeur transfer to Mumbai Airport for your return flight.',
      },
    ],
  },
];

/**
 * Helper to build complete package object with real DB hotel and flight data
 */
const buildPackageObject = async (destConfig, nightsOverride) => {
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
      targetList.map((destConfig) => buildPackageObject(destConfig, nights))
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
 * Get package details by ID or City
 */
export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const cleanId = String(id).toLowerCase().trim();

    // Match by package id (pkg-goa-3n), city name (goa), or partial match
    const destConfig = POPULAR_DESTINATIONS.find(
      (d) =>
        `pkg-${d.city.toLowerCase()}-${d.nights}n` === cleanId ||
        d.city.toLowerCase() === cleanId ||
        cleanId.includes(d.city.toLowerCase())
    );

    if (!destConfig) {
      return res.status(404).json({ success: false, message: 'Vacation package not found.' });
    }

    const pkg = await buildPackageObject(destConfig);
    return res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
