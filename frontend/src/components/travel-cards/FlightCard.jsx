import React from 'react';
import { Plane, Clock, Luggage, ArrowRight, ShieldCheck, Heart, ExternalLink } from 'lucide-react';
import { formatCurrency, formatDuration, formatTime } from '../../utils/formatters';

export const FlightCard = ({ flight, onBook, onPartnerBook, isSaved, onToggleSave }) => {
  const leg = flight.legs[0] || {};

  return (
    <div className="glass-card rounded-2xl p-5 hover:border-coral-500/40 transition-all group flex flex-col justify-between">
      <div>
        {/* Header: Airline info & Fare tags */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink-900 border border-white/10 flex items-center justify-center p-2">
              <Plane className="w-5 h-5 text-coral-500 transform -rotate-45" />
            </div>
            <div>
              <p className="font-bold text-white text-sm tracking-tight">{leg.airline || flight.provider}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-medium text-slate-300">{leg.flightNumber}</span>
                <span>•</span>
                <span className="capitalize">{flight.cabinClass.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {flight.fareRules?.isRefundable && (
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Refundable
              </span>
            )}
            <button
              onClick={() => onToggleSave && onToggleSave(flight)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-coral-500 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-coral-500 text-coral-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="grid grid-cols-12 items-center gap-1.5 sm:gap-2 my-2">
          {/* Origin */}
          <div className="col-span-4 text-left min-w-0">
            <p className="text-lg sm:text-xl font-extrabold text-white font-display truncate">
              {formatTime(leg.departureTime)}
            </p>
            <p className="text-xs font-bold text-coral-400 uppercase tracking-wider truncate">{flight.originCode}</p>
            <p className="text-xs text-slate-400 truncate">{flight.originCity}</p>
          </div>

          {/* Route Duration & Stops */}
          <div className="col-span-4 text-center px-1 sm:px-2 min-w-0">
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block mb-1 flex items-center justify-center gap-1 truncate">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{formatDuration(flight.totalDurationMinutes)}</span>
            </span>
            <div className="relative flex items-center justify-center">
              <div className="w-full h-[2px] bg-ink-700"></div>
              <div className="absolute w-2 h-2 rounded-full bg-coral-500"></div>
            </div>
            <span className="text-[9px] sm:text-[10px] font-semibold text-teal-400 uppercase tracking-widest mt-1 block truncate">
              {flight.stops === 0 ? 'Non-Stop' : `${flight.stops} Stop(s)`}
            </span>
          </div>

          {/* Destination */}
          <div className="col-span-4 text-right min-w-0">
            <p className="text-lg sm:text-xl font-extrabold text-white font-display truncate">
              {formatTime(leg.arrivalTime)}
            </p>
            <p className="text-xs font-bold text-teal-400 uppercase tracking-wider truncate">{flight.destinationCode}</p>
            <p className="text-xs text-slate-400 truncate">{flight.destinationCity}</p>
          </div>
        </div>

        {/* Baggage allowance */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Luggage className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Cabin: {flight.baggage?.cabin || '7 kg'}</span>
          </div>
          <span>•</span>
          <span>Check-in: {flight.baggage?.checkIn || '15 kg'}</span>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Fare</span>
          <p className="text-lg sm:text-xl font-extrabold text-white tracking-tight font-display truncate">
            {formatCurrency(flight.pricing?.totalAmount, flight.pricing?.currency)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onPartnerBook && (
            <button
              onClick={() => onPartnerBook(flight)}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-glow transition-all flex items-center gap-1.5 shrink-0 border border-white/10"
              title="Book directly on MakeMyTrip without filling any passenger forms"
            >
              <span>Book on MMT</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}

          <button
            onClick={() => onBook && onBook(flight)}
            className="px-3 sm:px-3.5 py-2 rounded-xl bg-ink-800 hover:bg-ink-700 text-slate-200 border border-white/10 font-semibold text-xs sm:text-sm transition-all flex items-center gap-1 shrink-0"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
