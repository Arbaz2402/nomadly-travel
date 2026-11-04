import { Trip } from '../models/Trip.js';

/**
 * Middleware to verify user has required access level to the specified trip.
 * @param {Array<string>} allowedRoles - e.g. ['owner', 'editor', 'viewer']
 */
export const requireTripAccess = (allowedRoles = ['owner', 'editor', 'viewer']) => {
  return async (req, res, next) => {
    try {
      const tripId = req.params.tripId || req.params.id;

      if (!tripId) {
        return res.status(400).json({ success: false, message: 'Trip ID parameter is required.' });
      }

      const trip = await Trip.findById(tripId).populate('bookings');
      if (!trip) {
        return res.status(404).json({ success: false, message: 'Journey not found.' });
      }

      const currentUserId = req.user?._id?.toString();
      const currentUserEmail = req.user?.email?.toLowerCase();

      // 1. Check if user is the Trip Owner
      const isOwner = trip.user.toString() === currentUserId;

      // 2. Check if user is a participant
      let participantRole = null;
      let participantStatus = 'accepted';
      if (trip.participants && trip.participants.length > 0) {
        const participant = trip.participants.find(
          (p) =>
            (p.user && p.user.toString() === currentUserId) ||
            (p.email && currentUserEmail && p.email.toLowerCase() === currentUserEmail)
        );
        if (participant) {
          participantRole = participant.role;
          participantStatus = participant.status || 'pending';
        }
      }

      // 3. Admin & Support override: Administrators can view and assist with any journey
      const isAdmin = req.user?.role === 'admin';

      const effectiveRole = isOwner ? 'owner' : (isAdmin ? 'owner' : participantRole);

      if (!effectiveRole) {
        // If trip is marked public and viewer is allowed, permit read-only
        if (trip.isPublic && allowedRoles.includes('viewer')) {
          req.trip = trip;
          req.tripRole = 'viewer';
          req.participantStatus = 'accepted';
          return next();
        }

        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to view or manage this journey.',
        });
      }

      // If user is a pending invitee trying to perform mutating actions (editor/owner)
      if (!isOwner && !isAdmin && participantStatus === 'pending') {
        if (!allowedRoles.includes('viewer')) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Please accept the collaboration invitation first to start editing this journey.',
            pendingInvite: true,
          });
        }
      }

      if (!allowedRoles.includes(effectiveRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Your role (${effectiveRole.toUpperCase()}) cannot perform this action. Required: ${allowedRoles.join(', ')}`,
        });
      }

      req.trip = trip;
      req.tripRole = effectiveRole;
      req.participantStatus = participantStatus;
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
};

