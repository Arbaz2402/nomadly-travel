import { Experience } from '../models/Experience.js';

// Pre-seeded authentic destination experiences catalog
export const REAL_EXPERIENCES_CATALOG = [
  {
    title: 'Grand Island Scuba Diving & Dolphin Cruise',
    slug: 'grand-island-scuba-goa',
    category: 'water_sports',
    destinationCity: 'Goa',
    durationHours: 6,
    pricePerPerson: 2850,
    currency: 'INR',
    rating: 4.9,
    reviewsCount: 480,
    featuredPhoto: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&q=80',
    ],
    overview: 'Explore the vibrant coral reefs of Grande Island with certified PADI dive instructors. Includes speed boat transfer from Sinquerim, pre-dive training pool session, underwater HD video footage, and dolphin sightseeing.',
    highlights: ['PADI certified underwater dive instructor', 'Complimentary underwater photography & 4K video', 'Buffet lunch on the beach & refreshments', 'Sight wild Indo-Pacific humpback dolphins'],
    inclusions: ['Speedboat Transfers', 'Complete Diving Equipment & Wetsuit', 'Breakfast & Goan Lunch', 'Safety Briefing & Training'],
    meetingPoint: 'Sinquerim Boat Jetty, Candolim, Goa',
    isFeatured: true,
    isActive: true,
  },
  {
    title: 'Sunset Yacht Sailing on Arabian Sea',
    slug: 'sunset-yacht-mumbai',
    category: 'adventure',
    destinationCity: 'Mumbai',
    durationHours: 2,
    pricePerPerson: 3200,
    currency: 'INR',
    rating: 4.8,
    reviewsCount: 310,
    featuredPhoto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    ],
    overview: 'Sail past the historic Gateway of India and the Taj Mahal Palace on a private luxury cruising yacht. Watch the golden Mumbai sunset reflect across the Arabian Sea horizon.',
    highlights: ['Private Seabird / MacGregor Class sailboat', 'Panoramic views of the Gateway of India & Mumbai harbor', 'Experienced skipper & safety crew', 'Sunset photo opportunities on the open deck'],
    inclusions: ['2-hour sailing charter', 'Life jackets & safety gear', 'Packaged drinking water & light snacks'],
    meetingPoint: 'Jetty No. 5, Opposite Gateway of India, Colaba, Mumbai',
    isFeatured: true,
    isActive: true,
  },
  {
    title: 'Royal Lake Pichola Private Boat Cruise',
    slug: 'lake-pichola-cruise-udaipur',
    category: 'culture',
    destinationCity: 'Udaipur',
    durationHours: 2.5,
    pricePerPerson: 1850,
    currency: 'INR',
    rating: 4.9,
    reviewsCount: 520,
    featuredPhoto: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    ],
    overview: 'Glide past the marble majesty of Jag Mandir and the City Palace of Udaipur. Learn royal Mewari history from a resident historian while witnessing palace reflections in Lake Pichola.',
    highlights: ['Visit the 17th-century Jag Mandir Island Palace', 'Unobstructed photographic views of Lake Palace & City Palace', 'Audio and live historical storytelling', 'Evening palace illumination viewing'],
    inclusions: ['Charter boat tickets', 'Jag Mandir courtyard entrance', 'Traditional Rajasthani high tea & snacks'],
    meetingPoint: 'Rameshwar Ghat, City Palace Jetty, Udaipur',
    isFeatured: true,
    isActive: true,
  },
  {
    title: 'Red Dunes Desert Safari & Starlit Bedouin BBQ',
    slug: 'red-dunes-safari-dubai',
    category: 'adventure',
    destinationCity: 'Dubai',
    durationHours: 6.5,
    pricePerPerson: 4500,
    currency: 'INR',
    rating: 4.95,
    reviewsCount: 890,
    featuredPhoto: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
      'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800&q=80',
    ],
    overview: 'Experience the exhilarating heights of the Lahbab red dunes in a 4x4 Land Cruiser. Enjoy sandboarding, camel rides, falconry encounters, live Tanoura & fire shows, and a gourmet 5-star Arabic BBQ dinner under the desert stars.',
    highlights: ['Thrilling 45-minute dune bashing on high red dunes', 'Sandboarding down towering crimson sand slopes', 'Live cultural Tanoura dance & belly dance performances', '5-star gourmet BBQ buffet with live grill stations'],
    inclusions: ['4x4 Hotel Pick-up & Drop-off (Dubai city)', 'Camel Ride Experience', 'Buffet BBQ Dinner & Unlimited Refreshments', 'Henna Painting & Traditional Attire Photography'],
    meetingPoint: 'Complimentary pick-up from any hotel or residence in Dubai',
    isFeatured: true,
    isActive: true,
  },
  {
    title: 'Sunrise Hot Air Balloon Flight over Amer Fort',
    slug: 'hot-air-balloon-jaipur',
    category: 'adventure',
    destinationCity: 'Jaipur',
    durationHours: 3.5,
    pricePerPerson: 9200,
    currency: 'INR',
    rating: 4.9,
    reviewsCount: 240,
    featuredPhoto: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80',
    ],
    overview: 'Soar above the Aravali mountain range and historic fortress ramparts of Amer and Jaigarh. Watch the Pink City awaken from a peaceful 60-minute hot air balloon flight operated by DGCA-certified commercial pilots.',
    highlights: ['60-minute sunrise flight over royal forts and rural hamlets', 'DGCA and FAA certified international flight captains', 'First Flight certificate signed by your pilot', 'Champagne celebration upon landing'],
    inclusions: ['Hotel pick-up & drop-off in Jaipur', 'Flight Briefing & Tea/Coffee', '1-Hour Balloon Flight', 'Commemorative Certificate'],
    meetingPoint: 'Pick-up from Jaipur hotels or Amer Launch Site',
    isFeatured: true,
    isActive: true,
  },
  {
    title: 'Shikara Sunset Cruise & Floating Vegetable Market',
    slug: 'dal-lake-shikara-srinagar',
    category: 'culture',
    destinationCity: 'Srinagar',
    durationHours: 3,
    pricePerPerson: 1250,
    currency: 'INR',
    rating: 4.9,
    reviewsCount: 410,
    featuredPhoto: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    ],
    overview: 'Ride an intricately carved cedarwood Shikara through the calm lotus channels of Dal Lake. Visit Char Chinar island, view heritage colonial houseboats, and experience the century-old floating bazaars.',
    highlights: ['Handcrafted cushioned Shikara boat with shaded canopy', 'Visit iconic Char Chinar (Four Chinar Trees) island', 'Sip authentic Kashmiri saffron Kahwa on the water', 'Photographs in traditional Kashmiri Pheran attire'],
    inclusions: ['3-Hour Private Shikara Boat', 'Life jackets & licensed oarsman', 'Kashmiri Kahwa tea tasting'],
    meetingPoint: 'Ghat No. 1, Boulevard Road, Dal Lake, Srinagar',
    isFeatured: true,
    isActive: true,
  },
];

