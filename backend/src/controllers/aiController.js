import { Trip } from '../models/Trip.js';
import { ItineraryItem } from '../models/ItineraryItem.js';
import { Hotel } from '../models/Hotel.js';
import { Experience } from '../models/Experience.js';
import {
  cleanVenueTitle,
  buildExactVenueQuery,
  synthesizeGeminiItinerary,
  synthesizeActivityReplacement,
  getCuratedDestinationFallback,
} from '../services/ai/geminiPromptService.js';

export { cleanVenueTitle, buildExactVenueQuery };

/**
 * Generate AI Itinerary
 */
export const generateItinerary = async (req, res) => {
  try {
    const {
      destination,
      days = 3,
      travelersCount = 2,
      budgetStyle = 'moderate',
      interests = ['sightseeing', 'culture', 'food'],
      customPrompt = '',
    } = req.body;

    if (!destination || destination.trim() === '') {
      return res.status(400).json({ success: false, message: 'Destination is required.' });
    }

    const cleanDest = destination.trim();
    const destKey = cleanDest.toLowerCase();
    const cleanCustomPrompt = customPrompt ? String(customPrompt).trim() : '';

    // Check for matching hotel & experiences in DB
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

    // 1. Try Gemini API
    const geminiResult = await synthesizeGeminiItinerary({
      destination: cleanDest,
      days: Number(days),
      travelersCount: Number(travelersCount),
      budgetStyle,
      interests,
      customPrompt: cleanCustomPrompt,
    });

    if (geminiResult && geminiResult.itinerary) {
      let parsedItinerary = geminiResult.itinerary;
      if (parsedItinerary.days) {
        parsedItinerary = {
          ...parsedItinerary,
          days: parsedItinerary.days.map((day) => ({
            ...day,
            activities: (day.activities || []).map((act) => {
              const exactQuery = buildExactVenueQuery(act.title, act.googleMapsQuery || act.location, cleanDest);
              const cleanVenue = cleanVenueTitle(act.title);
              let displayLocation = (act.location || cleanDest).trim();
              if (
                cleanVenue &&
                !displayLocation.toLowerCase().includes(cleanVenue.toLowerCase()) &&
                displayLocation.toLowerCase() !== cleanVenue.toLowerCase()
              ) {
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
          source: `google-${geminiResult.model}`,
        },
      });
    }

    // 2. Fallback: Curated intelligent destination synthesis
    const fallback = getCuratedDestinationFallback(destKey, cleanDest, days, travelersCount, budgetStyle);

    return res.status(200).json({
      success: true,
      data: {
        destination: cleanDest,
        daysCount: days,
        travelersCount,
        budgetStyle,
        customPrompt: cleanCustomPrompt || null,
        ...fallback,
        matchedHotel: matchingHotel,
        matchedExperiences: matchingExperiences,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Export AI-Generated Itinerary into a Live Personal Journey Workspace
 */
export const exportToJourney = async (req, res) => {
  try {
    const {
      title,
      destination,
      days,
      travelersCount = 2,
      estimatedTotalBudget = 50000,
      startDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
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
          if (
            cleanVenue &&
            !venueName.toLowerCase().includes(cleanVenue.toLowerCase()) &&
            venueName.toLowerCase() !== cleanVenue.toLowerCase()
          ) {
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

    const replacement = await synthesizeActivityReplacement({
      destination: cleanDest,
      currentActivity,
      userPrompt: cleanPrompt,
      dayTitle,
      stayLocation: cleanStay,
      existingActivities,
    });

    const exactQuery = buildExactVenueQuery(
      replacement.title,
      replacement.googleMapsQuery || replacement.location,
      cleanDest
    );
    const cleanVenue = cleanVenueTitle(replacement.title);
    let displayLoc = (replacement.location || cleanDest).trim();
    if (
      cleanVenue &&
      !displayLoc.toLowerCase().includes(cleanVenue.toLowerCase()) &&
      displayLoc.toLowerCase() !== cleanVenue.toLowerCase()
    ) {
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
