import React from 'react';
import { Plane, Clock, Luggage, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { formatCurrency, formatDuration, formatTime } from '../../utils/formatters';

export const FlightCard = ({ flight, onBook, isSaved, onToggleSave }) => {
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
        <div className="grid grid-cols-12 items-center gap-2 my-2">
          {/* Origin */}
          <div className="col-span-4 text-left">
            <p className="text-xl font-extrabold text-white font-display">
              {formatTime(leg.departureTime)}
            </p>
            <p className="text-xs font-bold text-coral-400 uppercase tracking-wider">{flight.originCode}</p>
            <p className="text-xs text-slate-400 truncate">{flight.originCity}</p>
          </div>

          {/* Route Duration & Stops */}
          <div className="col-span-4 text-center px-2">
            <span className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(flight.totalDurationMinutes)}
            </span>
            <div className="relative flex items-center justify-center">
              <div className="w-full h-[2px] bg-ink-700"></div>
              <div className="absolute w-2 h-2 rounded-full bg-coral-500"></div>
            </div>
            <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-widest mt-1 block">
              {flight.stops === 0 ? 'Non-Stop' : `${flight.stops} Stop(s)`}
            </span>
          </div>

          {/* Destination */}
          <div className="col-span-4 text-right">
            <p className="text-xl font-extrabold text-white font-display">
              {formatTime(leg.arrivalTime)}
            </p>
            <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">{flight.destinationCode}</p>
            <p className="text-xs text-slate-400 truncate">{flight.destinationCity}</p>
          </div>
        </div>

        {/* Baggage allowance */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Luggage className="w-3.5 h-3.5 text-slate-500" />
            <span>Cabin: {flight.baggage?.cabin || '7 kg'}</span>
          </div>
          <span>•</span>
          <span>Check-in: {flight.baggage?.checkIn || '15 kg'}</span>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Fare</span>
          <p className="text-xl font-extrabold text-white tracking-tight font-display">
            {formatCurrency(flight.pricing?.totalAmount, flight.pricing?.currency)}
          </p>
        </div>

        <button
          onClick={() => onBook && onBook(flight)}
          className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs tracking-wide shadow-glow transition-all flex items-center gap-1.5"
        >
          <span>Select Offer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
