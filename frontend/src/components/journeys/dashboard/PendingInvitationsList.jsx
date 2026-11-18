import React from 'react';
import { Mail, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { formatDate } from '../../../utils/formatters';

export const PendingInvitationsList = ({
  pendingInvitations = [],
  respondingInviteId,
  onRespondInvite,
}) => {
  if (!pendingInvitations || pendingInvitations.length === 0) return null;

  return (
    <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-amber-500/[0.04] border border-amber-500/20 backdrop-blur-md space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-bold text-white">
          Pending Journey Invitations ({pendingInvitations.length})
        </h3>
      </div>
      <p className="text-xs text-slate-300">
        You have been invited to collaborate on the following journeys. Accept to view itinerary details and split expenses.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {pendingInvitations.map((t) => (
          <div
            key={t._id}
            className="p-4 rounded-2xl bg-ink-900/90 border border-amber-500/30 flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Invitation Pending
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  Role: {t.currentUserRole || 'Editor'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">{t.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.destination} • {formatDate(t.startDate)}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <button
                type="button"
                disabled={respondingInviteId === t._id}
                onClick={() => onRespondInvite(t._id, 'accept')}
                className="flex-1 py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-ink-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-glow-teal disabled:opacity-50"
              >
                {respondingInviteId === t._id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Accept Invite</span>
              </button>

              <button
                type="button"
                disabled={respondingInviteId === t._id}
                onClick={() => onRespondInvite(t._id, 'decline')}
                className="py-2 px-3 rounded-xl bg-ink-950 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-bold border border-white/10 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Decline</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
