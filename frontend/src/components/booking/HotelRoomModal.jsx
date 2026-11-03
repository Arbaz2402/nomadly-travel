import React from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Bed, Maximize2, ShieldCheck, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const HotelRoomModal = ({ hotel, isOpen, onClose, onSelectRoom }) => {
  if (!isOpen || !hotel) return null;

  const content = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-ink-950/85 backdrop-blur-md p-4 sm:p-6 flex min-h-screen items-center justify-center animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-xl bg-ink-900 border border-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 pr-10">
          <span className="text-[10px] uppercase font-bold text-coral-400 tracking-wider">
            {hotel.propertyType} • {hotel.starRating} Star
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight font-display mt-0.5">
            {hotel.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1">{hotel.location?.address}, {hotel.location?.city}</p>
        </div>

        {/* Room Categories */}
        <div className="space-y-4">
          {hotel.rooms?.map((room) => (
            <div
              key={room.roomId}
              className="bg-ink-900/80 border border-white/5 rounded-2xl p-5 hover:border-coral-500/40 transition-all flex flex-col md:flex-row gap-5 justify-between items-start md:items-center"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white text-base font-display">{room.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold">
                    {room.mealPlan.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3">{room.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Bed className="w-3.5 h-3.5 text-coral-500" />
                    <span>{room.bedConfiguration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>{room.sizeSqFt} sq. ft.</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-teal-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Free cancellation available</span>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="text-right w-full md:w-auto flex md:flex-col justify-between items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Rate per night</span>
                  <p className="text-xl font-extrabold text-white font-display">
                    {formatCurrency(room.pricePerNight)}
                  </p>
                  <span className="text-[10px] text-slate-400 block">+ ₹{room.taxesPerNight} taxes</span>
                </div>

                <button
                  onClick={() => onSelectRoom(hotel, room)}
                  className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs tracking-wide shadow-glow transition-all flex items-center gap-1.5"
                >
                  <span>Reserve Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
