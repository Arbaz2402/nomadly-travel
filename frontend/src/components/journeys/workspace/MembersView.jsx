import React, { useState } from 'react';
import {
  UserPlus,
  Shield,
  Copy,
  Mail,
  Loader2,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  Check,
  Send,
  Users,
} from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

export const MembersView = ({ trip, participants, isOwner, onRefresh, onOpenAddMember }) => {
  const { showToast } = useToast();
  const [resendingId, setResendingId] = useState(null);
  const [copiedInviteId, setCopiedInviteId] = useState(null);

  const getGmailInviteDetails = (participant) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nomadly-travel.netlify.app';
    const tripUrl = `${origin}/journeys/${trip._id}`;
    const destination = trip.destination || trip.title || 'Trip Destination';
    const tripTitle = trip.title || 'Journey';
    const roleName = (participant.role || 'editor').toUpperCase();
    const formattedDates = trip.startDate
      ? `${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${trip.endDate ? ` – ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}`
      : 'Upcoming Dates';

    const subject = `Join my trip to ${destination}: "${tripTitle}" on Nomadly`;
    const body = `Hi ${participant.name || 'there'},

I've invited you to collaborate with me on "${tripTitle}" (${destination}) as an ${roleName} on Nomadly!

Trip Details:
📍 Destination: ${destination}
📅 Dates: ${formattedDates}
👥 Role: ${roleName} (${participant.role === 'editor' ? 'Can add, edit, and organize activities & split expenses' : 'Read-only access to itinerary & map stops'})

Accept the invitation and view our interactive itinerary here:
${tripUrl}

Looking forward to traveling together!`;

    return { body, tripUrl, subject };
  };

  const handleCopyInvite = (participant) => {
    const { body } = getGmailInviteDetails(participant);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(body);
      setCopiedInviteId(participant._id);
      showToast(`Invitation details for ${participant.name} copied to clipboard!`, 'success');
      setTimeout(() => setCopiedInviteId(null), 3000);
    }
  };

  const handleRoleChange = async (participantId, newRole) => {
    try {
      const res = await ApiClient.updateTripParticipantRole(trip._id, participantId, newRole);
      if (res.success) {
        showToast('Member role updated', 'success');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update role', 'error');
    }
  };

  const handleRemoveMember = async (participantId, name, isPending = false) => {
    const actionLabel = isPending ? 'revoke invitation request for' : 'remove';
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${name}?`)) return;
    try {
      const res = await ApiClient.removeTripParticipant(trip._id, participantId);
      if (res.success) {
        showToast(isPending ? 'Invitation request revoked' : 'Member removed', 'info');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove member', 'error');
    }
  };

  const handleResendInvite = async (participantId, name, email) => {
    try {
      setResendingId(participantId);
      const res = await ApiClient.resendTripInvitation(trip._id, participantId);
      if (res.success) {
        showToast(
          res.message || `Invitation email successfully re-sent to ${name} (${email})!`,
          res.emailSent === false ? 'warning' : 'success'
        );
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to resend invitation', 'error');
    } finally {
      setResendingId(null);
    }
  };

  const activeMembers = participants.filter((p) => p.status === 'accepted' || p.role === 'owner');
  const pendingRequests = participants.filter((p) => p.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-ink-900/60 p-4 sm:p-5 rounded-2xl border border-white/5">
        <div>
          <h3 className="text-base font-bold text-white font-display">Travel Companions & Collaboration</h3>
          <p className="text-xs text-slate-400">
            Invite travel partners with Editor (modify itinerary & expenses) or Viewer (read-only) roles. Members receive an invitation request before joining.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={onOpenAddMember}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" /> Send Invitation Request
          </button>
        )}
      </div>

      {/* Pending Invitations Section */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Pending Collaboration Requests ({pendingRequests.length})
            </h4>
          </div>

          <div className="glass-panel rounded-3xl border border-amber-500/20 bg-amber-500/[0.02] overflow-hidden divide-y divide-white/5">
            {pendingRequests.map((p) => (
              <div key={p._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-sm flex items-center justify-center">
                    {p.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{p.name}</p>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3 animate-pulse" />
                        Invitation Sent
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{p.email}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>Invited as <strong className="text-slate-200 capitalize">{p.role}</strong></span>
                      <span>&bull;</span>
                      <span className="text-teal-400 font-medium flex items-center gap-1">
                        <Mail className="w-3 h-3 text-teal-400" />
                        Email dispatched to {p.email}
                      </span>
                      <span>&bull;</span>
                      <span className="text-slate-500">Awaiting acceptance</span>
                    </p>
                  </div>
                </div>

                {isOwner && (
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleCopyInvite(p)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors"
                      title="Copy invitation message & trip link to clipboard"
                    >
                      {copiedInviteId === p._id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-teal-400" />
                          <span className="text-teal-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-teal-400" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleResendInvite(p._id, p.name, p.email)}
                      disabled={resendingId === p._id}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 hover:text-teal-200 text-xs font-semibold border border-teal-500/20 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      title="Re-send invitation email"
                    >
                      <Send className="w-3.5 h-3.5 text-teal-400" />
                      <span>{resendingId === p._id ? 'Sending...' : 'Resend Invite'}</span>
                    </button>
                    <button
                      onClick={() => handleRemoveMember(p._id, p.name, true)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 flex items-center gap-1.5 transition-colors"
                      title="Revoke invitation request"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Collaborators Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Users className="w-4 h-4 text-teal-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active Collaborators ({activeMembers.length})
          </h4>
        </div>

        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/5">
          {activeMembers.map((p) => (
            <div key={p._id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-coral-500 text-white font-bold text-sm flex items-center justify-center">
                  {p.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{p.name}</p>
                    {p.role === 'owner' ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-coral-500/20 text-coral-300 border border-coral-500/30">
                        Owner
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{p.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isOwner && p.role !== 'owner' ? (
                  <select
                    value={p.role}
                    onChange={(e) => handleRoleChange(p._id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-slate-200 font-semibold focus:outline-none focus:border-coral-500"
                  >
                    <option value="editor">Editor (Can edit)</option>
                    <option value="viewer">Viewer (Read only)</option>
                  </select>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {p.role}
                  </span>
                )}

                {isOwner && p.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveMember(p._id, p.name, false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove from trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
