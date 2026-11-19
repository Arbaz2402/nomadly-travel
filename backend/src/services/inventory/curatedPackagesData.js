// Curated destinations with rich itineraries, galleries, and perks for combo packages
export const POPULAR_DESTINATIONS = [
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
    origin: 'DEL',
    originCity: 'New Delhi',
    nights: 3,
    tagline: 'Lake Palaces, Royalty & Mewar Sunsets',
    heroImage: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=1000&q=80',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1000&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&q=80',
    ],
    overview:
      'Step into the ethereal romantic capital of Rajasthan. Gaze upon shimmering Lake Pichola from your royal heritage suite, cruise by private solar boat past Jag Mandir Island palace, and dine under candlelit arches in centuries-old Mewar courtyard restaurants.',
    highlights: [
      'Roundtrip flights DEL - UDR with baggage allowance',
      '3 Nights in a Lake View Palace Suite at a 5-Star Heritage Hotel',
      'Private sunset boat cruise on Lake Pichola with champagne service',
      'VIP guided private tour of City Palace & Vintage Car Museum',
      'All private chauffeur transfers in a vintage-style air-conditioned sedan',
      'Complimentary Royal Mewar Thali dining experience for two',
    ],
    roomType: 'Heritage Lake Pichola Facing Grand Palace Suite',
    perks: ['Lake Pichola Private Sunset Cruise', 'Royal Mewar Thali Dinner for Two', 'VIP City Palace Access'],
    inclusions: [
      'Return flights New Delhi (DEL) to Udaipur (UDR)',
      '3 Nights 5-Star Heritage Lake Palace accommodation',
      'Daily royal buffet breakfast served in marble courtyard',
      'Private sunset solar boat ride past Lake Palace and Jag Mandir',
      'All transfers in private chauffeur-driven executive sedan',
      'All sightseeing entry permits and palace museum access',
    ],
    exclusions: ['Commercial photography permits at palace', 'Alcoholic beverages outside dinner inclusions'],
    cancellationPolicy: 'Free cancellation up to 72 hours before check-in. Instant full refund to original payment source.',
    discountPercent: 12,
    itinerary: [
      {
        day: 1,
        title: 'Royal Welcome & Lake Pichola Sunset Cruise',
        description:
          'Arrive at Maharana Pratap Airport where your private royal chauffeur awaits. Check in with traditional rose petal garlands and marigold tea. At dusk, embark on an exclusive private wooden boat charter across Lake Pichola as the marble palaces glow under twilight lanterns.',
      },
      {
        day: 2,
        title: 'Mewar Architecture & Monsoon Palace',
        description:
          'Private guided walking tour through the corridors of Udaipur City Palace, Zenana Mahal, and the Crystal Gallery. In the late afternoon, drive up to the hilltop Sajjangarh Monsoon Palace for panoramic sunset views across the Aravalli hills.',
      },
      {
        day: 3,
        title: 'Bagore Ki Haveli & Folk Arts Evening',
        description:
          'Visit the ornate 18th-century Bagore Ki Haveli at Gangaur Ghat. Enjoy a private artisan miniature painting masterclass, followed by VIP front-row seating at the famous Dharohar cultural dance performance by Lake Pichola.',
      },
      {
        day: 4,
        title: 'Saheliyon Ki Bari & Royal Farewell',
        description:
          'Stroll through the marble fountains of Saheliyon Ki Bari courtyard gardens. Relish a farewell Rajasthani brunch before your executive chauffeur transfer to Udaipur Airport.',
      },
    ],
  },
  {
    city: 'Dubai',
    origin: 'DEL',
    originCity: 'New Delhi',
    nights: 4,
    tagline: 'Desert Dunes, Burj Khalifa & Luxury Marina Yachts',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1000&q=80',
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1000&q=80',
      'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1000&q=80',
      'https://images.unsplash.com/photo-1546412414-e1885259563a?w=1000&q=80',
    ],
    overview:
      'Experience the futuristic metropolis where modern architecture meets Arabian luxury. Stay in a panoramic Dubai Marina high-rise suite, take on thrilling 4x4 dune bashing under the desert stars, and gaze out from the 148th floor of the world-famous Burj Khalifa.',
    highlights: [
      'Direct return international flights between New Delhi and Dubai',
      '4 Nights in a 5★ Marina-View Executive Suite with club lounge access',
      'Private 4x4 Luxury Desert Safari with BBQ feast & live performances',
      'Burj Khalifa Level 124+125 At The Top fast-track access ticket',
      'Exclusive 2-hour evening luxury yacht cruise along Dubai Marina and JBR',
      'All private luxury SUV transfers between DXB Airport and hotel',
    ],
    roomType: 'Skyline Marina View Executive Club Suite',
    perks: ['VIP Luxury Desert Safari & Barbecue', 'Burj Khalifa Fast-Track Tickets', '2-Hour Marina Yacht Charter'],
    inclusions: [
      'Roundtrip international flights DEL - DXB',
      '4 Nights 5★ hotel stay in Dubai Marina',
      'Daily international gourmet buffet breakfast',
      'Private desert safari with dune bashing, camel rides & dinner',
      'Burj Khalifa At The Top admission vouchers',
      'Private luxury airport transfers both ways',
    ],
    exclusions: ['UAE Tourist Visa fees', 'Tourism Dirham fee paid directly at hotel (approx AED 20/night)'],
    cancellationPolicy: 'Free cancellation up to 5 days prior to departure date.',
    discountPercent: 20,
    itinerary: [
      {
        day: 1,
        title: 'Touchdown in Dubai & Marina Yacht Sailing',
        description:
          'Private chauffeured transfer from DXB Airport to your Dubai Marina hotel. Settle into your suite and board a luxury private yacht charter for sunset sailing past Bluewaters Island and Ain Dubai.',
      },
      {
        day: 2,
        title: 'Burj Khalifa & The Dubai Mall Grandeur',
        description:
          'Ascend to the observation deck of Burj Khalifa. Afternoon shopping at The Dubai Mall, followed by front-row reserved dining during the spectacular evening Dubai Fountain water and light show.',
      },
      {
        day: 3,
        title: 'High-Octane Red Dunes Desert Safari',
        description:
          'Leisure morning by the infinity pool. In the afternoon, a private 4x4 Land Cruiser whisks you away into the crimson Lahbab desert for dune bashing, sandboarding, camel rides, and a 5-star open-air Arabian barbecue dinner with belly dancing and fire shows.',
      },
      {
        day: 4,
        title: 'Old Dubai Heritage, Gold Souk & Palm Jumeirah',
        description:
          'Cross Dubai Creek aboard an authentic wooden abra boat. Explore the historic Al Fahidi Fort and the aromatic spice and gold souks. Afternoon monorail ride across Palm Jumeirah.',
      },
      {
        day: 5,
        title: 'Departure with Duty Free Splurge',
        description:
          'Breakfast at the hotel, last-minute shopping at Mall of the Emirates, followed by private chauffeur drop-off at Dubai International Airport.',
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