export const searchExperiences = async (req, res) => {
  try {
    const { city, category, minPrice, maxPrice, sortBy = 'rating_desc' } = req.query;

    // Ensure database has default catalog populated
    const count = await Experience.countDocuments();
    if (count === 0) {
      await Experience.insertMany(REAL_EXPERIENCES_CATALOG);
    }

    const query = { isActive: true };

    if (city && city.trim() !== '') {
      query.destinationCity = new RegExp(city.trim(), 'i');
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.pricePerPerson = {};
      if (minPrice) query.pricePerPerson.$gte = Number(minPrice);
      if (maxPrice) query.pricePerPerson.$lte = Number(maxPrice);
    }

    let sortOptions = {};
    if (sortBy === 'price_asc') sortOptions = { pricePerPerson: 1 };
    else if (sortBy === 'price_desc') sortOptions = { pricePerPerson: -1 };
    else if (sortBy === 'duration_asc') sortOptions = { durationHours: 1 };
    else sortOptions = { rating: -1, reviewsCount: -1 };

    let experiences = await Experience.find(query).sort(sortOptions).limit(30);

    // If city search returned 0 items, also return matching city from full catalog or all featured
    if (experiences.length === 0 && (!category || category === 'all')) {
      experiences = await Experience.find({ isActive: true }).sort(sortOptions).limit(20);
    }

    return res.status(200).json({
      success: true,
      count: experiences.length,
      data: experiences,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeaturedExperiences = async (req, res) => {
  try {
    const count = await Experience.countDocuments();
    if (count === 0) {
      await Experience.insertMany(REAL_EXPERIENCES_CATALOG);
    }

    const experiences = await Experience.find({ isFeatured: true, isActive: true }).limit(8);
    return res.status(200).json({ success: true, count: experiences.length, data: experiences });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found.' });
    }
    return res.status(200).json({ success: true, data: experience });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
