import React, { useState, useEffect } from 'react';
import {
  X,
  Plane,
  Building2,
  Train,
  Bus,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const AttachBookingModal = ({ trip, isOpen, onClose, onAttached }) => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attachingId, setAttachingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserBookings();
    }
  }, [isOpen]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getMyBookings();
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (err) {
      showToast('Could not load your reservations: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAttach = async (booking) => {
    try {
      setAttachingId(booking._id);
      const res = await ApiClient.attachBookingToTrip(trip._id, {
        bookingId: booking._id,
      });

      if (res.success) {
        showToast(`Attached booking ${booking.bookingReference} to "${trip.title}"!`, 'success');
        if (onAttached) onAttached();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to attach booking', 'error');
    } finally {
      setAttachingId(null);
    }
  };

  if (!isOpen) return null;

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'flight':
        return Plane;
      case 'hotel':
        return Building2;
      case 'train':
        return Train;
      case 'bus':
        return Bus;
      default:
        return Calendar;
    }
  };

  const alreadyAttachedIds = (trip.bookings || []).map((b) => (typeof b === 'object' ? b._id : b));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl bg-ink-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-ink-900 to-ink-850">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                Seamless Integration
              </span>
            </div>
            <h3 className="text-xl font-bold text-white font-display mt-1">
              Attach NOMADLY Reservation to Journey
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select one of your confirmed bookings to automatically import into{' '}
              <span className="text-coral-400 font-semibold">{trip.title}</span>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bookings List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 text-coral-500 animate-spin" />
              <p className="text-xs">Fetching your confirmed bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-200">No NOMADLY bookings found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                You don't need NOMADLY bookings to plan this journey! You can also add external reservations (Booking.com, MakeMyTrip, IRCTC) or manual activities directly from the Itinerary tab.
              </p>
            </div>
          ) : (
            bookings.map((booking) => {
              const Icon = getCategoryIcon(booking.travelCategory);
              const isAlreadyAttached = alreadyAttachedIds.includes(booking._id);
              const snap = booking.itinerarySnapshot || {};
              const price = booking.totalPayable || booking.priceBreakdown?.totalPayable || 0;

              return (
                <div
                  key={booking._id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isAlreadyAttached
                      ? 'bg-ink-950/60 border-white/5 opacity-70'
                      : 'bg-ink-850/80 hover:bg-ink-850 border-white/10 hover:border-coral-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-ink-900 border border-white/10 flex items-center justify-center text-coral-400 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">
                          {booking.bookingReference}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5">
                          {booking.travelCategory}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 mt-0.5">
                        {snap.name || snap.flightNumber || snap.trainName || snap.operatorName || 'Reservation'}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                        <span>Booked on {formatDate(booking.createdAt)}</span>
                        <span>•</span>
                        <span className="text-teal-400 font-semibold">{formatCurrency(price, 'INR')}</span>
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isAlreadyAttached ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        Attached
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAttach(booking)}
                        disabled={attachingId === booking._id}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white text-xs font-bold shadow-glow transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {attachingId === booking._id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Import to Journey
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-ink-950/80 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Preserves original booking & avoids duplicate entries.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-ink-800 hover:bg-ink-700 text-slate-200 font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
