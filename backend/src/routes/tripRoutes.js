import express from 'express';
import {
  getMyTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  attachBookingToTrip,
  getTripItinerary,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  reorderItineraryItems,
  getTripExpenses,
  createTripExpense,
  updateTripExpense,
  deleteTripExpense,
  getTripSettlement,
  settleExpenseShare,
  getTripAnalytics,
  getTripParticipants,
  addTripParticipant,
  updateTripParticipantRole,
  removeTripParticipant,
  resendTripInvitation,
  respondToTripInvitation,
  getTripDocuments,
  uploadTripDocument,
  downloadTripDocument,
  deleteTripDocument,
  getTripActivityLogs,
  addSegmentToTrip,
  updateTripBudget,
} from '../controllers/tripController.js';
import { verifyAuth } from '../middleware/auth.js';
import { requireTripAccess } from '../middleware/tripAuth.js';

const router = express.Router();

// Apply authentication to all trip routes
router.use(verifyAuth);

// 1. Core Trips CRUD & Dashboard
router.get('/', getMyTrips);
router.post('/', createTrip);
router.get('/:id', requireTripAccess(['owner', 'editor', 'viewer']), getTripById);
router.put('/:id', requireTripAccess(['owner', 'editor']), updateTrip);
router.delete('/:id', requireTripAccess(['owner']), deleteTrip);

// 2. Integration with NOMADLY Bookings
router.post('/:id/attach-booking', requireTripAccess(['owner', 'editor']), attachBookingToTrip);

// 3. Itinerary Builder Endpoints
router.get('/:id/itinerary', requireTripAccess(['owner', 'editor', 'viewer']), getTripItinerary);
router.post('/:id/itinerary', requireTripAccess(['owner', 'editor']), addItineraryItem);
router.put('/:id/itinerary/:itemId', requireTripAccess(['owner', 'editor']), updateItineraryItem);
router.delete('/:id/itinerary/:itemId', requireTripAccess(['owner', 'editor']), deleteItineraryItem);
router.patch('/:id/itinerary/reorder', requireTripAccess(['owner', 'editor']), reorderItineraryItems);

// 4. Expense Tracker & Debt Settlement Endpoints
router.get('/:id/expenses', requireTripAccess(['owner', 'editor', 'viewer']), getTripExpenses);
router.post('/:id/expenses', requireTripAccess(['owner', 'editor']), createTripExpense);
router.put('/:id/expenses/:expenseId', requireTripAccess(['owner', 'editor']), updateTripExpense);
router.delete('/:id/expenses/:expenseId', requireTripAccess(['owner', 'editor']), deleteTripExpense);
router.get('/:id/settlement', requireTripAccess(['owner', 'editor', 'viewer']), getTripSettlement);
router.post('/:id/settlement/settle', requireTripAccess(['owner', 'editor']), settleExpenseShare);

// 5. Analytics & Budget
router.get('/:id/analytics', requireTripAccess(['owner', 'editor', 'viewer']), getTripAnalytics);

// 6. Collaboration & Members
router.get('/:id/participants', requireTripAccess(['owner', 'editor', 'viewer']), getTripParticipants);
router.post('/:id/participants', requireTripAccess(['owner', 'editor']), addTripParticipant);
router.post('/:id/invitation/respond', respondToTripInvitation);
router.post('/:id/participants/:participantId/resend', requireTripAccess(['owner']), resendTripInvitation);
router.put('/:id/participants/:participantId', requireTripAccess(['owner']), updateTripParticipantRole);
router.delete('/:id/participants/:participantId', requireTripAccess(['owner']), removeTripParticipant);

// 7. Secure Trip Documents
router.get('/:id/documents', requireTripAccess(['owner', 'editor', 'viewer']), getTripDocuments);
router.post('/:id/documents', requireTripAccess(['owner', 'editor']), uploadTripDocument);
router.get('/:id/documents/:docId/download', requireTripAccess(['owner', 'editor', 'viewer']), downloadTripDocument);
router.delete('/:id/documents/:docId', requireTripAccess(['owner', 'editor']), deleteTripDocument);

// 8. Activity Logs
router.get('/:id/activity-logs', requireTripAccess(['owner', 'editor', 'viewer']), getTripActivityLogs);

// 9. Legacy backwards-compatibility
router.post('/:id/segments', addSegmentToTrip);
router.put('/:id/budget', updateTripBudget);

export default router;
