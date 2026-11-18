import React from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Plus } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AddToTripModal = ({
  isOpen,
  onClose,
  bookingReference,
  userTrips,
  loadingTrips,
  attachingTripId,
  onAttachToTrip,
  onCreateNewTrip,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-ink-950/85 backdrop-blur-md p-4 sm:p-6 flex min-h-screen items-center justify-center animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-ink-900 border border-white/10 shadow-2xl p-6 sm:p-8 space-y-4 my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-coral-400 tracking-wider">
              Independent Journey Hub
            </span>
            <h3 className="text-lg font-bold text-white font-display">Add Booking to Journey</h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Link this confirmed booking (
          <span className="font-mono text-teal-400">{bookingReference}</span>) into one of your
          existing trip plans, or create a brand new journey!
        </p>

        {/* List of existing journeys */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {loadingTrips ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-coral-500" />
              <span className="text-xs">Loading your journeys...</span>
            </div>
          ) : userTrips.length === 0 ? (
            <div className="p-4 rounded-2xl bg-ink-950 border border-white/5 text-center text-xs text-slate-400">
              No active journeys found yet.
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
                  onClick={() => onAttachToTrip(t._id)}
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

        {/* Option to create a new trip */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-slate-400">Want to start a fresh itinerary?</span>
          <button
            onClick={onCreateNewTrip}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
          >
            <Plus className="w-3.5 h-3.5" />
            Create New Journey
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
