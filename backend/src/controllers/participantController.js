import { Trip } from '../models/Trip.js';
import { User } from '../models/User.js';
import { sendTripInvitationEmail, isEmailConfigured } from '../services/emailService.js';
import { logTripActivity as logActivity } from '../services/trip/tripService.js';

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

    const emailConfigured = isEmailConfigured();

    if (emailConfigured) {
      // Dispatch email asynchronously in background so client receives instant response (<100ms)
      sendTripInvitationEmail({
        trip,
        inviter: req.user,
        inviteeName: newParticipant.name,
        inviteeEmail: newParticipant.email,
        role: newParticipant.role,
      })
        .then((result) => {
          if (!result.sent) {
            console.warn(`[EmailService] SMTP delivery failed for ${newParticipant.email}:`, result.reason);
          } else {
            console.info(`[EmailService] SMTP successfully sent invitation to ${newParticipant.email} (id: ${result.messageId})`);
          }
        })
        .catch((err) => console.warn('[EmailService] Async dispatch error:', err.message));
    } else {
      console.warn(`[EmailService] EMAIL_PASS is missing in server environment. Email dispatch skipped for ${newParticipant.email}.`);
    }

    return res.status(201).json({
      success: true,
      emailSent: emailConfigured,
      message: emailConfigured
        ? `Invitation email successfully sent to ${newParticipant.name} (${newParticipant.email})!`
        : `Invitation request created for ${newParticipant.name}! (Email skipped: EMAIL_PASS is not configured in server environment).`,
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

    const emailConfigured = isEmailConfigured();

    if (emailConfigured) {
      // Re-dispatch email asynchronously in background so response is immediate
      sendTripInvitationEmail({
        trip,
        inviter: req.user,
        inviteeName: participant.name,
        inviteeEmail: participant.email,
        role: participant.role,
      })
        .then((result) => {
          if (!result.sent) {
            console.warn(`[EmailService] SMTP resend failed for ${participant.email}:`, result.reason);
          } else {
            console.info(`[EmailService] SMTP successfully resent invitation to ${participant.email} (id: ${result.messageId})`);
          }
        })
        .catch((err) => console.warn('[EmailService] Async resend error:', err.message));
    } else {
      console.warn(`[EmailService] EMAIL_PASS is missing in server environment. Resend skipped for ${participant.email}.`);
    }

    return res.status(200).json({
      success: true,
      emailSent: emailConfigured,
      message: emailConfigured
        ? `Invitation email successfully re-sent to ${participant.name} (${participant.email})!`
        : `Invitation updated for ${participant.name}! (Email skipped: EMAIL_PASS is not configured in server environment).`,
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

/**
 * 6g. LEAVE JOURNEY (Voluntary exit by editor or viewer)
 */
export const leaveJourney = async (req, res) => {
  try {
    const trip = req.trip;
    const currentUserId = req.user._id.toString();
    const currentUserEmail = req.user.email?.toLowerCase();

    // 1. Primary owner cannot leave their own journey
    if (trip.user.toString() === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'Journey owners cannot leave. You can transfer ownership or delete the journey.',
      });
    }

    // 2. Locate participant record
    const participantIndex = trip.participants.findIndex(
      (p) =>
        (p.user && p.user.toString() === currentUserId) ||
        (p.email && currentUserEmail && p.email.toLowerCase() === currentUserEmail)
    );

    if (participantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'You are not a registered participant of this journey.',
      });
    }

    const participant = trip.participants[participantIndex];
    const memberName = participant.name || req.user.name || 'A traveler';

    // 3. Remove participant
    trip.participants.splice(participantIndex, 1);
    await trip.save();

    // 4. Log journey activity
    await logActivity(
      trip._id,
      req.user,
      'MEMBER_LEFT',
      `${memberName} left the journey`
    );

    return res.status(200).json({
      success: true,
      message: 'You have successfully left the journey.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. SECURE TRIP DOCUMENTS
// ==========================================
