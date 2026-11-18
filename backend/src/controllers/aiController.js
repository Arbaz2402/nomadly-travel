import { CURATED_DESTINATIONS_DATA, generateDynamicMultiDayFallback } from '../services/ai/curatedDestinations.js';
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
      existingActivities = [],
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

    const dedupeClause = Array.isArray(existingActivities) && existingActivities.length > 0
      ? `\nALREADY SCHEDULED ACTIVITIES IN THIS ITINERARY ON OTHER DAYS (STRICTLY FORBIDDEN TO REPEAT/DUPLICATE):\n${existingActivities.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n-> ABSOLUTE DEDUPLICATION RULE: You MUST NOT repeat, duplicate, or offer any attraction, venue, or activity type already planned in the trip listed above! If a Coffee Plantation Tour, Rainforest Walk, or Elephant Camp is already planned elsewhere in the trip, suggest something completely fresh and different (e.g. scenic sunset at Raja's Seat, Ayurvedic spa relaxation, Madikeri Fort heritage museum, Chelavara Falls, Mandalpatti viewpoint, or a local spice market tour).\n`
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
${dayTitle ? `- Day Context: "${dayTitle}"` : ''}${stayClause}${dedupeClause}

TRAVELER'S EXACT INSTRUCTION / WHAT THEY WANT INSTEAD:
"${cleanPrompt}"

CRITICAL REQUIREMENTS:
- Strictly obey the traveler's request (e.g., if they say "this is too far from our stay", find an alternative directly near their stay base).
- ZERO DUPLICATION: Never suggest an activity, venue, or sight that is already on the traveler's itinerary on any other day (see list above).
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





