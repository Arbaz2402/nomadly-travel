import { Trip } from '../models/Trip.js';
import { ItineraryItem } from '../models/ItineraryItem.js';
import { Hotel } from '../models/Hotel.js';
import { Experience } from '../models/Experience.js';

/**
 * Strips common activity prefix actions to extract the genuine venue / landmark name
 */
export const cleanVenueTitle = (rawTitle = '') => {
  if (!rawTitle) return '';
  return String(rawTitle)
    .replace(/^(lunch at|dinner at|breakfast at|brunch at|evening snacks at|tea and snacks at|coffee at|visit to|explore|tour of|guided tour of|morning walk at|sunset at|sunrise at|trek to|hike to|stop at|relax at)\s+/i, '')
    .trim();
};

/**
 * Synthesizes an exact, unambiguous venue location query for Google Maps navigation
 * combining clean venue name, neighborhood/area, and overall destination city
 */
export const buildExactVenueQuery = (title = '', location = '', destination = '') => {
  const venue = cleanVenueTitle(title);
  const loc = (location || '').trim();
  const dest = (destination || '').trim();

  const parts = [];

  if (loc && venue && loc.toLowerCase().includes(venue.toLowerCase())) {
    // Location already has the specific venue (e.g. "Raintree Restaurant, Madikeri")
    parts.push(loc);
  } else {
    if (venue && (!dest || venue.toLowerCase() !== dest.toLowerCase())) {
      parts.push(venue);
    }
    if (loc && (!dest || loc.toLowerCase() !== dest.toLowerCase()) && (!venue || !venue.toLowerCase().includes(loc.toLowerCase()))) {
      parts.push(loc);
    }
  }

  if (dest && !parts.some((p) => p.toLowerCase().includes(dest.toLowerCase()))) {
    parts.push(dest);
  }

  return parts.join(', ') || loc || dest;
};

