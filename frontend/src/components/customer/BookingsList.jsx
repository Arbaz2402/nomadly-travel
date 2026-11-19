import React from 'react';
import {
  Compass,
  AlertCircle,
  Plane,
  Building2,
  Train,
  Bus,
  Map,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const getCategoryIcon = (cat) => {
  if (cat === 'flight') return Plane;
  if (cat === 'hotel') return Building2;
  if (cat === 'train') return Train;
  return Bus;
};

export const BookingsList = ({
  bookings = [],
  loadingBookings = false,
  fetchError = null,
  onRefresh,
  onOpenTripPicker,
  onCancelBooking,
}) => {
  if (loadingBookings) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="glass-card rounded-2xl p-6 h-36 animate-pulse bg-ink-900/40"></div>
        ))}
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center border border-coral-500/20 bg-coral-500/[0.02]">
        <AlertCircle className="w-12 h-12 text-coral-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Could not retrieve reservations</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
          {fetchError}. The server may be warming up.
        </p>
        <button
          onClick={onRefresh}
          className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold inline-flex items-center gap-2 shadow-glow transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
        <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">No reservations booked yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
          Explore flights, hotels, express trains, or sleeper buses and complete your first reservation!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="/"
            className="px-5 py-2.5 rounded-xl bg-coral-500 text-white text-xs font-bold inline-block shadow-glow"
          >
            Start Exploring
          </a>
          <button
            onClick={onRefresh}
            className="px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-slate-300 text-xs font-semibold border border-white/10 inline-flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const Icon = getCategoryIcon(booking.travelCategory);
        const isCancelled = booking.bookingStatus === 'cancelled';

        return (
          <div
            key={booking._id}
            className="glass-card rounded-2xl p-6 border border-white/10 hover:border-coral-500/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-ink-900 border border-white/10 flex items-center justify-center text-coral-500 flex-shrink-0">
                <Icon className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-coral-400 text-xs">
                    {booking.bookingReference}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      isCancelled
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    }`}
                  >
                    {booking.bookingStatus}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white font-display">
                  {booking.providerName}
                </h3>
                {booking.providerReference && (
                  <span className="font-mono text-[11px] text-teal-400 font-semibold block mt-0.5">
                    PNR: {booking.providerReference}
                  </span>
                )}

                <p className="text-xs text-slate-400 mt-1">
                  Booked on: {formatDate(booking.createdAt)} • Travelers: {booking.passengers?.length || 1}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-end w-full md:w-auto gap-3 sm:gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
              <div className="text-left md:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Total Amount
                </span>
                <span className="text-xl font-extrabold text-white font-display">
                  {formatCurrency(booking.pricing?.totalPayable, booking.pricing?.currency)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {!isCancelled && (
                  <button
                    onClick={() => onOpenTripPicker(booking)}
                    className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-xl bg-ink-900 hover:bg-ink-800 text-teal-400 border border-teal-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Map className="w-3.5 h-3.5 shrink-0" />
                    <span>Add to Journey</span>
                  </button>
                )}

                {!isCancelled && (
                  <button
                    onClick={() => onCancelBooking(booking._id)}
                    className="flex-1 sm:flex-none justify-center px-4 py-2 rounded-xl bg-ink-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 text-xs font-bold transition-all"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
