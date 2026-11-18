import {
  CURATED_DESTINATIONS_DATA,
  generateDynamicMultiDayFallback,
} from './curatedDestinations.js';

/**
 * Strips common activity prefix actions to extract the genuine venue / landmark name
 */
export const cleanVenueTitle = (rawTitle = '') => {
  if (!rawTitle) return '';
  return String(rawTitle)
    .replace(
      /^(lunch at|dinner at|breakfast at|brunch at|evening snacks at|tea and snacks at|coffee at|visit to|explore|tour of|guided tour of|morning walk at|sunset at|sunrise at|trek to|hike to|stop at|relax at)\s+/i,
      ''
    )
    .trim();
};

/**
 * Synthesizes an exact, unambiguous venue location query for Google Maps navigation
 */
export const buildExactVenueQuery = (title = '', location = '', destination = '') => {
  const venue = cleanVenueTitle(title);
  const loc = (location || '').trim();
  const dest = (destination || '').trim();

  const parts = [];

  if (loc && venue && loc.toLowerCase().includes(venue.toLowerCase())) {
    parts.push(loc);
  } else {
    if (venue && (!dest || venue.toLowerCase() !== dest.toLowerCase())) {
      parts.push(venue);
    }
    if (
      loc &&
      (!dest || loc.toLowerCase() !== dest.toLowerCase()) &&
      (!venue || !venue.toLowerCase().includes(loc.toLowerCase()))
    ) {
      parts.push(loc);
    }
  }

  if (dest && !parts.some((p) => p.toLowerCase().includes(dest.toLowerCase()))) {
    parts.push(dest);
  }

  return parts.join(', ') || loc || dest;
};

/**
 * Calls Gemini API with fallback models to synthesize a custom multi-day travel itinerary
 */
export const synthesizeGeminiItinerary = async ({
  destination,
  days,
  travelersCount,
  budgetStyle,
  interests,
  customPrompt,
}) => {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!geminiApiKey) return null;

  const customPromptClause = customPrompt
    ? `\nSPECIAL TRAVELER INSTRUCTION / CUSTOM PROMPT:\n"${customPrompt}"\n-> You MUST heavily tailor the itinerary, activities, food choices, locations, and pace to strictly accommodate this specific traveler request!\n`
    : '';

  const prompt = `You are Nomadly's travel itinerary planner. Create a realistic and practical ${days}-day travel itinerary for "${destination}" for ${travelersCount} traveler(s) with a ${budgetStyle} budget style.
Traveler Interests: ${Array.isArray(interests) ? interests.join(', ') : interests}.${customPromptClause}

CRITICAL REQUIREMENTS:
- Provide REAL landmarks, specific genuine restaurant names, accurate neighborhood names, and authentic local sights for "${destination}".
- EVERY SINGLE DAY MUST BE COMPLETELY UNIQUE. Never repeat activity names, locations, or descriptions across different days.
${customPrompt ? `- Strictly prioritize the traveler's custom request: "${customPrompt}"` : ''}
- Include authentic local dishes, practical timings, and realistic costs in INR.
- EXACT VENUE LOCATIONS: "location" MUST include the specific exact venue or landmark name along with its area (e.g., "Raintree Restaurant, Madikeri", "Dubare Elephant Camp, Kushalnagar"). DO NOT return just a generic town or district name alone!
- "googleMapsQuery" MUST be the full exact searchable venue name with area, city, and country for Google Maps navigation.