// Curated authentic destination fallback engine
const CURATED_DESTINATIONS_DATA = {
  coorg: {
    title: 'Coorg (Kodagu) Coffee Highlands & Mist Valley Retreat',
    overview:
      'Experience the Scotland of India with lush Arabica coffee plantations, cascading waterfalls, Tibetan monastery bells, and authentic Kodava cuisine.',
    estimatedTotalBudget: 36000,
    recommendedStayArea: 'Madikeri / Suntikoppa Coffee Estates',
    localTips: [
      'Carry light woolens as evenings get chilly in the hills.',
      'Buy authentic single-origin estate coffee, homemade chocolates, and Coorg honey from local growers in Madikeri.',
      'Visit Dubare Elephant Camp in the morning before 10 AM for bathing and feeding sessions.',
    ],
    days: [
      {
        day: 1,
        title: 'Madikeri Heritage & Golden Sunset at Raja Seat',
        activities: [
          {
            time: '10:00',
            title: 'Madikeri Fort & Palace Museum Walk',
            category: 'culture',
            location: 'Madikeri Town',
            googleMapsQuery: 'Madikeri Fort, Madikeri, Coorg, Karnataka, India',
            cost: 50,
            description:
              'Explore the 17th-century fort built by Mudduraja, featuring stone elephant sentinels and colonial artifacts.',
          },
          {
            time: '13:00',
            title: 'Authentic Kodava Lunch at Raintree Restaurant',
            category: 'restaurant',
            location: 'Pension Lane, Madikeri',
            googleMapsQuery: 'Raintree Restaurant Madikeri Coorg',
            cost: 950,
            description:
              'Taste authentic Coorg delicacies including Kadambuttu (steamed rice dumplings) and flavorful vegetable or mushroom curry.',
          },
          {
            time: '16:30',
            title: 'Sunset Panorama at Raja Seat & Musical Fountains',
            category: 'sightseeing',
            location: 'Raja Seat Garden, Madikeri',
            googleMapsQuery: 'Raja Seat Garden Madikeri Coorg Karnataka',
            cost: 40,
            description:
              'Golden hour view overlooking rolling mist-clad valleys where Kodagu kings once relaxed with their queens.',
          },
        ],
      },
      {
        day: 2,
        title: 'Cascading Waterfalls & Estate Coffee Plantation Trail',
        activities: [
          {
            time: '09:00',
            title: 'Abbey Falls Nature Walk & Hanging Bridge',
            category: 'sightseeing',
            location: 'Abbey Falls Road, Madikeri',
            googleMapsQuery: 'Abbey Falls Madikeri Coorg Karnataka',
            cost: 50,
            description:
              'Walk through private spice groves to witness the Kaveri tributary plunging 70 feet down volcanic granite rocks.',
          },
          {
            time: '12:00',
            title: 'Guided Coffee & Cardamom Plantation Tasting Walk',
            category: 'activities',
            location: 'Suntikoppa Coffee Estate, Coorg',
            googleMapsQuery: 'Suntikoppa Coffee Estate Coorg Karnataka',
            cost: 600,
            description:
              'Learn bean-to-cup harvesting of Arabica and Robusta, smell fresh wild vanilla pods, and enjoy fresh estate-brewed coffee.',
          },
          {
            time: '15:30',
            title: 'Dubare Elephant Camp River Raft & Interaction',
            category: 'activities',
            location: 'Kaveri River Bank, Dubare, Kushalnagar',
            googleMapsQuery: 'Dubare Elephant Camp Kushalnagar Coorg Karnataka',
            cost: 400,
            description:
              'Cross the Kaveri river by boat to observe rescued elephants, interactive bathing, and conservation talks.',
          },
        ],
      },
      {
        day: 3,
        title: 'Tibetan Golden Temple & Nisargadhama Bamboo Forest',
        activities: [
          {
            time: '10:00',
            title: 'Namdroling Monastery (Golden Temple) Bylakuppe',
            category: 'culture',
            location: 'Namdroling Monastery, Bylakuppe',
            googleMapsQuery: 'Namdroling Monastery Golden Temple Bylakuppe Karnataka',
            cost: 0,
            description:
              'Marvel at 40-foot gilded Buddha statues, intricate Tibetan thangka murals, and the tranquil sounds of chanting monks.',
          },
          {
            time: '13:30',
            title: 'Tibetan Momos & Thukpa Feast at Camp 1',
            category: 'restaurant',
            location: 'Golden Temple Market, Bylakuppe',
            googleMapsQuery: 'Golden Temple Market Bylakuppe Karnataka',
            cost: 500,
            description:
              'Sample authentic hand-pinched steamed Tibetan momos, tingling chili sauce, and hot noodle broth.',
          },
          {
            time: '15:30',
            title: 'Kaveri Nisargadhama Island & Deer Park',
            category: 'activities',
            location: 'Nisargadhama Island, Kushalnagar',
            googleMapsQuery: 'Kaveri Nisargadhama Kushalnagar Coorg Karnataka',
            cost: 150,
            description:
              'Stroll across a hanging rope bridge to an ecological delta island surrounded by thick bamboo groves and teak trees.',
          },
        ],
      },
      {
        day: 4,
        title: 'Mandalpatti 4x4 Peak Safari & Talakaveri Holy Origin',
        activities: [
          {
            time: '06:00',
            title: 'Sunrise Jeep Safari to Mandalpatti Viewpoint',
            category: 'activities',
            location: 'Pushpagiri Wildlife Sanctuary',
            cost: 1800,
            description:
              'Thrilling 4WD off-road ride to 4,000+ feet altitude above the clouds for 360-degree mountain views.',
          },
          {
            time: '11:00',
            title: 'Talakaveri Brahmagiri Hill & Holy Kaveri Spring',
            category: 'sightseeing',
            location: 'Brahmagiri Hills, Bhagamandala',
            cost: 0,
            description:
              'Visit the sacred birthplace of river Kaveri and climb the steps of Brahmagiri peak for panoramic valley views.',
          },
          {
            time: '14:30',
            title: 'Coorg Artisanal Spices & Homemade Chocolate Shopping',
            category: 'shopping',
            location: 'Madikeri Bazaar',
            cost: 1200,
            description:
              'Handpick fresh green cardamom, black pepper, bird-eye chilies, and dark artisanal estate chocolates to take home.',
          },
        ],
      },
    ],
  },
  goa: {
    title: 'Goa Coastal Getaway & Marine Adventure',
    overview:
      'A balanced blend of North Goa vibrant beach life and South Goa heritage Portuguese villas and pristine coves.',
    estimatedTotalBudget: 45000,
    recommendedStayArea: 'Candolim / Benaulim',
    localTips: [
      'Rent an automatic scooter or self-drive Thar for convenient coastal hopping.',
      'Carry cash for beach shacks as card connectivity can be intermittent on beaches.',
      'Head to Chapora Fort at 5:00 PM to catch golden hour over Vagator cliffs.',
    ],
    days: [
      {
        day: 1,
        title: 'Arrival & North Goa Coastline',
        activities: [
          {
            time: '11:00',
            title: 'Check-in & Anjuna Beach Promenade',
            category: 'sightseeing',
            location: 'Anjuna Beach',
            cost: 0,
            description:
              'Stroll along the rocky red headland and visit the legendary flea market promenade.',
          },
          {
            time: '13:30',
            title: 'Lunch at Curlies Beach Shack',
            category: 'restaurant',
            location: 'South Anjuna',
            cost: 1200,
            description:
              'Savor traditional Goan prawn curry with steamed rice and chilled kokum soda.',
          },
          {
            time: '17:00',
            title: 'Sunset at Chapora Fort (Dil Chahta Hai Point)',
            category: 'sightseeing',
            location: 'Vagator',
            cost: 0,
            description:
              'Climb the 17th-century ramparts overlooking Vagator and Morjim river mouth.',
          },
        ],
      },
      {
        day: 2,
        title: 'Grand Island Underwater & Scuba Exploration',
        activities: [
          {
            time: '07:30',
            title: 'Speedboat Transfer & Dolphin Sightseeing',
            category: 'activities',
            location: 'Sinquerim Jetty',
            cost: 2850,
            description:
              'Spot wild Indo-Pacific humpback dolphins en route to Grand Island dive sites.',
          },
          {
            time: '10:30',
            title: 'Guided Coral Reef Scuba Dive with PADI Instructor',
            category: 'activities',
            location: 'Grand Island',
            cost: 0,
            description:
              'Dive alongside reef fish, moray eels, and corals with full 4K underwater video included.',
          },
          {
            time: '15:30',
            title: 'Candolim Beach Water Sports & Relaxation',
            category: 'sightseeing',
            location: 'Candolim',
            cost: 800,
            description:
              'Enjoy parasailing and evening beach walks along the golden sands.',
          },
        ],
      },
      {
        day: 3,
        title: 'Old Goa Heritage & Latin Quarter Walk',
        activities: [
          {
            time: '10:00',
            title: 'Basilica of Bom Jesus & Se Cathedral',
            category: 'culture',
            location: 'Old Goa',
            cost: 150,
            description:
              'Explore the UNESCO World Heritage site and sacred relics of St. Francis Xavier.',
          },
          {
            time: '13:00',
            title: 'Fontainhas Latin Quarter Walking Tour',
            category: 'culture',
            location: 'Panaji',
            cost: 400,
            description:
              'Walk through colorful Portuguese colonial streets, tiled alleys, and heritage bakeries.',
          },
          {
            time: '18:00',
            title: 'Mandovi River Sunset Catamaran Cruise',
            category: 'sightseeing',
            location: 'Panjim Jetty',
            cost: 650,
            description:
              '1-hour sunset cruise with live Goan folk dance and music.',
          },
        ],
      },
    ],
  },
  udaipur: {
    title: 'Udaipur Royal Lakeside & Mewari Heritage',
    overview:
      'Experience the City of Lakes with royal palaces, lakeside dinners, and Aravali hill sunsets.',
    estimatedTotalBudget: 55000,
    recommendedStayArea: 'Lake Pichola Waterfront',
    localTips: [
      'Pre-book the Jagmandir boat charter during sunset hour.',
      'Dharohar Folk Dance at Bagore Ki Haveli starts at 7 PM; arrive 30 mins early.',
    ],
    days: [
      {
        day: 1,
        title: 'City Palace & Lake Pichola Solar Cruise',
        activities: [
          {
            time: '10:00',
            title: 'City Palace Complex & Crystal Gallery Tour',
            category: 'culture',
            location: 'City Palace, Udaipur',
            cost: 450,
            description:
              'Marvel at Mewar dynastic architecture, peacock courtyards, and mirror mosaics.',
          },
          {
            time: '16:00',
            title: 'Private Boat Charter to Jag Mandir Island',
            category: 'sightseeing',
            location: 'Lake Pichola',
            cost: 1850,
            description:
              'Glide past the Lake Palace and explore the island marble pavilions at golden hour.',
          },
        ],
      },
      {
        day: 2,
        title: 'Monsoon Palace & Saheliyon ki Bari',
        activities: [
          {
            time: '10:30',
            title: 'Saheliyon ki Bari & Royal Fountains Walk',
            category: 'sightseeing',
            location: 'Saheli Marg',
            cost: 100,
            description:
              'Stroll through the lush 18th-century garden built for royal maidens of honor.',
          },
          {
            time: '17:00',
            title: 'Sunset at Sajjangarh (Monsoon Palace)',
            category: 'sightseeing',
            location: 'Sajjangarh Fort',
            cost: 300,
            description:
              'Panoramic views over the entire Udaipur lake basin and Aravali hills from the hilltop.',
          },
        ],
      },
      {
        day: 3,
        title: 'Bagore Ki Haveli & Old Bazaar Artisan Walk',
        activities: [
          {
            time: '11:00',
            title: 'Jagdish Temple & Bada Bazaar Handicrafts',
            category: 'shopping',
            location: 'Old City, Udaipur',
            cost: 800,
            description:
              'Admire carved pillars at Jagdish Temple and browse Bandhani fabrics and silver artifacts.',
          },
          {
            time: '19:00',
            title: 'Dharohar Rajasthani Folk & Puppet Show',
            category: 'culture',
            location: 'Bagore Ki Haveli',
            cost: 200,
            description:
              'Vibrant live performance of Chari dance, Terha Taal, and fire stunts.',
          },
        ],
      },
    ],
  },
  dubai: {
    title: 'Dubai Futuristic Marvels & Desert Safari',
    overview:
      'Experience towering skyscrapers, mega-malls, and crimson sand dunes in the Emirates.',
    estimatedTotalBudget: 95000,
    recommendedStayArea: 'Dubai Marina / Downtown',
    localTips: [
      'Download the Nol card for convenient metro and tram transit.',
      'Dress modestly when visiting cultural mosques and traditional souks.',
    ],
    days: [
      {
        day: 1,
        title: 'Burj Khalifa & Downtown Dubai',
        activities: [
          {
            time: '14:00',
            title: 'The Dubai Mall & Underwater Zoo',
            category: 'shopping',
            location: 'Downtown Dubai',
            cost: 2500,
            description:
              'World largest shopping destination with 10-million liter walk-through aquarium.',
          },
          {
            time: '17:30',
            title: 'Burj Khalifa At The Top Observation Deck',
            category: 'sightseeing',
            location: '124th & 125th Floor',
            cost: 4200,
            description:
              'Sunset panoramic view over the Arabian Gulf from the tallest building in the world.',
          },
        ],
      },
      {
        day: 2,
        title: 'Red Dunes Safari & Bedouin BBQ',
        activities: [
          {
            time: '15:00',
            title: 'Lahbab Red Dunes 4x4 Dune Bashing',
            category: 'activities',
            location: 'Lahbab Desert',
            cost: 4500,
            description:
              'Heart-pumping dune bashing in Land Cruisers, sandboarding, and camel rides.',
          },
          {
            time: '19:00',
            title: 'Starlit Bedouin Dinner with Tanoura & Fire Show',
            category: 'culture',
            location: 'Desert Camp',
            cost: 0,
            description:
              '5-star Arabic grill buffet under the starry night sky with live cultural dances.',
          },
        ],
      },
      {
        day: 3,
        title: 'Old Dubai Creek & Marina Yacht Cruise',
        activities: [
          {
            time: '10:00',
            title: 'Abra Ride & Spice & Gold Souks',
            category: 'shopping',
            location: 'Deira & Bur Dubai',
            cost: 150,
            description:
              'Traditional wooden boat crossing across Dubai Creek to browse aromatic saffron and gold jewels.',
          },
          {
            time: '18:30',
            title: 'Dubai Marina Luxury Dinner Yacht Cruise',
            category: 'sightseeing',
            location: 'Dubai Marina Pier 7',
            cost: 3200,
            description:
              'Gliding past illuminated skyscraper towers and Ain Dubai Ferris Wheel with buffet dining.',
          },
        ],
      },
    ],
  },
  manali: {
    title: 'Manali Alpine Meadows, Snow Pass & Cedar Pine Valley',
    overview:
      'Immerse in the breathtaking Himalayas with high mountain passes, apple orchards, rushing rivers, and hot sulphur springs.',
    estimatedTotalBudget: 38000,
    recommendedStayArea: 'Old Manali / Vashisht',
    localTips: [
      'Permits are required for Rohtang Pass; Atal Tunnel is accessible throughout the year.',
      'Try fresh river trout fish and authentic Himachali Siddu bread.',
    ],
    days: [
      {
        day: 1,
        title: 'Old Manali Bohemian Cafes & Hadimba Temple',
        activities: [
          {
            time: '10:00',
            title: 'Hadimba Devi Ancient Wooden Temple',
            category: 'culture',
            location: 'Dhungri Forest',
            cost: 50,
            description:
              'Four-tiered wooden pagoda temple built in 1553 set amidst towering Himalayan cedar trees.',
          },
          {
            time: '13:30',
            title: 'Riverside Lunch & Apple Pie at Cafe 1947',
            category: 'restaurant',
            location: 'Old Manali River Road',
            cost: 850,
            description:
              'Sip mountain herbal tea by the roaring Manalsu river with handmade wood-fired pizza.',
          },
          {
            time: '16:30',
            title: 'Jogini Waterfall Nature Hike',
            category: 'activities',
            location: 'Vashisht Village',
            cost: 0,
            description:
              'Scenic pine-scented trail leading to a 150-foot cascading mountain waterfall.',
          },
        ],
      },
      {
        day: 2,
        title: 'Solang Valley Adventure & Atal Tunnel Crossing',
        activities: [
          {
            time: '09:00',
            title: 'Solang Valley Paragliding & Cable Car Ride',
            category: 'activities',
            location: 'Solang Valley',
            cost: 3200,
            description:
              'Soar high above snow-capped Pir Panjal peaks with a certified tandem pilot.',
          },
          {
            time: '14:00',
            title: 'Drive through Atal Tunnel to Sissu Waterfall',
            category: 'sightseeing',
            location: 'Lahaul Valley',
            cost: 800,
            description:
              'Pass through the world longest highway tunnel above 10,000 feet into the stark mountain grandeur of Lahaul.',
          },
        ],
      },
      {
        day: 3,
        title: 'Vashisht Hot Sulphur Springs & Mall Road',
        activities: [
          {
            time: '09:30',
            title: 'Vashisht Natural Mineral Hot Springs',
            category: 'activities',
            location: 'Vashisht Village',
            cost: 0,
            description:
              'Rejuvenating natural hot spring baths known for therapeutic mineral properties.',
          },
          {
            time: '16:00',
            title: 'Manali Mall Road & Tibetan Monastery Market',
            category: 'shopping',
            location: 'Mall Road, Manali',
            cost: 1200,
            description:
              'Shop for handwoven Kullu shawls, pine nuts, and Himalayan dried fruits.',
          },
        ],
      },
    ],
  },
};

