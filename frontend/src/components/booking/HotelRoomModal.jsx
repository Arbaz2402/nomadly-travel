import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Check,
  Bed,
  Maximize2,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Camera,
  Star,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const HotelRoomModal = ({ hotel, isOpen, onClose, onSelectRoom }) => {
  if (!isOpen || !hotel) return null;

  // Aggregate all unique photos from featured photo, gallery, and room photos
  const rawPhotos = [
    hotel.featuredPhoto,
    ...(hotel.gallery || []),
    ...(hotel.rooms?.flatMap((r) => r.photos || []) || []),
  ].filter(Boolean);
  const photos = Array.from(new Set(rawPhotos));
  if (photos.length === 0) {
    photos.push('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80');
  }

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const content = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-ink-950/85 backdrop-blur-md p-4 sm:p-6 flex min-h-screen items-center justify-center animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel max-w-4xl w-full max-h-[92vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl p-5 sm:p-8 relative my-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-xl bg-ink-900 border border-white/10 text-slate-400 hover:text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pr-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-coral-500/10 text-coral-400 border border-coral-500/20 text-[10px] font-bold uppercase tracking-wider">
              {hotel.propertyType || 'Boutique Hotel'}
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{hotel.starRating} Star Property</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            {hotel.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-coral-400 shrink-0" />
            <span>{hotel.location?.address}, {hotel.location?.city}</span>
          </p>
        </div>

        {/* Interactive Resort & Property Photo Showcase */}
        <div className="space-y-3">
          {/* Main Hero Photo Viewer */}
          <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden bg-ink-950 border border-white/10 group shadow-inner">
            <img
              src={photos[activePhotoIdx]}
              alt={`${hotel.name} photo ${activePhotoIdx + 1}`}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent pointer-events-none"></div>

            {/* Prev / Next Navigation Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-ink-950/80 backdrop-blur-md text-white hover:bg-coral-500 flex items-center justify-center transition-colors shadow-lg border border-white/10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-ink-950/80 backdrop-blur-md text-white hover:bg-coral-500 flex items-center justify-center transition-colors shadow-lg border border-white/10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo Counter Pill */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-ink-950/85 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-xs font-bold text-white shadow-lg">
              <Camera className="w-3.5 h-3.5 text-coral-400" />
              <span>Photo {activePhotoIdx + 1} of {photos.length}</span>
            </div>

            {/* Overview / Caption Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
              <div className="max-w-md">
                <span className="text-[11px] text-teal-400 font-semibold block">Verified Property Showcase</span>
                <p className="text-xs text-slate-200 line-clamp-1 drop-shadow-md">
                  {hotel.overview}
                </p>
              </div>
            </div>
          </div>

          {/* Thumbnail Gallery Strip */}
          {photos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
              {photos.map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activePhotoIdx === idx
                      ? 'border-coral-500 scale-105 shadow-glow ring-2 ring-coral-500/30'
                      : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Property Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="p-4 rounded-2xl bg-ink-900/60 border border-white/5 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-teal-400" />
              Property Highlights & Amenities
            </span>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="text-xs px-3 py-1 rounded-xl bg-ink-950 border border-white/10 text-slate-200 font-medium flex items-center gap-1.5"
                >
                  <Check className="w-3 h-3 text-teal-400" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Room Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-display">
              Select Your Room Category
            </h3>
            <span className="text-xs text-slate-400">
              {hotel.rooms?.length || 0} Room Options Available
            </span>
          </div>

          {hotel.rooms?.map((room) => {
            const roomPhoto = room.photos?.[0] || photos[0];
            return (
              <div
                key={room.roomId}
                className="bg-ink-900/80 border border-white/5 rounded-2xl p-4 sm:p-5 hover:border-coral-500/40 transition-all flex flex-col md:flex-row gap-4 sm:gap-5 justify-between items-start md:items-center"
              >
                {/* Room Photo Thumbnail */}
                <div className="w-full md:w-44 h-32 md:h-28 rounded-xl overflow-hidden shrink-0 relative bg-ink-950 border border-white/10">
                  <img
                    src={roomPhoto}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-ink-950/80 backdrop-blur-md text-[9px] font-bold text-white">
                    Room View
                  </span>
                </div>

                {/* Room Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-white text-base font-display">{room.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] font-bold uppercase tracking-wider">
                      {room.mealPlan ? room.mealPlan.replace('_', ' ') : 'Breakfast Included'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{room.description}</p>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-coral-400" />
                      <span>{room.bedConfiguration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-teal-400" />
                      <span>{room.sizeSqFt} sq. ft.</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-teal-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Free Cancellation Available</span>
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="text-right w-full md:w-auto flex md:flex-col justify-between items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-white/5 shrink-0">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Rate per night</span>
                    <p className="text-xl font-extrabold text-white font-display">
                      {formatCurrency(room.pricePerNight)}
                    </p>
                    <span className="text-[10px] text-slate-400 block">+ ₹{room.taxesPerNight || 500} taxes</span>
                  </div>

                  <button
                    onClick={() => onSelectRoom(hotel, room)}
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs tracking-wide shadow-glow transition-all flex items-center gap-1.5"
                  >
                    <span>Reserve Room</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};
