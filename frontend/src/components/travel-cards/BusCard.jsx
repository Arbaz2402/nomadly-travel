import React, { useState } from 'react';
import { Bus, Clock, Star, MapPin, ChevronDown, ChevronUp, ArrowRight, Sparkles } from 'lucide-react';
import { BusSeatMap } from '../booking/BusSeatMap';
import { formatCurrency, formatDuration } from '../../utils/formatters';

export const BusCard = ({ bus, onCheckoutWithSeats }) => {
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);

  const handleSeatToggle = (seat) => {
    if (selectedSeats.some((s) => s.seatNumber === seat.seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 6) {
        alert('You can select a maximum of 6 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat to proceed.');
      return;
    }
    onCheckoutWithSeats(bus, selectedSeats);
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover:border-coral-500/40 transition-all">
      {/* Main Bus Info Header */}
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ink-900 border border-white/10 flex items-center justify-center">
              <Bus className="w-5 h-5 text-coral-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base tracking-tight font-display">
                  {bus.operatorName}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold">
                  {bus.busType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Vehicle: {bus.busNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-ink-900 border border-white/10 text-amber-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{bus.rating || 4.6}</span>
            <span className="text-[10px] text-slate-400">({bus.reviewsCount || 340})</span>
          </div>
        </div>

        {/* Journey Row */}
        <div className="grid grid-cols-12 items-center gap-2 my-4">
          <div className="col-span-4 text-left">
            <p className="text-xl font-extrabold text-white font-display">{bus.departureTime}</p>
            <p className="text-xs font-bold text-coral-400 uppercase tracking-wider">{bus.originCity}</p>
            <p className="text-xs text-slate-400 truncate">{bus.boardingPoints?.[0]?.locationName || 'Main Station'}</p>
          </div>

          <div className="col-span-4 text-center px-2">
            <span className="text-[11px] font-medium text-slate-400 block mb-1 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(bus.durationMinutes)}
            </span>
            <div className="relative flex items-center justify-center">
              <div className="w-full h-[2px] bg-ink-700"></div>
              <div className="absolute w-2 h-2 rounded-full bg-coral-500"></div>
            </div>
            <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-widest mt-1 block">
              {bus.seats?.filter((s) => s.isAvailable && !s.isBooked).length || 24} Seats Left
            </span>
          </div>

          <div className="col-span-4 text-right">
            <p className="text-xl font-extrabold text-white font-display">{bus.arrivalTime}</p>
            <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">{bus.destinationCity}</p>
            <p className="text-xs text-slate-400 truncate">{bus.droppingPoints?.[0]?.locationName || 'Drop Terminal'}</p>
          </div>
        </div>

        {/* Amenities Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-3 border-t border-white/5">
          {bus.amenities?.map((amenity) => (
            <span key={amenity} className="text-[10px] px-2 py-0.5 rounded-md bg-ink-900 border border-white/5 text-slate-300">
              {amenity}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-ink-900/60 p-4 border-t border-white/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Starts from</span>
          <span className="text-xl font-extrabold text-white tracking-tight font-display">
            {formatCurrency(bus.baseFare)}
          </span>
          <span className="text-[10px] text-slate-400 ml-1">/ seat</span>
        </div>

        <button
          onClick={() => setShowSeatMap(!showSeatMap)}
          className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs tracking-wide shadow-glow transition-all flex items-center gap-2"
        >
          <span>{showSeatMap ? 'Hide Seat Map' : 'Select Seats'}</span>
          {showSeatMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Accordion Seat Map */}
      {showSeatMap && (
        <div className="p-5 border-t border-white/10 bg-ink-950/95 animate-fadeIn">
          <BusSeatMap
            seats={bus.seats || []}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatToggle}
          />

          {selectedSeats.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleProceed}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white font-bold text-xs tracking-wide shadow-glow transition-all flex items-center gap-2"
              >
                <span>Continue Booking ({selectedSeats.length} Seats)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