/**
 * Generate diverse, non-repeating multi-day plans for any arbitrary destination
 */
const generateDynamicMultiDayFallback = (dest, days, travelersCount, budgetStyle) => {
  const cleanDest = dest.trim();
  const dayCount = Math.min(Math.max(1, Number(days) || 3), 7);
  const costMultiplier = budgetStyle === 'luxury' ? 2.2 : budgetStyle === 'budget' ? 0.6 : 1.0;

  const dayTemplates = [
    {
      title: `Arrival, Historic Center & Golden Hour Vista`,
      activities: [
        {
          time: '10:00',
          title: `Old Town & Heritage Landmarks Walking Tour`,
          category: 'sightseeing',
          location: `${cleanDest} Heritage Core`,
          cost: Math.round(250 * costMultiplier),
          description: `Discover the architectural origins, iconic monuments, and historic alleys that define the story of ${cleanDest}.`,
        },
        {
          time: '13:00',
          title: `Authentic Regional Lunch at Renowned Bistro`,
          category: 'restaurant',
          location: `Celebrated Dining District, ${cleanDest}`,
          cost: Math.round(850 * costMultiplier),
          description: `Savor authentic local specialties and chef-recommended recipes made with fresh local ingredients.`,
        },
        {
          time: '17:00',
          title: `Panoramic Sunset Vista & Scenic Promenade`,
          category: 'sightseeing',
          location: `${cleanDest} Sunset Hilltop / Waterfront`,
          cost: Math.round(150 * costMultiplier),
          description: `Watch the golden hour light up the city and surrounding landscape with panoramic view opportunities.`,
        },
      ],
    },
    {
      title: `Nature Trails, Cascading Waters & Countryside Excursion`,
      activities: [
        {
          time: '09:00',
          title: `Scenic Nature Trail & Hidden Waterfall Discovery`,
          category: 'activities',
          location: `${cleanDest} Valley / Eco Reserve`,
          cost: Math.round(400 * costMultiplier),
          description: `Escape into refreshing greenery with a gentle guided hike through scenic viewpoints and crystalline waters.`,
        },
        {
          time: '13:30',
          title: `Farm-to-Table Countryside Lunch`,
          category: 'restaurant',
          location: `Rustic Farmstead, ${cleanDest} Outskirts`,
          cost: Math.round(750 * costMultiplier),
          description: `Relax over organic countryside produce, wood-fired bread, and fresh herbal refreshments.`,
        },
        {
          time: '16:00',
          title: `Local Botanical Sanctuary & Flora Walk`,
          category: 'sightseeing',
          location: `${cleanDest} Botanical Gardens`,
          cost: Math.round(100 * costMultiplier),
          description: `Marvel at native floral species, shaded groves, and tranquil pond walks in the afternoon breeze.`,
        },
      ],
    },
    {
      title: `Artisanal Craftsmanship, Bazaars & Evening Cultural Show`,
      activities: [
        {
          time: '10:30',
          title: `Artisan Workshops & Traditional Handicraft Guilds`,
          category: 'culture',
          location: `Artisans Quarter, ${cleanDest}`,
          cost: Math.round(300 * costMultiplier),
          description: `Watch master artisans practice centuries-old crafts, pottery, weaving, and metalwork firsthand.`,
        },
        {
          time: '14:00',
          title: `Street Food Trail & Local Dessert Sampling`,
          category: 'restaurant',
          location: `Bustling Spice Market, ${cleanDest}`,
          cost: Math.round(500 * costMultiplier),
          description: `Sample authentic street delicacies, crispy snacks, and signature local confectionery from historic stalls.`,
        },
        {
          time: '19:00',
          title: `Live Traditional Folk Music & Cultural Evening`,
          category: 'culture',
          location: `${cleanDest} Cultural Amphitheatre`,
          cost: Math.round(600 * costMultiplier),
          description: `An immersive evening of traditional regional folk dances, live instrumentation, and storytelling.`,
        },
      ],
    },
    {
      title: `High Peak Panorama & Outdoor Thrill Adventure`,
      activities: [
        {
          time: '08:30',
          title: `High Altitude Ridge Safari & 360-Degree Lookout`,
          category: 'activities',
          location: `${cleanDest} High Plateau`,
          cost: Math.round(1200 * costMultiplier),
          description: `Ascend to the highest vantage point in the region for breath-taking panoramic cloud and mountain vistas.`,
        },
        {
          time: '13:00',
          title: `Highland Vista Cafe & Speciality Brew Tasting`,
          category: 'restaurant',
          location: `Ridge Crest Lounge, ${cleanDest}`,
          cost: Math.round(700 * costMultiplier),
          description: `Enjoy warm mountain delicacies accompanied by locally grown tea and artisanal coffee beans.`,
        },
        {
          time: '16:00',
          title: `Outdoor Adventure Park or River Kayaking`,
          category: 'activities',
          location: `${cleanDest} Outdoor Adventure Hub`,
          cost: Math.round(1500 * costMultiplier),
          description: `Enjoy ziplining, cycling trails, or peaceful river paddling amidst stunning natural formations.`,
        },
      ],
    },
    {
      title: `Leisure Morning, Artisan Souvenirs & Homeward Departure`,
      activities: [
        {
          time: '10:00',
          title: `Quiet Lakeside / Park Stroll & Cafe Brunch`,
          category: 'sightseeing',
          location: `${cleanDest} Lake Promenade`,
          cost: Math.round(400 * costMultiplier),
          description: `Unwind with a leisurely morning stroll capturing final photographic memories.`,
        },
        {
          time: '13:00',
          title: `Curated Souvenir Shopping & Local Produce Bazaar`,
          category: 'shopping',
          location: `Central Bazaar, ${cleanDest}`,
          cost: Math.round(1200 * costMultiplier),
          description: `Pick up authentic regional spices, handcrafted souvenirs, and local delicacies for friends and family.`,
        },
        {
          time: '16:00',
          title: `Comfortable Airport / Rail Station Transfer`,
          category: 'sightseeing',
          location: `${cleanDest} Transit Hub`,
          cost: Math.round(600 * costMultiplier),
          description: `Smooth, punctual departure transfer carrying unforgettable memories of ${cleanDest}.`,
        },
      ],
    },
  ];

  return {
    title: `${cleanDest} Comprehensive ${dayCount}-Day Discovery`,
    overview: `A hand-crafted multi-day journey through ${cleanDest}, curated for ${travelersCount} traveler(s) with diverse daily themes spanning historic quarters, pristine nature, artisanal heritage, and authentic dining.`,
    estimatedTotalBudget: Math.round(dayCount * 5500 * Number(travelersCount) * costMultiplier),
    recommendedStayArea: `${cleanDest} Scenic Central Quarter`,
    localTips: [
      `Book local transfers and major heritage site admissions in advance during peak season.`,
      `Carry cash for local artisan vendors, street food stalls, and regional transport.`,
      `Early morning hours (8 AM - 10 AM) are ideal for crowd-free photography and peaceful temple/nature visits.`,
    ],
    days: dayTemplates.slice(0, dayCount).map((template, idx) => ({
      day: idx + 1,
      title: `Day ${idx + 1}: ${template.title}`,
      activities: template.activities,
    })),
  };
};