Return ONLY a valid JSON object without Markdown backticks or prose, adhering to this structure:
{
  "title": "Trip Title",
  "overview": "2-sentence summary of the itinerary highlights",
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
          "title": "Activity Name",
          "category": "sightseeing",
          "location": "Exact Venue Name, Area",
          "googleMapsQuery": "Exact Venue Name, Area, ${destination}, India",
          "cost": 500,
          "description": "Practical description and tips for the activity"
        }
      ]
    }
  ]
}`;

  const modelsToTry = [
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite-preview',
    'gemini-flash-latest',
  ];

  for (const model of modelsToTry) {
    const modelStartTime = Date.now();
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
          const parsed = JSON.parse(rawText);
          console.log(`✨ Successfully generated AI itinerary via ${model} in ${Date.now() - modelStartTime}ms`);
          return { itinerary: parsed, model };
        }
      }
    } catch (modelErr) {
      console.warn(`[Gemini API] Model ${model} failed (${Date.now() - modelStartTime}ms):`, modelErr.message);
    }
  }

  return null;
};

/**
 * Synthesizes a swap / replacement activity with Gemini
 */
export const synthesizeActivityReplacement = async ({
  destination,
  currentActivity,
  userPrompt,
  dayTitle,
  stayLocation,
  existingActivities = [],
}) => {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const actTitle = currentActivity.title || 'Current Activity';
  const actCategory = currentActivity.category || 'sightseeing';
  const actTime = currentActivity.startTime || currentActivity.time || '14:00';
  const actLocation = currentActivity.location?.name || currentActivity.location || '';
  const actDesc = currentActivity.description || '';

  if (geminiApiKey) {
    const stayClause = stayLocation
      ? `\nTRAVELER'S STAY / RESORT BASE:\n"${stayLocation}" (The traveler is staying here!)\n-> Proximity rule: pick a replacement in the close vicinity of "${stayLocation}"!\n`
      : '';

    const dedupeClause =
      Array.isArray(existingActivities) && existingActivities.length > 0
        ? `\nALREADY SCHEDULED ACTIVITIES (STRICTLY FORBIDDEN TO REPEAT):\n${existingActivities.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n`
        : '';

    const prompt = `You are Nomadly's world-class AI travel concierge. A traveler is customizing their itinerary for "${destination}".
They want to REPLACE the following scheduled activity:
- Title: "${actTitle}"
- Category: "${actCategory}"
- Time: "${actTime}"
- Location: "${actLocation}"
- Description: "${actDesc}"
${dayTitle ? `- Day Context: "${dayTitle}"` : ''}${stayClause}${dedupeClause}

TRAVELER'S EXACT INSTRUCTION:
"${userPrompt}"

Return ONLY a valid JSON object without markdown or prose:
{
  "title": "Specific replacement activity name",
  "category": "sightseeing",
  "location": "Exact Venue Name, Area",
  "googleMapsQuery": "Exact Venue Name, Area, ${destination}, India",
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
            return JSON.parse(rawText);
          }
        }
      } catch (err) {
        console.warn(`[Gemini API] modifyActivity ${model} attempt error:`, err.message);
      }
    }
  }

  // Fallback if AI was offline or unconfigured
  return {
    title: `Curated Alternative in ${destination}`,
    category: 'sightseeing',
    location: `${destination} City Center`,
    googleMapsQuery: `${destination}, India`,
    startTime: actTime,
    endTime: '16:00',
    estimatedCost: 300,
    description: `Customized experience in ${destination} based on your preference: "${userPrompt}".`,
  };
};

/**
 * Fallback to curated catalog
 */
export const getCuratedDestinationFallback = (destKey, cleanDest, days, travelersCount, budgetStyle) => {
  let curated = CURATED_DESTINATIONS_DATA[destKey];
  if (!curated) {
    const matchingKey = Object.keys(CURATED_DESTINATIONS_DATA).find(
      (k) => destKey.includes(k) || k.includes(destKey)
    );
    if (matchingKey) curated = CURATED_DESTINATIONS_DATA[matchingKey];
  }

  if (curated) {
    const daysSlice = (curated.days || []).slice(0, Number(days));
    return {
      title: curated.title || `Ultimate Escape to ${cleanDest}`,
      overview: curated.overview,
      estimatedTotalBudget: curated.estimatedTotalBudget || 25000 * Number(travelersCount),
      currency: 'INR',
      recommendedStayArea: curated.recommendedStayArea || 'Central District',
      localTips: curated.localTips || ['Book attractions in advance', 'Use verified cabs'],
      days: daysSlice.length > 0 ? daysSlice : generateDynamicMultiDayFallback(cleanDest, Number(days), budgetStyle),
      source: 'nomadly-curated-intelligence',
    };
  }

  return {
    title: `${cleanDest} Highlights & Local Trail`,
    overview: `Experience the captivating sights, authentic dining, and cultural highlights of ${cleanDest}.`,
    estimatedTotalBudget: 15000 * Number(days),
    currency: 'INR',
    recommendedStayArea: `${cleanDest} Central / Historic Quarter`,
    localTips: ['Carry cash for local markets', 'Start early to avoid peak crowds'],
    days: generateDynamicMultiDayFallback(cleanDest, Number(days), budgetStyle),
    source: 'nomadly-dynamic-generator',
  };
};
