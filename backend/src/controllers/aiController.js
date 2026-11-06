import { Trip } from '../models/Trip.js';
import { ItineraryItem } from '../models/ItineraryItem.js';
import { Hotel } from '../models/Hotel.js';
import { Experience } from '../models/Experience.js';

// Curated authentic destination fallback engine
const CURATED_DESTINATIONS_DATA = {
  goa: {
    title: 'Goa Coastal Getaway & Marine Adventure',
    overview: 'A balanced blend of North Goa vibrant beach life and South Goa heritage Portuguese villas and pristine coves.',
    estimatedTotalBudget: 45000,
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
            description: 'Stroll along the rocky red headland and visit the legendary flea market promenade.',
          },
          {
            time: '13:30',
            title: 'Lunch at Curlies Beach Shack',
            category: 'restaurant',
            location: 'South Anjuna',
            cost: 1200,
            description: 'Savor traditional Goan prawn curry with steamed rice and chilled kokum soda.',
          },
          {
            time: '17:00',
            title: 'Sunset at Chapora Fort (Dil Chahta Hai Point)',
            category: 'sightseeing',
            location: 'Vagator',
            cost: 0,
            description: 'Climb the 17th-century ramparts overlooking Vagator and Morjim river mouth.',
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
            description: 'Spot wild Indo-Pacific humpback dolphins en route to Grand Island dive sites.',
          },
          {
            time: '10:30',
            title: 'Guided Coral Reef Scuba Dive with PADI Instructor',
            category: 'activities',
            location: 'Grand Island',
            cost: 0,
            description: 'Dive alongside reef fish, moray eels, and corals with full 4K underwater video included.',
          },
          {
            time: '15:30',
            title: 'Relax at Candolim Beach & Water Sports',
            category: 'sightseeing',
            location: 'Candolim',
            cost: 800,
            description: 'Enjoy parasailing and evening beach walks along the golden sands.',
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
            description: 'Explore the UNESCO World Heritage site and sacred relics of St. Francis Xavier.',
          },
          {
            time: '13:00',
            title: 'Fontainhas Latin Quarter Walking Tour',
            category: 'culture',
            location: 'Panaji',
            cost: 400,
            description: 'Walk through colorful Portuguese colonial streets, tiled alleys, and heritage bakeries.',
          },
          {
            time: '18:00',
            title: 'Mandovi River Sunset Cruise',
            category: 'sightseeing',
            location: 'Panjim Jetty',
            cost: 650,
            description: '1-hour sunset cruise with live Goan folk dance and music.',
          },
        ],
      },
    ],
  },
  udaipur: {
    title: 'Udaipur Royal Lakeside & Mewari Heritage',
    overview: 'Experience the City of Lakes with royal palaces, lakeside dinners, and Aravali hill sunsets.',
    estimatedTotalBudget: 55000,
    days: [
      {
        day: 1,
        title: 'City Palace & Lake Pichola',
        activities: [
          {
            time: '10:00',
            title: 'City Palace Complex & Crystal Gallery Tour',
            category: 'culture',
            location: 'City Palace, Udaipur',
            cost: 450,
            description: 'Marvel at Mewar dynastic architecture, peacock courtyards, and mirror mosaics.',
          },
          {
            time: '16:00',
            title: 'Private Boat Charter to Jag Mandir Island',
            category: 'sightseeing',
            location: 'Lake Pichola',
            cost: 1850,
            description: 'Glide past the Lake Palace and explore the island marble pavilions at golden hour.',
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
            description: 'Stroll through the lush 18th-century garden built for royal maidens of honor.',
          },
          {
            time: '17:00',
            title: 'Sunset at Sajjangarh (Monsoon Palace)',
            category: 'sightseeing',
            location: 'Sajjangarh Fort',
            cost: 300,
            description: 'Panoramic views over the entire Udaipur lake basin and Aravali hills from the hilltop.',
          },
        ],
      },
    ],
  },
  dubai: {
    title: 'Dubai Futuristic Marvels & Desert Safari',
    overview: 'Experience towering skyscrapers, mega-malls, and crimson sand dunes in the Emirates.',
    estimatedTotalBudget: 95000,
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
            description: 'World largest shopping destination with 10-million liter walk-through aquarium.',
          },
          {
            time: '17:30',
            title: 'Burj Khalifa At The Top Observation Deck',
            category: 'sightseeing',
            location: '124th & 125th Floor',
            cost: 4200,
            description: 'Sunset panoramic view over the Arabian Gulf from the tallest building in the world.',
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
            category: 'adventure',
            location: 'Lahbab Desert',
            cost: 4500,
            description: 'Heart-pumping dune bashing in Land Cruisers, sandboarding, and camel rides.',
          },
          {
            time: '19:00',
            title: 'Starlit Bedouin Dinner with Tanoura & Fire Show',
            category: 'culture',
            location: 'Desert Camp',
            cost: 0,
            description: '5-star Arabic grill buffet under the starry night sky with live cultural dances.',
          },
        ],
      },
    ],
  },
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
    } = req.body;

    if (!destination || destination.trim() === '') {
      return res.status(400).json({ success: false, message: 'Destination is required.' });
    }

    const cleanDest = destination.trim();
    const destKey = cleanDest.toLowerCase();

    // 1. Check for real live matching hotel in DB
    const matchingHotel = await Hotel.findOne({
      city: new RegExp(cleanDest, 'i'),
    }).sort({ rating: -1 });

    // 2. Check for real live matching experiences in DB
    const matchingExperiences = await Experience.find({
      destinationCity: new RegExp(cleanDest, 'i'),
      isActive: true,
    }).limit(3);

    // 3. Check if Google Gemini API key is configured
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (geminiApiKey) {
      try {
        const prompt = `You are Nomadly's expert travel concierge. Create a detailed, realistic, and authentic ${days}-day travel itinerary for "${cleanDest}" for ${travelersCount} traveler(s) with a ${budgetStyle} budget.
Interests: ${Array.isArray(interests) ? interests.join(', ') : interests}.

Return ONLY valid JSON without Markdown backticks or additional prose with the following schema:
{
  "title": "Inspiring trip title",
  "overview": "2-3 sentences introducing the destination highlights",
  "estimatedTotalBudget": 45000,
  "currency": "INR",
  "recommendedStayArea": "Specific neighborhood name with explanation",
  "localTips": ["Tip 1", "Tip 2", "Tip 3"],
  "days": [
    {
      "day": 1,
      "title": "Theme of Day 1",
      "activities": [
        {
          "time": "10:00",
          "title": "Real Landmark / Activity name",
          "category": "sightseeing", // flight, hotel, restaurant, sightseeing, activities, shopping, culture
          "location": "Exact location or area",
          "cost": 500,
          "description": "Engaging description with practical visitor tips"
        }
      ]
    }
  ]
}`;

        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 2048,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsedItinerary = JSON.parse(rawText);
            return res.status(200).json({
              success: true,
              data: {
                destination: cleanDest,
                daysCount: days,
                travelersCount,
                budgetStyle,
                ...parsedItinerary,
                matchedHotel: matchingHotel,
                matchedExperiences: matchingExperiences,
                source: 'gemini-1.5-flash',
              },
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to curated intelligence:', geminiError.message);
      }
    }

    // Fallback: Curated intelligent destination synthesis
    let curated = CURATED_DESTINATIONS_DATA[destKey];

    if (!curated) {
      // Find partial key match
      const matchingKey = Object.keys(CURATED_DESTINATIONS_DATA).find((k) =>
        destKey.includes(k) || k.includes(destKey)
      );
      if (matchingKey) {
        curated = CURATED_DESTINATIONS_DATA[matchingKey];
      }
    }

    // If still not found, dynamically build a realistic itinerary based on the destination name
    if (!curated) {
      curated = {
        title: `${cleanDest} Highlights & Discovery`,
        overview: `A hand-crafted discovery of ${cleanDest}'s most celebrated sights, authentic dining, and cultural highlights.`,
        estimatedTotalBudget: Number(days) * 6000 * Number(travelersCount),
        days: Array.from({ length: Math.min(Number(days), 5) }, (_, i) => ({
          day: i + 1,
          title: `Day ${i + 1}: Discovering ${cleanDest}`,
          activities: [
            {
              time: '09:30',
              title: `Morning Heritage & City Center Walk`,
              category: 'sightseeing',
              location: `${cleanDest} Old Town / Center`,
              cost: 250,
              description: `Explore local landmarks, historic quarters, and bustling markets of ${cleanDest}.`,
            },
            {
              time: '13:00',
              title: `Authentic Regional Lunch`,
              category: 'restaurant',
              location: `Popular local bistro, ${cleanDest}`,
              cost: 850,
              description: `Enjoy renowned regional dishes and refreshments crafted by local chefs.`,
            },
            {
              time: '16:00',
              title: `Scenic Sunset Vista Point`,
              category: 'activities',
              location: `${cleanDest} Scenic Point`,
              cost: 150,
              description: `Capture panoramic evening views and relax as golden hour sets over ${cleanDest}.`,
            },
          ],
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
        currency: 'INR',
        recommendedStayArea: `${cleanDest} Central District`,
        localTips: [
          'Pre-book attraction tickets early to skip entrance queues.',
          'Carry local currency cash for street food and auto-rickshaws.',
          'Early morning (before 10 AM) offers the best lighting for photos and cooler weather.',
        ],
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
          const item = await ItineraryItem.create({
            trip: newTrip._id,
            title: act.title || 'Sightseeing Activity',
            description: act.description || '',
            category: act.category === 'culture' ? 'sightseeing' : (act.category || 'activities'),
            sourceType: 'manual_entry',
            location: {
              name: act.location || destination,
              city: destination,
            },
            date: activityDate,
            startTime: act.time || '10:00',
            endTime: '12:00',
            estimatedCost: act.cost || 0,
            actualCost: act.cost || 0,
            currency: 'INR',
            status: 'planned',
            orderIndex: orderCounter++,
          });
          createdItems.push(item);
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Itinerary successfully exported to your Journeys!',
      data: {
        tripId: newTrip._id,
        itemsCount: createdItems.length,
        trip: newTrip,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
