import React, { useState } from 'react';
import { Armchair, Bed, ShieldAlert, Check, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BusSeatMap = ({
  seats = [],
  selectedSeats = [],
  onSeatSelect,
  maxSeats = 6,
}) => {
  const [activeDeck, setActiveDeck] = useState('lower');

  const lowerSeats = seats.filter((s) => s.deck === 'lower');
  const upperSeats = seats.filter((s) => s.deck === 'upper');

  const displayedSeats = activeDeck === 'lower' ? lowerSeats : upperSeats;

  // Group by rows (1 to 6)
  const rows = [1, 2, 3, 4, 5, 6];

  const handleSeatClick = (seat) => {
    if (!seat.isAvailable || seat.isBooked) return;
    onSeatSelect(seat);
  };

  const getSeatStatus = (seat) => {
    if (selectedSeats.some((s) => s.seatNumber === seat.seatNumber)) return 'selected';
    if (seat.isBooked) return 'booked';
    if (!seat.isAvailable) return 'unavailable';
    return 'available';
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="bg-ink-950/90 border border-white/10 rounded-3xl p-5 shadow-2xl">
      {/* Deck Selector Tabs */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight font-display">Interactive Seat Map</h4>
          <p className="text-xs text-slate-400">Select up to {maxSeats} berths or seats</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-ink-900 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveDeck('lower')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeDeck === 'lower' ? 'bg-coral-500 text-white shadow-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lower Deck ({lowerSeats.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveDeck('upper')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeDeck === 'upper' ? 'bg-coral-500 text-white shadow-glow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upper Deck ({upperSeats.length})
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 py-2 px-3 bg-ink-900/50 rounded-xl mb-6 text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md border border-slate-500 bg-ink-800"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-coral-500 shadow-glow"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-slate-700/60 opacity-60"></div>
          <span>Booked</span>
        </div>
      </div>

      {/* Bus Grid Layout */}
      <div className="max-w-md mx-auto p-4 rounded-2xl border border-white/10 bg-ink-900/60 relative">
        {/* Driver Cabin Indicator */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          <span className="px-2 py-0.5 rounded bg-ink-800 text-slate-400">Front (Driver)</span>
          <span className="px-2 py-0.5 rounded bg-ink-800 text-coral-400">{activeDeck.toUpperCase()} DECK</span>
        </div>

        {/* Rows */}
        <div className="space-y-3">
          {rows.map((rowNum) => {
            const rowSeats = displayedSeats.filter((s) => s.row === rowNum);
            const col1 = rowSeats.find((s) => s.column === 1);
            const col2 = rowSeats.find((s) => s.column === 2);
            const col3 = rowSeats.find((s) => s.column === 3);

            return (
              <div key={rowNum} className="flex items-center justify-between gap-4">
                {/* Column 1 (Single Berth / Seat) */}
                <div className="w-16">
                  {col1 && renderSeatButton(col1, getSeatStatus(col1), handleSeatClick)}
                </div>

                {/* Aisle Walkway */}
                <div className="flex-1 text-center text-[10px] text-slate-600 font-mono tracking-widest">
                  ── AISLE ──
                </div>

                {/* Column 2 & 3 (Double Berth / Seater) */}
                <div className="flex items-center gap-2">
                  <div className="w-16">
                    {col2 && renderSeatButton(col2, getSeatStatus(col2), handleSeatClick)}
                  </div>
                  <div className="w-16">
                    {col3 && renderSeatButton(col3, getSeatStatus(col3), handleSeatClick)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Selection Summary */}
      <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Selected Seats ({selectedSeats.length})
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedSeats.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No seats selected yet</span>
            ) : (
              selectedSeats.map((s) => (
                <span
                  key={s.seatNumber}
                  className="px-2 py-0.5 rounded-md bg-coral-500/20 text-coral-400 border border-coral-500/30 text-xs font-bold"
                >
                  {s.seatNumber} ({formatCurrency(s.price)})
                </span>
              ))
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Fare</span>
          <span className="text-xl font-extrabold text-white font-display">
            {formatCurrency(totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );

  function renderSeatButton(seat, status, onClick) {
    const isSleeper = seat.seatType === 'sleeper';
    const Icon = isSleeper ? Bed : Armchair;

    let buttonClass = 'border border-slate-600 bg-ink-800 text-slate-200 hover:border-coral-500 cursor-pointer';

    if (status === 'selected') {
      buttonClass = 'bg-coral-500 border-coral-400 text-white shadow-glow cursor-pointer scale-105';
    } else if (status === 'booked' || status === 'unavailable') {
      buttonClass = 'bg-ink-800/40 border-white/5 text-slate-600 cursor-not-allowed opacity-50';
    }

    return (
      <button
        type="button"
        disabled={status === 'booked' || status === 'unavailable'}
        onClick={() => onClick(seat)}
        className={`w-full py-2.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all ${buttonClass}`}
        title={`${seat.seatNumber} - ${seat.seatType} (${formatCurrency(seat.price)})`}
      >
        <Icon className="w-4 h-4 mb-1" />
        <span className="text-[11px] font-bold font-mono leading-none">{seat.seatNumber}</span>
      </button>
    );
  }
};
