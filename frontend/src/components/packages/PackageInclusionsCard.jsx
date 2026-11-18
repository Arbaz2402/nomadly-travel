import React from 'react';
import { Plane, Building2, Luggage, Award, MapPin } from 'lucide-react';

export const PackageInclusionsCard = ({ pkg }) => {
  if (!pkg) return null;

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
      <h2 className="text-xl font-bold text-white font-display">
        Included Travel & Accommodations
      </h2>

      {/* Flight Card */}
      <div className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral-500/10 text-coral-400 flex items-center justify-center shrink-0">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-coral-400 tracking-wider">
                Return Economy Flights
              </span>
              <h4 className="text-sm font-bold text-white">
                {pkg.flight?.airline || 'Air India'} • Flight {pkg.flight?.flightNumber || 'AI-842'}
              </h4>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold">
            Roundtrip Included
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Departure Flight</span>
            <span className="font-bold text-white mt-0.5 block">
              {pkg.originCity} ({pkg.originAirportCode}) ➔ {pkg.destinationCity}
            </span>
            <span className="text-slate-400 text-[11px] mt-0.5 block">
              Departs {pkg.flight?.departureTime || '08:30 AM'} • {pkg.flight?.durationMinutes || 135} mins
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Return Flight</span>
            <span className="font-bold text-white mt-0.5 block">
              {pkg.destinationCity} ➔ {pkg.originCity} ({pkg.originAirportCode})
            </span>
            <span className="text-slate-400 text-[11px] mt-0.5 block">
              Flexible evening return flight
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Baggage Allowance</span>
            <span className="font-bold text-teal-400 mt-0.5 flex items-center gap-1.5">
              <Luggage className="w-3.5 h-3.5" />
              {pkg.flight?.baggageAllowance || '15 kg Check-in + 7 kg Cabin'}
            </span>
          </div>
        </div>
      </div>

      {/* Resort Card */}
      <div className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                5★ Luxury Accommodation ({pkg.nights} Nights)
              </span>
              <h4 className="text-sm font-bold text-white">
                {pkg.hotel?.name}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <span>★ {pkg.hotel?.rating || 4.8}</span>
            <span className="text-slate-400">({pkg.hotel?.starRating || 5}-Star)</span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Award className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              <strong>Room Category:</strong> {pkg.roomType || 'Deluxe Luxury Suite'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{pkg.hotel?.address}</span>
          </div>
          {pkg.hotel?.amenities && (
            <div className="flex flex-wrap gap-2 pt-2">
              {pkg.hotel.amenities.map((amenity, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/5 text-[11px] text-slate-300 font-medium"
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