/**
 * Generate AI Itinerary
 */
export const generateItinerary = async (req, res) => {
  try {
    const {
      destination,
      days = 3,
      travelersCount = 2,
      budgetStyle = 'moderate', // luxury, moderate, budget
      interests = ['sightseeing', 'culture', 'food'],
      customPrompt = '',
    } = req.body;

    if (!destination || destination.trim() === '') {
      return res.status(400).json({ success: false, message: 'Destination is required.' });
    }

    const cleanDest = destination.trim();
    const destKey = cleanDest.toLowerCase();
    const cleanCustomPrompt = customPrompt ? String(customPrompt).trim() : '';

    // 1. Check for real live matching hotel & experiences in DB
    let matchingHotel = null;
    let matchingExperiences = [];
    try {
      matchingHotel = await Hotel.findOne({
        'location.city': new RegExp(cleanDest, 'i'),
        isActive: true,
      }).sort({ starRating: -1 });

      matchingExperiences = await Experience.find({
        destinationCity: new RegExp(cleanDest, 'i'),
        isActive: true,
      }).limit(3);
    } catch (dbErr) {
      console.warn('Optional hotel/experiences DB lookup skipped:', dbErr.message);
    }

    // 3. Check if Google Gemini API key is configured
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (geminiApiKey) {
      try {
        const customPromptClause = cleanCustomPrompt
          ? `\nSPECIAL TRAVELER INSTRUCTION / CUSTOM PROMPT:\n"${cleanCustomPrompt}"\n-> You MUST heavily tailor the itinerary, activities, food choices, locations, and pace to strictly accommodate this specific traveler request!\n`
          : '';

        const prompt = `You are Nomadly's world-class AI travel concierge. Create a detailed, realistic, and highly authentic ${days}-day travel itinerary for "${cleanDest}" for ${travelersCount} traveler(s) with a ${budgetStyle} budget style.
Traveler Interests: ${Array.isArray(interests) ? interests.join(', ') : interests}.${customPromptClause}

CRITICAL REQUIREMENTS:
- Provide REAL landmarks, specific genuine restaurant names, accurate neighborhood names, and authentic local sights for "${cleanDest}".
- EVERY SINGLE DAY MUST BE COMPLETELY UNIQUE. Never repeat activity names, locations, or descriptions across different days.
${cleanCustomPrompt ? `- Strictly prioritize the traveler's custom request: "${cleanCustomPrompt}"` : ''}
- Include authentic local dishes, practical timings, and realistic costs in INR.
- EXACT VENUE LOCATIONS: "location" MUST include the specific exact venue or landmark name along with its area (e.g., "Raintree Restaurant, Madikeri", "Dubare Elephant Camp, Kushalnagar", "Barapole River Rafting Point, Ponampet", "Madikeri Fort, Stuart Hill"). DO NOT return just a generic town, city, or district name like "${cleanDest}" or "City Center" alone as the location!
- "googleMapsQuery" MUST be the full exact searchable venue name with area, city, and country for Google Maps navigation (e.g., "Raintree Restaurant, Madikeri, Coorg, Karnataka, India").

Return ONLY a valid JSON object without Markdown backticks or prose, adhering to this structure:
{
  "title": "Inspiring trip title",
  "overview": "2-3 engaging sentences introducing the destination highlights",
  "estimatedTotalBudget": 45000,
  "currency": "INR",
  "recommendedStayArea": "Specific neighborhood name with explanation",
  "localTips": ["Tip 1", "Tip 2", "Tip 3"],
  "days": [
    {
      "day": 1,
      "title": "Day 1 Theme Title",
      "activities": [
        {
          "time": "09:30",
          "title": "Activity or Experience Name (e.g., Lunch at Raintree Restaurant)",
          "category": "sightseeing",
          "location": "Exact Venue Name, Area/Neighborhood (e.g., Raintree Restaurant, Madikeri)",
          "googleMapsQuery": "Exact Venue Name, Area, ${cleanDest}, India",
          "cost": 500,
          "description": "Engaging description with practical traveler tips"
        }
      ]
    }
  ]
}`;

        // Attempt multiple Gemini models with automatic fallback (prioritizing ultra-fast flash-lite)
        const modelsToTry = [
          'gemini-3.1-flash-lite',
          'gemini-3.8-flash',
          'gemini-3.1-flash-lite-preview',
          'gemini-flash-latest',
        ];

        let parsedItinerary = null;
        let successfulModel = null;

        for (const model of modelsToTry) {
          const modelStartTime = Date.now();
          try {
            const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
            const response = await fetch(apiEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(9000), // 9s timeout per model attempt
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.4,
                  maxOutputTokens: 3000,
                  responseMimeType: 'application/json',
                },
              }),
            });

            if (response.ok) {
              const result = await response.json();
              let rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawText) {
                rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
                parsedItinerary = JSON.parse(rawText);
                successfulModel = model;
                console.log(`✨ Successfully generated AI itinerary via ${model} in ${Date.now() - modelStartTime}ms`);
                break;
              }
            } else {
              console.warn(`[Gemini API] Model ${model} returned HTTP ${response.status}`);
            }
          } catch (modelErr) {
            console.warn(`[Gemini API] Model ${model} failed (${Date.now() - modelStartTime}ms):`, modelErr.message);
          }
        }

        if (parsedItinerary) {
          // Auto-enrich Gemini activities with synthesized exact venue queries and location names
          if (parsedItinerary.days) {
            parsedItinerary = {
              ...parsedItinerary,
              days: parsedItinerary.days.map((day) => ({
                ...day,
                activities: (day.activities || []).map((act) => {
                  const exactQuery = buildExactVenueQuery(act.title, act.googleMapsQuery || act.location, cleanDest);
                  const cleanVenue = cleanVenueTitle(act.title);
                  let displayLocation = (act.location || cleanDest).trim();
                  if (cleanVenue && !displayLocation.toLowerCase().includes(cleanVenue.toLowerCase()) && displayLocation.toLowerCase() !== cleanVenue.toLowerCase()) {
                    displayLocation = `${cleanVenue}, ${displayLocation}`;
                  }
                  return {
                    ...act,
                    location: displayLocation,
                    googleMapsQuery: exactQuery,
                  };
                }),
              })),
            };
          }

          return res.status(200).json({
            success: true,
            data: {
              destination: cleanDest,
              daysCount: days,
              travelersCount,
              budgetStyle,
              customPrompt: cleanCustomPrompt || null,
              ...parsedItinerary,
              matchedHotel: matchingHotel,
              matchedExperiences: matchingExperiences,
              source: `google-${successfulModel}`,
            },
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to curated intelligence:', geminiError.message);
      }
    }

    // 4. Fallback: Curated intelligent destination synthesis
    let curated = CURATED_DESTINATIONS_DATA[destKey];

    if (!curated) {
      // Find partial key match (e.g. "coorg" matches "coorg", "kodagu" matches "coorg")
      const matchingKey = Object.keys(CURATED_DESTINATIONS_DATA).find((k) =>
        destKey.includes(k) || k.includes(destKey) || (destKey.includes('kodagu') && k === 'coorg')
      );
      if (matchingKey) {
        curated = CURATED_DESTINATIONS_DATA[matchingKey];
      }
    }

    // If destination is in curated data, slice to requested days
    if (curated) {
      const requestedDays = Math.min(Math.max(1, Number(days) || 3), curated.days.length);
      curated = {
        ...curated,
        days: curated.days.slice(0, requestedDays),
      };
    }

    // If still not found in curated list, generate diverse non-repeating multi-day fallback
    if (!curated) {
      curated = generateDynamicMultiDayFallback(cleanDest, days, travelersCount, budgetStyle);
    }

    // Auto-enrich all activities with googleMapsQuery if not already present
    if (curated?.days) {
      curated = {
        ...curated,
        days: curated.days.map((day) => ({
          ...day,
          activities: day.activities.map((act) => ({
            ...act,
            googleMapsQuery: act.googleMapsQuery || `${act.location}, India`,
          })),
        })),
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        destination: cleanDest,
        daysCount: days,
        travelersCount,
        budgetStyle,
        customPrompt: cleanCustomPrompt || null,
        currency: 'INR',
        ...curated,
        matchedHotel: matchingHotel,
        matchedExperiences: matchingExperiences,
        source: 'nomadly-destination-engine',
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 1-Click Export Generated AI Itinerary to a Real Trip in My Journeys
 */
export const exportToJourney = async (req, res) => {
  try {
    const {
      title,
      destination,
      days,
      startDate = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      travelersCount = 1,
      estimatedTotalBudget = 50000,
    } = req.body;

    if (!destination || !days || !Array.isArray(days)) {
      return res.status(400).json({
        success: false,
        message: 'Destination and valid days itinerary array are required.',
      });
    }

    const tripStart = new Date(startDate);
    const tripEnd = new Date(tripStart);
    tripEnd.setDate(tripEnd.getDate() + Math.max(1, days.length - 1));

    // Create Trip record
    const newTrip = await Trip.create({
      user: req.user._id,
      title: title || `Trip to ${destination}`,
      destination,
      startDate: tripStart,
      endDate: tripEnd,
      travelersCount: Number(travelersCount) || 1,
      budget: {
        totalBudget: Number(estimatedTotalBudget) || 50000,
        currency: 'INR',
        allocatedTransport: Math.round(Number(estimatedTotalBudget) * 0.35),
        allocatedStay: Math.round(Number(estimatedTotalBudget) * 0.45),
        allocatedActivities: Math.round(Number(estimatedTotalBudget) * 0.2),
      },
      status: 'upcoming',
      participants: [
        {
          user: req.user._id,
          name: `${req.user.firstName || 'Traveler'} ${req.user.lastName || ''}`.trim(),
          email: req.user.email,
          role: 'owner',
          status: 'accepted',
        },
      ],
    });

    // Create ItineraryItem records for each activity across all days
    const createdItems = [];
    let orderCounter = 0;

    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const dayData = days[dayIndex];
      const activityDate = new Date(tripStart);
      activityDate.setDate(activityDate.getDate() + dayIndex);

      if (dayData.activities && Array.isArray(dayData.activities)) {
        for (const act of dayData.activities) {
          const exactQuery = buildExactVenueQuery(act.title, act.googleMapsQuery || act.location, destination);
          const cleanVenue = cleanVenueTitle(act.title);
          let venueName = (act.location || destination).trim();
          if (cleanVenue && !venueName.toLowerCase().includes(cleanVenue.toLowerCase()) && venueName.toLowerCase() !== cleanVenue.toLowerCase()) {
            venueName = `${cleanVenue}, ${venueName}`;
          }

          const item = await ItineraryItem.create({
            trip: newTrip._id,
            title: act.title || `Day ${dayIndex + 1} Activity`,
            description: act.description || '',
            category: act.category || 'sightseeing',
            sourceType: 'unbooked_activity',
            location: {
              name: venueName,
              address: exactQuery,
            },
            date: activityDate,
            startTime: act.time || '10:00',
            endTime: '12:00',
            estimatedCost: Number(act.cost) || 0,
            actualCost: 0,
            currency: 'INR',
            orderIndex: orderCounter++,
          });
          createdItems.push(item);
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Itinerary exported to My Journeys successfully!',
      data: {
        tripId: newTrip._id,
        trip: newTrip,
        itemsCount: createdItems.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Modify / Swap an Activity using AI ("I don't want this, give me this")
 */
export const modifyActivity = async (req, res) => {
  try {
    const {
      destination,
      currentActivity = {},
      userPrompt,
      dayTitle,
      stayLocation,
    } = req.body;

    if (!destination || !userPrompt) {
      return res.status(400).json({
        success: false,
        message: 'Destination and your change request (userPrompt) are required.',
      });
    }

    const cleanDest = destination.trim();
    const cleanPrompt = userPrompt.trim();
    const cleanStay = stayLocation ? String(stayLocation).trim() : '';
    const actTitle = currentActivity.title || 'Current Activity';
    const actCategory = currentActivity.category || 'sightseeing';
    const actTime = currentActivity.startTime || currentActivity.time || '14:00';
    const actLocation = currentActivity.location?.name || currentActivity.location || '';
    const actDesc = currentActivity.description || '';

    const stayClause = cleanStay
      ? `\nTRAVELER'S STAY / RESORT BASE:\n"${cleanStay}" (The traveler is staying here!)\n-> CRITICAL PROXIMITY RULE: If the traveler mentions "our stay", "our hotel", "too far", "closer to stay", "near hotel", or distance, you MUST strictly pick a replacement located either right at or in the very close vicinity (short 5-15 min drive) of "${cleanStay}"!\n`
      : '';

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    let replacement = null;

    if (geminiApiKey) {
      const prompt = `You are Nomadly's world-class AI travel concierge. A traveler is customizing their itinerary for "${cleanDest}".
They want to REPLACE or MODIFY the following scheduled activity:

CURRENT ACTIVITY TO REPLACE:
- Title: "${actTitle}"
- Category: "${actCategory}"
- Scheduled Time: "${actTime}"
- Location: "${actLocation}"
- Description: "${actDesc}"
${dayTitle ? `- Day Context: "${dayTitle}"` : ''}${stayClause}

TRAVELER'S EXACT INSTRUCTION / WHAT THEY WANT INSTEAD:
"${cleanPrompt}"

CRITICAL REQUIREMENTS:
- Strictly obey the traveler's request (e.g., if they say "I don't want rafting, give me a coffee tasting", give them a real coffee tasting; if they say "this is too far from our stay", find an alternative directly near their stay base).
- The replacement MUST be a REAL, genuine venue/attraction in or near "${cleanDest}".
- EXACT VENUE LOCATION: "location" MUST include the specific exact venue/restaurant name along with its area/neighborhood (e.g. "Big Cup Cafe, Stuart Hill, Madikeri"). NEVER return just a city name alone!
- "googleMapsQuery" MUST be the full exact searchable venue name for Google Maps navigation (e.g. "Big Cup Cafe, Madikeri, Coorg, Karnataka, India").
- Keep or logically adapt the scheduled time ("${actTime}").
- Provide realistic estimated cost in INR.

Return ONLY a valid JSON object without markdown or prose:
{
  "title": "Specific replacement activity name",
  "category": "sightseeing",
  "location": "Exact Venue Name, Area",
  "googleMapsQuery": "Exact Venue Name, Area, ${cleanDest}, India",
  "startTime": "${actTime}",
  "endTime": "16:00",
  "estimatedCost": 500,
  "description": "Engaging description explaining why this is a fantastic alternative matching their preference"
}`;

      const modelsToTry = [
        'gemini-3.1-flash-lite',
        'gemini-3.8-flash',
        'gemini-3.1-flash-lite-preview',
        'gemini-flash-latest',
      ];

      for (const model of modelsToTry) {
        try {
          const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(9000),
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 1200,
                responseMimeType: 'application/json',
              },
            }),
          });

          if (response.ok) {
            const result = await response.json();
            let rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
              replacement = JSON.parse(rawText);
              break;
            }
          }
        } catch (err) {
          console.warn(`[Gemini API] modifyActivity ${model} attempt error:`, err.message);
        }
      }
    }

    // Fallback if AI was offline
    if (!replacement) {
      replacement = {
        title: `Curated Alternative in ${cleanDest}`,
        category: 'sightseeing',
        location: `${cleanDest} City Center`,
        googleMapsQuery: `${cleanDest}, India`,
        startTime: actTime,
        endTime: '16:00',
        estimatedCost: 300,
        description: `Customized experience in ${cleanDest} based on your preference: "${cleanPrompt}".`,
      };
    }

    // Enrich replacement venue query
    const exactQuery = buildExactVenueQuery(replacement.title, replacement.googleMapsQuery || replacement.location, cleanDest);
    const cleanVenue = cleanVenueTitle(replacement.title);
    let displayLoc = (replacement.location || cleanDest).trim();
    if (cleanVenue && !displayLoc.toLowerCase().includes(cleanVenue.toLowerCase()) && displayLoc.toLowerCase() !== cleanVenue.toLowerCase()) {
      displayLoc = `${cleanVenue}, ${displayLoc}`;
    }

    replacement.location = {
      name: displayLoc,
      address: exactQuery,
    };
    replacement.googleMapsQuery = exactQuery;

    return res.status(200).json({
      success: true,
      data: replacement,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};





