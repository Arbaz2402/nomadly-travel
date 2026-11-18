import { TripActivityLog } from '../../models/TripActivityLog.js';
import { TripExpense } from '../../models/TripExpense.js';
import { ItineraryItem } from '../../models/ItineraryItem.js';

/**
 * Logs an activity audit entry for a journey.
 */
export const logTripActivity = async (tripId, user, action, details) => {
  try {
    await TripActivityLog.create({
      trip: tripId,
      user: user?._id || null,
      userName: user?.displayName || user?.email || 'Traveler',
      action,
      details,
    });
  } catch (err) {
    console.warn('[TripService] Activity log failure:', err.message);
  }
};

/**
 * Maps an incoming travel or booking category string to the TripExpense category enum.
 */
export const mapToExpenseCategory = (cat) => {
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
    package: 'hotels',
    packages: 'hotels',
    experience: 'activities',
    experiences: 'activities',
    car_rental: 'local_transportation',
    local_transportation: 'local_transportation',
    restaurant: 'food',
    food: 'food',
    sightseeing: 'activities',
    activities: 'activities',
    activity: 'activities',
    shopping: 'shopping',
    insurance: 'insurance',
    other: 'other',
  };
  return mapping[c] || 'activities';
};

/**
 * Computes dynamic status, actual spend, and itinerary counts across a list of trips.
 */
export const enrichTripsWithMetrics = async (trips, currentUserId, currentUserEmail) => {
  let totalPlannedBudget = 0;
  let totalActualSpend = 0;
  let upcomingCount = 0;
  let ongoingCount = 0;
  let completedCount = 0;
  let draftCount = 0;
  let pendingInvitationsCount = 0;

  const currentUidStr = currentUserId ? currentUserId.toString() : '';
  const currentEmailLower = currentUserEmail ? currentUserEmail.toLowerCase() : '';

  const enrichedTrips = await Promise.all(
    trips.map(async (trip) => {
      const dynamicStatus = trip.calculateDynamicStatus();

      // Calculate actual spending from expenses
      const expenses = await TripExpense.find({ trip: trip._id });
      const tripActualSpend = expenses.reduce(
        (sum, exp) => sum + (exp.convertedAmount || exp.amount || 0),
        0
      );

      // Count itinerary items
      const itemsCount = await ItineraryItem.countDocuments({ trip: trip._id });

      const planned = trip.budget?.totalBudget || 50000;
      totalPlannedBudget += planned;
      totalActualSpend += tripActualSpend;

      if (dynamicStatus === 'upcoming') upcomingCount++;
      else if (dynamicStatus === 'ongoing') ongoingCount++;
      else if (dynamicStatus === 'completed') completedCount++;
      else draftCount++;

      // Determine logged-in user's role and collaboration status
      const isOwner = trip.user?._id?.toString() === currentUidStr;
      const myParticipant = !isOwner && trip.participants
        ? trip.participants.find(
            (p) =>
              (p.user && p.user.toString() === currentUidStr) ||
              (p.email && p.email.toLowerCase() === currentEmailLower)
          )
        : null;

      const userRole = isOwner ? 'owner' : myParticipant?.role || 'viewer';
      const participantStatus = isOwner ? 'accepted' : myParticipant?.status || 'accepted';
      const inviterName = trip.user?.displayName || trip.user?.name || trip.user?.email || 'A fellow traveler';
      const inviterPhoto = trip.user?.photoURL || null;

      if (participantStatus === 'pending') {
        pendingInvitationsCount++;
      }

      return {
        ...trip.toObject(),
        dynamicStatus,
        isOwner,
        userRole,
        participantStatus,
        inviterName,
        inviterPhoto,
        actualSpend: Number(tripActualSpend.toFixed(2)),
        budgetUtilization: planned > 0 ? Number(((tripActualSpend / planned) * 100).toFixed(1)) : 0,
        itemsCount,
      };
    })
  );

  return {
    trips: enrichedTrips,
    metrics: {
      totalTrips: enrichedTrips.length,
      upcomingCount,
      ongoingCount,
      completedCount,
      draftCount,
      pendingInvitationsCount,
      totalPlannedBudget: Number(totalPlannedBudget.toFixed(2)),
      totalActualSpend: Number(totalActualSpend.toFixed(2)),
    },
  };
};

/**
 * Groups a flat array of itinerary items by calendar day.
 */
export const groupItineraryByDay = (items = []) => {
  const grouped = {};
  items.forEach((item) => {
    const day = item.dayNumber || 1;
    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(item);
  });
  return grouped;
};
