import mongoose from 'mongoose';
import { Trip } from '../models/Trip.js';
import { ItineraryItem } from '../models/ItineraryItem.js';
import { TripExpense } from '../models/TripExpense.js';
import { TripDocument } from '../models/TripDocument.js';
import { TripActivityLog } from '../models/TripActivityLog.js';
import { User } from '../models/User.js';
import { convertCurrency, getExchangeRate } from '../utils/currencyRates.js';
import { calculateTripSettlement } from '../utils/settlementCalculator.js';
import { analyzeItineraryWarnings } from '../utils/itineraryWarnings.js';
import { sendTripInvitationEmail, buildTripInviteEmailData, isEmailConfigured } from '../services/emailService.js';
import {
  logTripActivity as logActivity,
  mapToExpenseCategory,
  enrichTripsWithMetrics,
  groupItineraryByDay,
} from '../services/trip/tripService.js';

// ==========================================
// 1. TRIP CRUD & DASHBOARD
// ==========================================

export const getMyTrips = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUserEmail = req.user.email?.toLowerCase();

    // Query: Owned trips OR trips where user is a participant
    const query = {
      $or: [
        { user: currentUserId },
        { 'participants.user': currentUserId },
        { 'participants.email': currentUserEmail },
      ],
    };

    // Optional Search Filter
    if (req.query.q) {
      const regex = new RegExp(req.query.q, 'i');
      query.$and = [{ $or: [{ title: regex }, { destination: regex }, { additionalDestinations: regex }] }];
    }

    // Optional Status Filter
    if (req.query.status && req.query.status !== 'all') {
      const requestedStatuses = req.query.status.split(',');
      query.status = { $in: requestedStatuses };
    }

    // Sort order
    let sortOption = { startDate: 1 };
    if (req.query.sort === 'newest') sortOption = { createdAt: -1 };
    if (req.query.sort === 'date_desc') sortOption = { startDate: -1 };

    const trips = await Trip.find(query)
      .populate('user', 'displayName email photoURL')
      .sort(sortOption);

    const { trips: enrichedTrips, metrics } = await enrichTripsWithMetrics(
      trips,
      currentUserId,
      currentUserEmail
    );

    return res.status(200).json({
      success: true,
      count: enrichedTrips.length,
      metrics,
      data: enrichedTrips,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('user', 'displayName email photoURL');

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Journey not found.' });
    }

    // Expenses total
    const expenses = await TripExpense.find({ trip: trip._id });
    const actualSpend = expenses.reduce((sum, exp) => sum + (exp.convertedAmount || exp.amount || 0), 0);

    // Items count
    const itemsCount = await ItineraryItem.countDocuments({ trip: trip._id });
    const documentsCount = await TripDocument.countDocuments({ trip: trip._id });

    const dynamicStatus = trip.calculateDynamicStatus();

    return res.status(200).json({
      success: true,
      data: {
        ...trip.toObject(),
        dynamicStatus,
        userRole: req.tripRole || 'owner',
        participantStatus: req.participantStatus || 'accepted',
        actualSpend: Number(actualSpend.toFixed(2)),
        budgetUtilization:
          trip.budget?.totalBudget > 0
            ? Number(((actualSpend / trip.budget.totalBudget) * 100).toFixed(1))
            : 0,
        itemsCount,
        documentsCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTrip = async (req, res) => {
  try {
    const {
      title,
      description,
      coverImage,
      destination,
      additionalDestinations,
      startDate,
      endDate,
      travelersCount,
      currency,
      totalBudget,
      budget,
      status,
    } = req.body;

    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, primary destination, start date, and end date are required.',
      });
    }

    const tripBudget = budget || {
      totalBudget: totalBudget || 50000,
      currency: currency || 'INR',
      allocatedTransport: 20000,
      allocatedStay: 25000,
      allocatedActivities: 5000,
    };

    // Default curated cover image if empty
    const finalCover =
      coverImage && coverImage.trim() !== ''
        ? coverImage
        : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

    const trip = await Trip.create({
      user: req.user._id,
      title: title.trim(),
      description: description || '',
      coverImage: finalCover,
      destination: destination.trim(),
      additionalDestinations: Array.isArray(additionalDestinations)
        ? additionalDestinations
        : additionalDestinations
        ? [additionalDestinations]
        : [],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      travelersCount: Number(travelersCount) || 1,
      currency: (currency || 'INR').toUpperCase(),
      budget: tripBudget,
      status: status || 'upcoming',
      participants: [
        {
          user: req.user._id,
          name: req.user.displayName || 'Primary Traveler',
          email: req.user.email,
          role: 'owner',
          status: 'accepted',
          acceptedAt: new Date(),
        },
      ],
    });

    // In local dev/testing with demo accounts, auto-grant editor companion access for smooth persona switching
    if (process.env.NODE_ENV !== 'production') {
      try {
        const otherEmail =
          req.user.email === 'admin@nomadly.travel'
            ? 'traveler@nomadly.travel'
            : req.user.email === 'traveler@nomadly.travel'
            ? 'admin@nomadly.travel'
            : null;
        if (otherEmail) {
          const otherUser = await User.findOne({ email: otherEmail });
          if (otherUser) {
            trip.participants.push({
              user: otherUser._id,
              name: otherUser.displayName || 'Travel Companion',
              email: otherUser.email,
              role: 'editor',
              status: 'accepted',
              acceptedAt: new Date(),
            });
            await trip.save();
          }
        }
      } catch (e) {
        // Non-blocking
      }
    }

    await logActivity(trip._id, req.user, 'CREATED_TRIP', `Created journey "${trip.title}" to ${trip.destination}`);

    return res.status(201).json({ success: true, data: trip });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const trip = req.trip; // Attached by requireTripAccess middleware

    const {
      title,
      description,
      coverImage,
      destination,
      additionalDestinations,
      startDate,
      endDate,
      travelersCount,
      currency,
      totalBudget,
      budget,
      status,
      packingList,
      emergencyContacts,
      shiftItineraryDates,
      isPublic,
    } = req.body;

    const oldStartDate = trip.startDate ? new Date(trip.startDate) : null;

    if (title !== undefined) trip.title = title.trim();
    if (description !== undefined) trip.description = description;
    if (coverImage !== undefined) trip.coverImage = coverImage;
    if (destination !== undefined) trip.destination = destination.trim();
    if (additionalDestinations !== undefined) trip.additionalDestinations = additionalDestinations;
    if (startDate !== undefined) trip.startDate = new Date(startDate);
    if (endDate !== undefined) trip.endDate = new Date(endDate);

    // Optionally shift all itinerary activity dates to match the new start date
    if (shiftItineraryDates && startDate && oldStartDate) {
      const newStart = new Date(startDate);
      const oldDayUtc = Date.UTC(oldStartDate.getUTCFullYear(), oldStartDate.getUTCMonth(), oldStartDate.getUTCDate());
      const newDayUtc = Date.UTC(newStart.getUTCFullYear(), newStart.getUTCMonth(), newStart.getUTCDate());
      const diffMs = newDayUtc - oldDayUtc;
      if (diffMs !== 0) {
        const items = await ItineraryItem.find({ trip: trip._id });
        for (const item of items) {
          if (item.date) {
            item.date = new Date(new Date(item.date).getTime() + diffMs);
            await item.save();
          }
        }
      }
    }
    if (travelersCount !== undefined) trip.travelersCount = travelersCount;
    if (currency !== undefined) trip.currency = currency.toUpperCase();
    if (status !== undefined) {
      const allowedStatuses = ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid trip status value.' });
      }
      trip.status = status;
    }
    if (packingList !== undefined) trip.packingList = packingList;
    if (emergencyContacts !== undefined) trip.emergencyContacts = emergencyContacts;
    if (isPublic !== undefined) trip.isPublic = isPublic;

    if (budget || totalBudget !== undefined) {
      trip.budget = {
        ...trip.budget,
        ...(budget || {}),
        ...(totalBudget !== undefined ? { totalBudget: Number(totalBudget) } : {}),
      };
    }

    await trip.save();

    await logActivity(trip._id, req.user, 'UPDATED_TRIP', `Updated journey details`);

    return res.status(200).json({ success: true, data: trip });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const trip = req.trip;

    // Only Owner can delete the entire trip
    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the journey owner can delete this journey.',
      });
    }

    // Cascade delete associated sub-collections
    await Promise.all([
      ItineraryItem.deleteMany({ trip: trip._id }),
      TripExpense.deleteMany({ trip: trip._id }),
      TripDocument.deleteMany({ trip: trip._id }),
      TripActivityLog.deleteMany({ trip: trip._id }),
      Trip.findByIdAndDelete(trip._id),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Journey and all associated data deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. ANALYTICS & BUDGET
// ==========================================


export const getTripAnalytics = async (req, res) => {
  try {
    const trip = req.trip;
    const expenses = await TripExpense.find({ trip: trip._id });
    const items = await ItineraryItem.find({ trip: trip._id });

    // 1. Category breakdown
    const categoryTotals = {};
    expenses.forEach((exp) => {
      const cat = exp.category || 'other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (exp.convertedAmount || exp.amount || 0);
    });

    const categoryBreakdown = Object.keys(categoryTotals).map((cat) => ({
      category: cat,
      amount: Number(categoryTotals[cat].toFixed(2)),
    }));

    // 2. Daily spending timeline
    const dailyTotals = {};
    expenses.forEach((exp) => {
      const dateKey = new Date(exp.date).toISOString().split('T')[0];
      dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + (exp.convertedAmount || exp.amount || 0);
    });

    const dailySpending = Object.keys(dailyTotals)
      .sort()
      .map((date) => ({
        date,
        amount: Number(dailyTotals[date].toFixed(2)),
      }));

    // 3. Planned vs Actual Comparisons
    const totalPlanned = items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
    const totalActual = expenses.reduce((sum, exp) => sum + (exp.convertedAmount || exp.amount || 0), 0);
    const totalBudget = trip.budget?.totalBudget || 50000;

    return res.status(200).json({
      success: true,
      currency: trip.currency,
      data: {
        totalBudget: Number(totalBudget.toFixed(2)),
        totalPlanned: Number(totalPlanned.toFixed(2)),
        totalActual: Number(totalActual.toFixed(2)),
        remainingBudget: Math.max(0, Number((totalBudget - totalActual).toFixed(2))),
        utilizationRate: totalBudget > 0 ? Number(((totalActual / totalBudget) * 100).toFixed(1)) : 0,
        categoryBreakdown,
        dailySpending,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. COLLABORATION & PARTICIPANTS
// ==========================================


export const getTripActivityLogs = async (req, res) => {
  try {
    const trip = req.trip;
    const logs = await TripActivityLog.find({ trip: trip._id })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 9. BACKWARD COMPATIBILITY ENDPOINTS
// ==========================================

export const addSegmentToTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    trip.segments.push(req.body);
    trip.segments.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
    await trip.save();

    return res.status(200).json({ success: true, data: trip });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTripBudget = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }
    trip.budget = { ...trip.budget, ...req.body };
    await trip.save();
    return res.status(200).json({ success: true, data: trip });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// In-memory 30-min weather cache per destination
const weatherCache = new Map();
const WEATHER_TTL_MS = 30 * 60 * 1000;

const describeWmoCode = (code) => {
  if (code === 0) return { label: 'Clear Sky', icon: 'sun' };
  if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', icon: 'cloud-sun' };
  if (code === 45 || code === 48) return { label: 'Foggy', icon: 'cloud' };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { label: 'Rain / Showers', icon: 'rain' };
  if (code >= 71 && code <= 77) return { label: 'Snowfall', icon: 'snow' };
  if (code >= 95) return { label: 'Thunderstorm', icon: 'storm' };
  return { label: 'Fair Weather', icon: 'cloud-sun' };
};

export const getTripWeather = async (req, res) => {
  try {
    const trip = req.trip;
    const destination = (req.query.destination || trip.destination || '').trim();
    if (!destination) {
      return res.status(400).json({ success: false, message: 'Destination is required for weather.' });
    }

    const cacheKey = destination.toLowerCase();
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < WEATHER_TTL_MS) {
      return res.status(200).json({ success: true, data: cached.data });
    }

    // 1. Geocode destination via free Open-Meteo Geocoding API (zero key needed)
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(4500) });
    if (!geoRes.ok) {
      return res.status(200).json({ success: true, data: null });
    }
    const geoData = await geoRes.json();
    const place = geoData?.results?.[0];
    if (!place) {
      return res.status(200).json({ success: true, data: null });
    }

    // 2. Fetch 7-day daily forecast from Open-Meteo
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const fcRes = await fetch(forecastUrl, { signal: AbortSignal.timeout(4500) });
    if (!fcRes.ok) {
      return res.status(200).json({ success: true, data: null });
    }
    const fcData = await fcRes.json();
    const daily = fcData?.daily;
    if (!daily || !Array.isArray(daily.time)) {
      return res.status(200).json({ success: true, data: null });
    }

    const forecast = daily.time.map((dateStr, idx) => {
      const code = daily.weathercode?.[idx] ?? 1;
      const cond = describeWmoCode(code);
      return {
        date: dateStr,
        tempMax: Math.round(daily.temperature_2m_max?.[idx] ?? 26),
        tempMin: Math.round(daily.temperature_2m_min?.[idx] ?? 18),
        rainChance: Math.round(daily.precipitation_probability_max?.[idx] ?? 0),
        condition: cond.label,
        icon: cond.icon,
      };
    });

    const rainAlert = forecast.some((d) => d.rainChance >= 50);
    const coldAlert = forecast.some((d) => d.tempMin <= 10);

    const payload = {
      location: `${place.name}${place.country ? `, ${place.country}` : ''}`,
      rainAlert,
      coldAlert,
      forecast,
      provider: 'Open-Meteo Live Forecast',
    };

    weatherCache.set(cacheKey, { timestamp: Date.now(), data: payload });
    return res.status(200).json({ success: true, data: payload });
  } catch (error) {
    console.warn('[Weather Forecast Notice]:', error.message);
    return res.status(200).json({ success: true, data: null });
  }
};

// ==========================================
// DOMAIN RE-EXPORTS (FOR MODULARITY & BACKWARD COMPATIBILITY)
// ==========================================
export * from './itineraryController.js';
export * from './expenseController.js';
export * from './participantController.js';
export * from './documentController.js';

