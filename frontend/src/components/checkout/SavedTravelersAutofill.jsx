import React from 'react';
import { Sparkles, User } from 'lucide-react';

export const SavedTravelersAutofill = ({ savedTravelers = [], onAutofill }) => {
  if (!savedTravelers || savedTravelers.length === 0) return null;

  return (
    <div className="glass-panel rounded-3xl p-5 border border-white/10 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-coral-500" />
          Quick Autofill from Saved Travelers
        </p>
        <p className="text-[11px] text-slate-400">Click to instantly populate lead passenger details</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {savedTravelers.map((saved) => (
          <button
            key={saved._id || saved.firstName}
            type="button"
            onClick={() => onAutofill(saved)}
            className="px-3 py-1.5 rounded-xl bg-ink-900 hover:bg-coral-500/10 border border-white/10 hover:border-coral-500/40 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-coral-400" />
            <span>
              {saved.firstName} {saved.lastName}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
