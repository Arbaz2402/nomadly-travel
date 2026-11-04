import mongoose from 'mongoose';
import { Trip } from '../models/Trip.js';
import { ItineraryItem } from '../models/ItineraryItem.js';
import { TripExpense } from '../models/TripExpense.js';
import { TripDocument } from '../models/TripDocument.js';
import { TripActivityLog } from '../models/TripActivityLog.js';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { convertCurrency, getExchangeRate } from '../utils/currencyRates.js';
import { calculateTripSettlement } from '../utils/settlementCalculator.js';
import { analyzeItineraryWarnings } from '../utils/itineraryWarnings.js';

// Helper to log trip activity
const logActivity = async (tripId, user, action, details) => {
  try {
    await TripActivityLog.create({
      trip: tripId,
      user: user?._id || null,
      userName: user?.displayName || user?.email || 'Traveler',
      action,
      details,
    });
  } catch (err) {
    console.warn('Activity log failure:', err.message);
  }
};

// Helper to safely map itinerary/booking category to TripExpense enum
const mapToExpenseCategory = (cat) => {
  if (!cat) return 'activities';
  const c = String(cat).toLowerCase().trim();
  const mapping = {
    flight: 'flights',
    flights: 'flights',
    hotel: 'hotels',
    hotels: 'hotels',
    train: 'trains',
    trains: 'trains',
    bus: 'buses',
    buses: 'buses',
    buss: 'buses',
    car_rental: 'local_transportation',
    local_transportation: 'local_transportation',
    restaurant: 'food',
    food: 'food',
    sightseeing: 'activities',
    activities: 'activities',
    activity: 'activities',
    activitiess: 'activities',
    shopping: 'shopping',
    insurance: 'insurance',
    other: 'other',
  };
  return mapping[c] || 'activities';
};

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
      .populate('bookings', 'bookingReference travelCategory totalPayable bookingStatus')
      .sort(sortOption);

    // Compute dynamic status & spending totals for dashboard KPIs
    let totalPlannedBudget = 0;
    let totalActualSpend = 0;
    let upcomingCount = 0;
    let ongoingCount = 0;
    let completedCount = 0;
    let draftCount = 0;

    const enrichedTrips = await Promise.all(
      trips.map(async (trip) => {
        const dynamicStatus = trip.calculateDynamicStatus();

        // Calculate actual spending from expenses
        const expenses = await TripExpense.find({ trip: trip._id });
        const tripActualSpend = expenses.reduce((sum, exp) => sum + (exp.convertedAmount || exp.amount || 0), 0);

        // Count itinerary items
        const itemsCount = await ItineraryItem.countDocuments({ trip: trip._id });

        const tripBudget = trip.budget?.totalBudget || 50000;
        totalPlannedBudget += tripBudget;
        totalActualSpend += tripActualSpend;

        if (dynamicStatus === 'upcoming') upcomingCount++;
        else if (dynamicStatus === 'ongoing') ongoingCount++;
        else if (dynamicStatus === 'completed') completedCount++;
        else if (dynamicStatus === 'draft') draftCount++;

        return {
          ...trip.toObject(),
          dynamicStatus,
          actualSpend: Number(tripActualSpend.toFixed(2)),
          budgetUtilization: tripBudget > 0 ? Number(((tripActualSpend / tripBudget) * 100).toFixed(1)) : 0,
          itemsCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: enrichedTrips.length,
      metrics: {
        totalTrips: enrichedTrips.length,
        upcomingCount,
        ongoingCount,
        completedCount,
        draftCount,
        totalPlannedBudget: Number(totalPlannedBudget.toFixed(2)),
        totalActualSpend: Number(totalActualSpend.toFixed(2)),
      },
      data: enrichedTrips,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('user', 'displayName email photoURL')
      .populate('bookings');

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
      isPublic,
    } = req.body;

    if (title !== undefined) trip.title = title.trim();
    if (description !== undefined) trip.description = description;
    if (coverImage !== undefined) trip.coverImage = coverImage;
    if (destination !== undefined) trip.destination = destination.trim();
    if (additionalDestinations !== undefined) trip.additionalDestinations = additionalDestinations;
    if (startDate !== undefined) trip.startDate = new Date(startDate);
    if (endDate !== undefined) trip.endDate = new Date(endDate);
    if (travelersCount !== undefined) trip.travelersCount = travelersCount;
    if (currency !== undefined) trip.currency = currency.toUpperCase();
    if (status !== undefined) trip.status = status;
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
// 2. ATTACH NOMADLY BOOKING TO TRIP
// ==========================================

export const attachBookingToTrip = async (req, res) => {
  try {
    const trip = req.trip;
    const { bookingId, bookingReference } = req.body;

    let booking = null;
    if (bookingId) {
      booking = await Booking.findById(bookingId);
    } else if (bookingReference) {
      booking = await Booking.findOne({ bookingReference: bookingReference.trim() });
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation booking not found.' });
    }

    // Verify ownership of booking
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only attach bookings that you have reserved.',
      });
    }

    // Check if already attached to trip
    const alreadyLinked = trip.bookings.some((b) => b.toString() === booking._id.toString());
    if (!alreadyLinked) {
      trip.bookings.push(booking._id);
      await trip.save();
    }

    // Check if itinerary item already exists for this booking
    const existingItem = await ItineraryItem.findOne({
      trip: trip._id,
      bookingId: booking._id,
    });

    if (existingItem) {
      return res.status(200).json({
        success: true,
        message: 'Booking is already present in this journey itinerary.',
        data: { trip, itineraryItem: existingItem },
      });
    }

    // Map booking to ItineraryItem
    const snap = booking.itinerarySnapshot || {};
    let title = `${booking.travelCategory.toUpperCase()} Reservation (${booking.bookingReference})`;
    let locationName = '';
    let itemDate = booking.createdAt;
    let startTime = '10:00';
    let endTime = '12:00';

    if (booking.travelCategory === 'flight') {
      title = `${snap.airline || 'Flight'} ${snap.flightNumber || ''} (${snap.origin || ''} → ${snap.destination || ''})`;
      locationName = `${snap.origin || ''} Airport`;
      if (snap.departureTime) {
        itemDate = new Date(snap.departureTime);
        startTime = new Date(snap.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      if (snap.arrivalTime) {
        endTime = new Date(snap.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    } else if (booking.travelCategory === 'hotel') {
      title = `${snap.name || 'Hotel Stay'} — ${snap.roomType || 'Room'}`;
      locationName = snap.location?.address || snap.location?.city || '';
      if (snap.checkInDate) itemDate = new Date(snap.checkInDate);
      startTime = '14:00';
      endTime = '11:00';
    } else if (booking.travelCategory === 'train') {
      title = `${snap.trainName || 'Train'} (${snap.trainNumber || ''})`;
      locationName = `${snap.originStation || ''} Railway Station`;
      if (snap.departureTime) {
        itemDate = new Date(snap.departureTime);
        startTime = new Date(snap.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    } else if (booking.travelCategory === 'bus') {
      title = `${snap.operatorName || 'Intercity Bus'} (${snap.busType || ''})`;
      locationName = snap.boardingPoint || snap.origin || '';
      if (snap.departureTime) {
        itemDate = new Date(snap.departureTime);
        startTime = new Date(snap.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    }

    const payable = booking.totalPayable || booking.priceBreakdown?.totalPayable || 0;

    const newItem = await ItineraryItem.create({
      trip: trip._id,
      title,
      description: `Confirmed NOMADLY booking with PNR / Ref: ${booking.bookingReference}`,
      category: booking.travelCategory,
      sourceType: 'nomadly_booking',
      bookingId: booking._id,
      bookingReference: booking.bookingReference,
      externalProvider: 'NOMADLY',
      location: { name: locationName, address: locationName },
      date: itemDate,
      startTime,
      endTime,
      estimatedCost: payable,
      actualCost: payable,
      currency: booking.priceBreakdown?.currency || trip.currency || 'INR',
      status: 'confirmed',
      notes: `Seats/Guests: ${booking.travelers?.length || 1} traveler(s)`,
    });

    // Also auto-record as a trip expense if not already recorded
    const existingExpense = await TripExpense.findOne({
      trip: trip._id,
      itineraryItemId: newItem._id,
    });

    if (!existingExpense && payable > 0) {
      const conversion = convertCurrency(payable, booking.priceBreakdown?.currency || 'INR', trip.currency);
      await TripExpense.create({
        trip: trip._id,
        title: `Booking: ${title}`,
        category: mapToExpenseCategory(booking.travelCategory),
        amount: payable,
        currency: booking.priceBreakdown?.currency || 'INR',
        exchangeRate: conversion.exchangeRate,
        convertedAmount: conversion.convertedAmount,
        date: itemDate,
        description: `Automatic expense linked to confirmed NOMADLY booking ${booking.bookingReference}`,
        paidBy: {
          userId: req.user._id,
          name: req.user.displayName || 'You',
          email: req.user.email,
        },
        itineraryItemId: newItem._id,
        splitType: 'equal',
        splits: [
          {
            user: req.user._id,
            name: req.user.displayName || 'You',
            email: req.user.email,
            shareAmount: conversion.convertedAmount,
            sharePercentage: 100,
            isSettled: true,
          },
        ],
      });
    }

    await logActivity(
      trip._id,
      req.user,
      'ATTACHED_BOOKING',
      `Attached NOMADLY booking (${booking.bookingReference}) to journey`
    );

    return res.status(200).json({
      success: true,
      message: 'Booking successfully integrated into journey!',
      data: { trip, itineraryItem: newItem },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. ITINERARY ITEM CRUD & REORDER
// ==========================================

export const getTripItinerary = async (req, res) => {
  try {
    const trip = req.trip;

    const items = await ItineraryItem.find({ trip: trip._id })
      .populate('bookingId')
      .sort({ date: 1, startTime: 1, orderIndex: 1 });

    // Run Conflict & Scheduling Analysis
    const warnings = analyzeItineraryWarnings(trip, items);

    // Group items by date for chronological daily timeline
    const groupedByDay = {};
    items.forEach((item) => {
      const dateKey = new Date(item.date).toISOString().split('T')[0];
      if (!groupedByDay[dateKey]) groupedByDay[dateKey] = [];
      groupedByDay[dateKey].push(item);
    });

    return res.status(200).json({
      success: true,
      count: items.length,
      warnings,
      groupedByDay,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addItineraryItem = async (req, res) => {
  try {
    const trip = req.trip;

    const {
      title,
      description,
      category,
      sourceType,
      externalProvider,
      externalBookingUrl,
      bookingReference,
      location,
      date,
      startTime,
      endTime,
      estimatedCost,
      actualCost,
      currency,
      status,
      notes,
    } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, message: 'Title and Date are required.' });
    }

    const highestOrderItem = await ItineraryItem.findOne({ trip: trip._id }).sort({ orderIndex: -1 });
    const nextOrder = highestOrderItem ? highestOrderItem.orderIndex + 1 : 0;

    const newItem = await ItineraryItem.create({
      trip: trip._id,
      title: title.trim(),
      description: description || '',
      category: category || 'activities',
      sourceType: sourceType || 'manual_entry',
      externalProvider: externalProvider || '',
      externalBookingUrl: externalBookingUrl || '',
      bookingReference: bookingReference || '',
      location: location || { name: '', address: '' },
      date: new Date(date),
      startTime: startTime || '10:00',
      endTime: endTime || '12:00',
      estimatedCost: Number(estimatedCost) || 0,
      actualCost: Number(actualCost) || 0,
      currency: (currency || trip.currency || 'INR').toUpperCase(),
      status: status || 'planned',
      notes: notes || '',
      orderIndex: nextOrder,
    });

    // If actual cost > 0, auto-record as a trip expense optionally
    if (Number(actualCost) > 0) {
      const conv = convertCurrency(Number(actualCost), newItem.currency, trip.currency);
      await TripExpense.create({
        trip: trip._id,
        title: newItem.title,
        category: mapToExpenseCategory(newItem.category),
        amount: Number(actualCost),
        currency: newItem.currency,
        exchangeRate: conv.exchangeRate,
        convertedAmount: conv.convertedAmount,
        date: new Date(date),
        description: `Expense for activity: ${newItem.title}`,
        paidBy: {
          userId: req.user._id,
          name: req.user.displayName || 'You',
          email: req.user.email,
        },
        itineraryItemId: newItem._id,
        splitType: 'equal',
        splits: [
          {
            user: req.user._id,
            name: req.user.displayName || 'You',
            email: req.user.email,
            shareAmount: conv.convertedAmount,
            sharePercentage: 100,
            isSettled: true,
          },
        ],
      });
    }

    await logActivity(
      trip._id,
      req.user,
      'ADDED_ACTIVITY',
      `Added "${newItem.title}" (${newItem.category}) to itinerary`
    );

    return res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateItineraryItem = async (req, res) => {
  try {
    const trip = req.trip;
    const item = await ItineraryItem.findOne({ _id: req.params.itemId, trip: trip._id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Itinerary item not found.' });
    }

    const updatable = [
      'title',
      'description',
      'category',
      'sourceType',
      'externalProvider',
      'externalBookingUrl',
      'bookingReference',
      'location',
      'date',
      'startTime',
      'endTime',
      'estimatedCost',
      'actualCost',
      'currency',
      'status',
      'notes',
      'orderIndex',
    ];

    updatable.forEach((key) => {
      if (req.body[key] !== undefined) {
        if (key === 'date') item.date = new Date(req.body.date);
        else item[key] = req.body[key];
      }
    });

    await item.save();

    await logActivity(trip._id, req.user, 'UPDATED_ACTIVITY', `Updated activity "${item.title}"`);

    return res.status(200).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteItineraryItem = async (req, res) => {
  try {
    const trip = req.trip;
    const item = await ItineraryItem.findOneAndDelete({ _id: req.params.itemId, trip: trip._id });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Itinerary item not found.' });
    }

    // Also remove associated expense if linked
    await TripExpense.deleteMany({ trip: trip._id, itineraryItemId: item._id });

    await logActivity(trip._id, req.user, 'DELETED_ACTIVITY', `Removed activity "${item.title}"`);

    return res.status(200).json({ success: true, message: 'Activity removed from itinerary.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderItineraryItems = async (req, res) => {
  try {
    const trip = req.trip;
    const { items } = req.body; // Array of { id, orderIndex, date, startTime }

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required for reordering.' });
    }

    const bulkOps = items.map((it) => ({
      updateOne: {
        filter: { _id: it.id, trip: trip._id },
        update: {
          $set: {
            orderIndex: it.orderIndex,
            ...(it.date ? { date: new Date(it.date) } : {}),
            ...(it.startTime ? { startTime: it.startTime } : {}),
            ...(it.endTime ? { endTime: it.endTime } : {}),
          },
        },
      },
    }));

    await ItineraryItem.bulkWrite(bulkOps);

    return res.status(200).json({ success: true, message: 'Itinerary successfully reordered.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. EXPENSE TRACKER & SPLITTING
// ==========================================

export const getTripExpenses = async (req, res) => {
  try {
    const trip = req.trip;
    const expenses = await TripExpense.find({ trip: trip._id }).sort({ date: -1, createdAt: -1 });

    const tripBudget = trip.budget?.totalBudget || 50000;
    const totalSpent = expenses.reduce((sum, exp) => sum + (exp.convertedAmount || exp.amount || 0), 0);
    const remainingBudget = Math.max(0, tripBudget - totalSpent);
    const utilization = tripBudget > 0 ? Number(((totalSpent / tripBudget) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      count: expenses.length,
      summary: {
        budget: Number(tripBudget.toFixed(2)),
        currency: trip.currency,
        totalSpent: Number(totalSpent.toFixed(2)),
        remainingBudget: Number(remainingBudget.toFixed(2)),
        utilizationPercentage: utilization,
      },
      data: expenses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTripExpense = async (req, res) => {
  try {
    const trip = req.trip;

    const {
      title,
      category,
      amount,
      currency,
      date,
      description,
      paidBy,
      receiptUrl,
      itineraryItemId,
      splitType,
      splits,
      customExchangeRate,
    } = req.body;

    if (!title || amount === undefined || amount === null) {
      return res.status(400).json({ success: false, message: 'Expense title and amount are required.' });
    }

    const expenseCurrency = (currency || trip.currency || 'INR').toUpperCase();
    const numericAmount = Number(amount);

    // Multi-currency calculation
    const conversion = convertCurrency(
      numericAmount,
      expenseCurrency,
      trip.currency,
      customExchangeRate ? Number(customExchangeRate) : null
    );

    // Determine Payer
    const finalPaidBy = paidBy || {
      userId: req.user._id,
      name: req.user.displayName || 'You',
      email: req.user.email,
    };

    // Calculate Splits
    let calculatedSplits = [];
    if (Array.isArray(splits) && splits.length > 0) {
      calculatedSplits = splits;
    } else {
      // Auto equal split across trip participants
      const participants = trip.participants?.length > 0 ? trip.participants : [finalPaidBy];
      const perPersonShare = Number((conversion.convertedAmount / participants.length).toFixed(2));
      const percentageShare = Number((100 / participants.length).toFixed(1));

      calculatedSplits = participants.map((p) => ({
        user: p.user || null,
        name: p.name,
        email: p.email || '',
        shareAmount: perPersonShare,
        sharePercentage: percentageShare,
        isSettled: (p.email && p.email.toLowerCase() === finalPaidBy.email?.toLowerCase()),
      }));
    }

    const newExpense = await TripExpense.create({
      trip: trip._id,
      title: title.trim(),
      category: category || 'other',
      amount: numericAmount,
      currency: expenseCurrency,
      exchangeRate: conversion.exchangeRate,
      convertedAmount: conversion.convertedAmount,
      conversionTimestamp: conversion.conversionTimestamp,
      date: date ? new Date(date) : new Date(),
      description: description || '',
      paidBy: finalPaidBy,
      receiptUrl: receiptUrl || '',
      itineraryItemId: itineraryItemId || null,
      splitType: splitType || 'equal',
      splits: calculatedSplits,
    });

    await logActivity(
      trip._id,
      req.user,
      'ADDED_EXPENSE',
      `Recorded expense "${newExpense.title}" of ${expenseCurrency} ${numericAmount}`
    );

    return res.status(201).json({ success: true, data: newExpense });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTripExpense = async (req, res) => {
  try {
    const trip = req.trip;
    const expense = await TripExpense.findOne({ _id: req.params.expenseId, trip: trip._id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    const {
      title,
      category,
      amount,
      currency,
      date,
      description,
      paidBy,
      receiptUrl,
      splitType,
      splits,
      customExchangeRate,
    } = req.body;

    if (title !== undefined) expense.title = title.trim();
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (paidBy !== undefined) expense.paidBy = paidBy;
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;
    if (splitType !== undefined) expense.splitType = splitType;
    if (splits !== undefined) expense.splits = splits;
    if (date !== undefined) expense.date = new Date(date);

    // Re-evaluate multi-currency if amount or currency changed
    if (amount !== undefined || currency !== undefined || customExchangeRate !== undefined) {
      const numAmount = amount !== undefined ? Number(amount) : expense.amount;
      const cur = currency !== undefined ? currency.toUpperCase() : expense.currency;
      const conv = convertCurrency(
        numAmount,
        cur,
        trip.currency,
        customExchangeRate ? Number(customExchangeRate) : null
      );
      expense.amount = numAmount;
      expense.currency = cur;
      expense.exchangeRate = conv.exchangeRate;
      expense.convertedAmount = conv.convertedAmount;
      expense.conversionTimestamp = conv.conversionTimestamp;
    }

    await expense.save();

    await logActivity(trip._id, req.user, 'UPDATED_EXPENSE', `Updated expense "${expense.title}"`);

    return res.status(200).json({ success: true, data: expense });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTripExpense = async (req, res) => {
  try {
    const trip = req.trip;
    const expense = await TripExpense.findOneAndDelete({ _id: req.params.expenseId, trip: trip._id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    await logActivity(trip._id, req.user, 'DELETED_EXPENSE', `Deleted expense "${expense.title}"`);

    return res.status(200).json({ success: true, message: 'Expense record deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTripSettlement = async (req, res) => {
  try {
    const trip = req.trip;
    const expenses = await TripExpense.find({ trip: trip._id });

    const settlement = calculateTripSettlement(expenses, trip.participants || []);

    return res.status(200).json({
      success: true,
      currency: trip.currency,
      data: settlement,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const settleExpenseShare = async (req, res) => {
  try {
    const trip = req.trip;
    const { expenseId, splitIndex, isSettled } = req.body;

    const expense = await TripExpense.findOne({ _id: expenseId, trip: trip._id });
    if (!expense || !expense.splits[splitIndex]) {
      return res.status(404).json({ success: false, message: 'Expense or split entry not found.' });
    }

    expense.splits[splitIndex].isSettled = isSettled !== undefined ? isSettled : true;
    await expense.save();

    return res.status(200).json({ success: true, message: 'Settlement state updated.', data: expense });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. TRIP ANALYTICS & BUDGET
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

export const getTripParticipants = async (req, res) => {
  try {
    const trip = req.trip;
    return res.status(200).json({
      success: true,
      count: trip.participants.length,
      data: trip.participants,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addTripParticipant = async (req, res) => {
  try {
    const trip = req.trip;
    const { name, email, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and valid email are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if already in participants
    const alreadyParticipant = trip.participants.some(
      (p) => p.email && p.email.toLowerCase() === normalizedEmail
    );

    if (alreadyParticipant) {
      return res.status(400).json({ success: false, message: 'An invite or membership already exists for this email.' });
    }

    // Try to find matching registered user
    const matchedUser = await User.findOne({ email: normalizedEmail });

    // Always create as a 'pending' invitation request
    const newParticipant = {
      user: matchedUser ? matchedUser._id : null,
      name: name.trim(),
      email: normalizedEmail,
      role: role && ['editor', 'viewer'].includes(role) ? role : 'editor',
      status: 'pending', // Requires invite acceptance by recipient
      invitedAt: new Date(),
      acceptedAt: null,
    };

    trip.participants.push(newParticipant);
    await trip.save();

    await logActivity(
      trip._id,
      req.user,
      'INVITED_MEMBER',
      `Sent collaboration request to ${newParticipant.name} (${newParticipant.email}) as ${newParticipant.role.toUpperCase()}`
    );

    return res.status(201).json({
      success: true,
      message: `Collaboration invitation request sent to ${newParticipant.email}.`,
      data: trip.participants,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resendTripInvitation = async (req, res) => {
  try {
    const trip = req.trip;
    const { participantId } = req.params;

    const participant = trip.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Invitation record not found.' });
    }

    participant.invitedAt = new Date();
    await trip.save();

    await logActivity(
      trip._id,
      req.user,
      'RESENT_INVITE',
      `Resent invitation request to ${participant.name} (${participant.email})`
    );

    return res.status(200).json({
      success: true,
      message: `Invitation request re-sent to ${participant.email}!`,
      data: trip.participants,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const respondToTripInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'decline'

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be accept or decline.' });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Journey not found.' });
    }

    const currentUserId = req.user._id.toString();
    const currentUserEmail = req.user.email?.toLowerCase();

    const participant = trip.participants.find(
      (p) =>
        (p.user && p.user.toString() === currentUserId) ||
        (p.email && p.email.toLowerCase() === currentUserEmail)
    );

    if (!participant) {
      return res.status(404).json({ success: false, message: 'No invitation request found for your account.' });
    }

    if (action === 'accept') {
      participant.status = 'accepted';
      participant.acceptedAt = new Date();
      participant.user = req.user._id;
      await trip.save();

      await logActivity(
        trip._id,
        req.user,
        'ACCEPTED_INVITE',
        `${req.user.displayName || req.user.email} accepted the collaboration invitation`
      );

      return res.status(200).json({
        success: true,
        message: `You accepted the invitation and joined "${trip.title}"!`,
        data: trip,
      });
    } else {
      trip.participants.pull(participant._id);
      await trip.save();

      return res.status(200).json({
        success: true,
        message: `You declined the invitation to join "${trip.title}".`,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTripParticipantRole = async (req, res) => {
  try {
    const trip = req.trip;
    const { participantId } = req.params;
    const { role } = req.body;

    // Only owner can change roles
    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the journey owner can modify participant roles.' });
    }

    const participant = trip.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found.' });
    }

    if (participant.role === 'owner') {
      return res.status(400).json({ success: false, message: 'Cannot modify primary owner role.' });
    }

    participant.role = role;
    await trip.save();

    await logActivity(
      trip._id,
      req.user,
      'UPDATED_ROLE',
      `Changed ${participant.name}'s role to ${role.toUpperCase()}`
    );

    return res.status(200).json({ success: true, data: trip.participants });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const removeTripParticipant = async (req, res) => {
  try {
    const trip = req.trip;
    const { participantId } = req.params;

    // Only owner can remove participants
    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the journey owner can remove participants.' });
    }

    const participant = trip.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found.' });
    }

    if (participant.role === 'owner') {
      return res.status(400).json({ success: false, message: 'Cannot remove primary journey owner.' });
    }

    const removedName = participant.name;
    trip.participants.pull(participantId);
    await trip.save();

    await logActivity(trip._id, req.user, 'REMOVED_MEMBER', `Removed ${removedName} from journey participants`);

    return res.status(200).json({ success: true, message: 'Participant removed.', data: trip.participants });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. SECURE TRIP DOCUMENTS
// ==========================================

export const getTripDocuments = async (req, res) => {
  try {
    const trip = req.trip;
    // Omit large base64 fileData when listing documents for fast response
    const documents = await TripDocument.find({ trip: trip._id })
      .select('-fileData')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadTripDocument = async (req, res) => {
  try {
    const trip = req.trip;
    const { title, category, fileName, fileType, fileSize, fileData, notes } = req.body;

    if (!title || !fileName || !fileData) {
      return res.status(400).json({
        success: false,
        message: 'Title, file name, and file data payload are required.',
      });
    }

    // Limit document size to 10MB
    const MAX_BYTES = 10 * 1024 * 1024;
    if (fileSize && Number(fileSize) > MAX_BYTES) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the 10MB maximum limit.',
      });
    }

    const newDoc = await TripDocument.create({
      trip: trip._id,
      title: title.trim(),
      category: category || 'other',
      fileName,
      fileType: fileType || 'application/octet-stream',
      fileSize: Number(fileSize) || fileData.length,
      fileData,
      uploadedBy: req.user._id,
      uploadedByName: req.user.displayName || 'You',
      notes: notes || '',
    });

    await logActivity(
      trip._id,
      req.user,
      'UPLOADED_DOCUMENT',
      `Uploaded document "${newDoc.title}" (${newDoc.category})`
    );

    // Return without full fileData
    const docObj = newDoc.toObject();
    delete docObj.fileData;

    return res.status(201).json({ success: true, data: docObj });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadTripDocument = async (req, res) => {
  try {
    const trip = req.trip;
    const doc = await TripDocument.findOne({ _id: req.params.docId, trip: trip._id });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        title: doc.title,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        fileData: doc.fileData,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTripDocument = async (req, res) => {
  try {
    const trip = req.trip;
    const doc = await TripDocument.findOneAndDelete({ _id: req.params.docId, trip: trip._id });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    await logActivity(trip._id, req.user, 'DELETED_DOCUMENT', `Deleted document "${doc.title}"`);

    return res.status(200).json({ success: true, message: 'Document deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 8. TRIP ACTIVITY LOGS
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
