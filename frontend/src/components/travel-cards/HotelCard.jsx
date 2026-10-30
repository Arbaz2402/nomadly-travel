import React from 'react';
import { Star, MapPin, Coffee, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const HotelCard = ({ hotel, onSelectRoom, isSaved, onToggleSave }) => {
  const lowestRoom = hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms[0] : null;
  const startingRate = lowestRoom ? lowestRoom.pricePerNight : 5000;

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover:border-coral-500/40 transition-all flex flex-col justify-between group">
      <div>
        {/* Featured Image */}
        <div className="relative h-52 w-full overflow-hidden">
          <img
            src={hotel.featuredPhoto}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent"></div>

          {/* Star Rating Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-ink-950/80 backdrop-blur-md border border-white/10 flex items-center gap-1 text-amber-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{hotel.starRating} Star</span>
          </div>

          {/* Save to Wishlist Button */}
          <button
            onClick={() => onToggleSave && onToggleSave(hotel)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-ink-950/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:text-coral-500 transition-colors"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-coral-500 text-coral-500' : ''}`} />
          </button>

          {/* Guest Rating Badge */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-xl bg-teal-500 text-ink-950 font-bold text-xs flex items-center gap-1 shadow-lg">
            <span>{hotel.guestRating}</span>
            <span className="text-[10px] font-medium text-ink-900">/ 10</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <MapPin className="w-3.5 h-3.5 text-coral-500 flex-shrink-0" />
            <span className="truncate">{hotel.location?.neighborhood || hotel.location?.city}</span>
          </div>

          <h3 className="text-base font-bold text-white tracking-tight line-clamp-1 mb-2 font-display group-hover:text-coral-400 transition-colors">
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
            className="px-4 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs tracking-wide shadow-glow transition-all flex items-center gap-1.5"
          >
            <span>Select Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
