import { Trip } from '../models/Trip.js';
import { ItineraryItem } from '../models/ItineraryItem.js';
import { TripExpense } from '../models/TripExpense.js';
import { convertCurrency } from '../utils/currencyRates.js';
import { analyzeItineraryWarnings } from '../utils/itineraryWarnings.js';
import {
  logTripActivity as logActivity,
  groupItineraryByDay,
  mapToExpenseCategory,
} from '../services/trip/tripService.js';

export const getTripItinerary = async (req, res) => {
  try {
    const trip = req.trip;

    const items = await ItineraryItem.find({ trip: trip._id })
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
