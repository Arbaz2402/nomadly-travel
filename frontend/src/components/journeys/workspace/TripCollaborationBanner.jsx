import React from 'react';
import { Mail, Check } from 'lucide-react';

export const TripCollaborationBanner = ({
  userRole,
  respondingInvite,
  onRespondInvitation,
}) => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-coral-500/20 via-teal-500/15 to-ink-900 border border-coral-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-coral-500/20 border border-coral-500/30 flex items-center justify-center text-coral-400">
          <Mail className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            Collaboration Invitation Request
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-coral-500/20 text-coral-300 border border-coral-500/30">
              {userRole?.toUpperCase()}
            </span>
          </h4>
          <p className="text-xs text-slate-300">
            You've been invited by the journey owner to collaborate as an{' '}
            <strong className="text-teal-400 capitalize">{userRole}</strong>. Accept this
            request to participate in planning and editing.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <button
          onClick={() => onRespondInvitation('decline')}
          disabled={respondingInvite}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
        >
          Decline
        </button>
        <button
          onClick={() => onRespondInvitation('accept')}
          disabled={respondingInvite}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 hover:from-coral-600 text-white text-xs font-bold shadow-glow flex items-center gap-1.5 transition-all"
        >
          <Check className="w-4 h-4" />
          {respondingInvite ? 'Joining...' : 'Accept Invitation'}
        </button>
      </div>
    </div>
  );
};
