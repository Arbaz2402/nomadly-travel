import React, { useState } from 'react';
import { Star, MapPin, Coffee, ShieldCheck, Heart, ArrowRight, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const HotelCard = ({ hotel, onSelectRoom, isSaved, onToggleSave }) => {
  const lowestRoom = hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms[0] : null;
  const startingRate = lowestRoom ? lowestRoom.pricePerNight : 5000;

  // Build unique photo list from featured photo, gallery, and room photos
  const rawPhotos = [
    hotel.featuredPhoto,
    ...(hotel.gallery || []),
    ...(hotel.rooms?.flatMap((r) => r.photos || []) || []),
  ].filter(Boolean);
  const photos = Array.from(new Set(rawPhotos));
  if (photos.length === 0) {
    photos.push('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80');
  }

  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setCurrentPhotoIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover:border-coral-500/40 transition-all flex flex-col justify-between group">
      <div>
        {/* Interactive Photo Carousel Header */}
        <div className="relative h-56 w-full overflow-hidden bg-ink-950">
          <img
            src={photos[currentPhotoIdx]}
            alt={`${hotel.name} view ${currentPhotoIdx + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
            onClick={() => onSelectRoom && onSelectRoom(hotel)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent pointer-events-none"></div>

          {/* Prev / Next Photo Navigation Arrows (Visible when multiple photos exist) */}
          {photos.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handlePrevPhoto}
                aria-label="Previous photo"
                className="w-7 h-7 rounded-full bg-ink-950/80 backdrop-blur-md text-white hover:bg-coral-500 flex items-center justify-center transition-colors shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                aria-label="Next photo"
                className="w-7 h-7 rounded-full bg-ink-950/80 backdrop-blur-md text-white hover:bg-coral-500 flex items-center justify-center transition-colors shadow-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Photo Count Pill */}
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-ink-950/80 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[10px] font-bold text-slate-200">
              <Camera className="w-3 h-3 text-coral-400" />
              <span>{currentPhotoIdx + 1}/{photos.length}</span>
            </div>
          )}

          {/* Star Rating Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-ink-950/80 backdrop-blur-md border border-white/10 flex items-center gap-1 text-amber-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{hotel.starRating} Star</span>
          </div>

          {/* Save to Wishlist Button */}
          <button
            onClick={() => onToggleSave && onToggleSave(hotel)}
            type="button"
            aria-label="Save hotel"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-ink-950/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:text-coral-500 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-coral-500 text-coral-500' : ''}`} />
          </button>

          {/* Guest Rating Badge */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-teal-500 text-ink-950 font-bold text-xs flex items-center gap-1 shadow-lg">
            <span>{hotel.guestRating}</span>
            <span className="text-[10px] font-medium text-ink-900">/ 10</span>
          </div>

          {/* Photo Dot Indicators */}
          {photos.length > 1 && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
              {photos.slice(0, 6).map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentPhotoIdx ? 'w-3 bg-coral-500' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <MapPin className="w-3.5 h-3.5 text-coral-500 flex-shrink-0" />
            <span className="truncate">{hotel.location?.neighborhood || hotel.location?.city}</span>
          </div>

          <h3
            onClick={() => onSelectRoom && onSelectRoom(hotel)}
            className="text-base font-bold text-white tracking-tight line-clamp-1 mb-2 font-display group-hover:text-coral-400 transition-colors cursor-pointer"
          >
            {hotel.name}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {hotel.overview}
          </p>

          {/* Amenities tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hotel.amenities?.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-ink-900/90 text-slate-300 border border-white/5 font-medium"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities?.length > 3 && (
              <span className="text-[10px] px-2 py-1 rounded-lg bg-ink-900 text-slate-400 font-medium">
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="p-5 pt-0 border-t border-white/5 mt-auto">
        <div className="pt-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Starts From</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-white tracking-tight font-display">
                {formatCurrency(startingRate)}
              </span>
              <span className="text-[11px] text-slate-400 font-normal">/ night</span>
            </div>
            <span className="text-[10px] text-teal-400 font-medium block">+ taxes & fees</span>
          </div>

          <button
            onClick={() => onSelectRoom && onSelectRoom(hotel)}
            type="button"
            className="px-4 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs tracking-wide shadow-glow transition-all flex items-center gap-1.5"
          >
            <span>View Rooms & Photos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
