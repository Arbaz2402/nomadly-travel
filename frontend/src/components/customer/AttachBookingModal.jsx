import React from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AttachBookingModal = ({
  booking,
  userTrips,
  loadingTrips,
  attachingTripId,
  onClose,
  onAttach,
}) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-ink-900 border border-white/10 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-coral-400 tracking-wider">
              Independent Journey Hub
            </span>
            <h3 className="text-lg font-bold text-white font-display">Add Booking to Journey</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Select one of your journeys to add reservation{' '}
          <span className="font-mono text-teal-400">{booking.bookingReference}</span>:
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {loadingTrips ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-coral-500" />
              <span className="text-xs">Loading your journeys...</span>
            </div>
          ) : userTrips.length === 0 ? (
            <div className="p-4 rounded-2xl bg-ink-950 border border-white/5 text-center text-xs text-slate-400">
              No active journeys found. You can create one right now!
            </div>
          ) : (
            userTrips.map((t) => (
              <div
                key={t._id}
                className="p-3 rounded-2xl bg-ink-950/80 hover:bg-ink-850 border border-white/5 hover:border-coral-500/30 flex items-center justify-between gap-3 transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{t.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    {t.destination} • {formatDate(t.startDate)}
                  </p>
                </div>

                <button
                  onClick={() => onAttach(t._id)}
                  disabled={attachingTripId === t._id}
                  className="px-3.5 py-1.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-glow disabled:opacity-50 flex items-center gap-1 shrink-0"
                >
                  {attachingTripId === t._id ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Linking...
                    </>
                  ) : (
                    'Add to Trip'
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-slate-400">Or plan a new trip</span>
          <a
            href="/journeys/new"
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
          >
            <Plus className="w-3.5 h-3.5" />
            Create New Journey
          </a>
        </div>
      </div>
    </div>
  );
};
