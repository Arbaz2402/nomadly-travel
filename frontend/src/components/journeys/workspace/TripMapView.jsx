import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  ExternalLink,
  Navigation,
  Share2,
  Calendar,
  Layers,
  Route,
} from 'lucide-react';
import {
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  cleanVenueTitle,
  buildExactVenueQuery,
} from '../helpers';

export const TripMapView = ({ trip, itinerary }) => {
  const [selectedDayFilter, setSelectedDayFilter] = useState('all');
  const allStops = [];

  // Add primary destination
  allStops.push({
    title: trip.destination,
    type: 'Primary Destination',
    address: trip.destination,
    dayIndex: 0,
  });

  // Add additional destinations
  (trip.additionalDestinations || []).forEach((dest) => {
    allStops.push({
      title: dest,
      type: 'Stop',
      address: dest,
      dayIndex: 0,
    });
  });

  // Add itinerary locations with day mapping
  const dayKeys = Object.keys(itinerary.groupedByDay || {}).sort();

  if (dayKeys.length > 0) {
    dayKeys.forEach((dateKey, dayIdx) => {
      const items = itinerary.groupedByDay[dateKey] || [];
      items.forEach((it) => {
        if (it.location?.name || it.title) {
          const exactAddr = buildExactVenueQuery(it.title, it.location?.address || it.location?.name, trip.destination);
          const cleanLoc = (it.location?.name || it.location?.address || '').trim();
          allStops.push({
            title: it.title,
            type: it.category || 'Sightseeing',
            displayAddress: cleanLoc || trip.destination,
            address: exactAddr,
            dayIndex: dayIdx + 1,
            time: it.startTime,
            dateKey,
          });
        }
      });
    });
  } else {
    (itinerary.data || []).forEach((it) => {
      if (it.location?.name || it.title) {
        const exactAddr = buildExactVenueQuery(it.title, it.location?.address || it.location?.name, trip.destination);
        const cleanLoc = (it.location?.name || it.location?.address || '').trim();
        allStops.push({
          title: it.title,
          type: it.category || 'Sightseeing',
          displayAddress: cleanLoc || trip.destination,
          address: exactAddr,
          dayIndex: it.dayNumber || 1,
          time: it.startTime,
        });
      }
    });
  }

  const openGoogleMapsDirections = (stop) => {
    const clean = typeof stop === 'string'
      ? buildExactVenueQuery('', stop, trip.destination)
      : buildExactVenueQuery(stop?.title, stop?.address, trip.destination);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clean)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openMultiStopGoogleMapsRoute = (stopsList) => {
    const list = stopsList || (selectedDayFilter === 'all' ? allStops : allStops.filter((s) => s.dayIndex === Number(selectedDayFilter)));
    const raw = list
      .map((s) => buildExactVenueQuery(s.title, s.address, trip.destination))
      .filter(Boolean);

    // Deduplicate consecutive identical addresses
    const unique = raw.filter((item, idx, arr) => idx === 0 || item !== arr[idx - 1]);

    if (unique.length === 0) return;
    if (unique.length === 1) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(unique[0])}`, '_blank', 'noopener,noreferrer');
      return;
    }

    // Google Maps handles up to 10 stops chained in one directions URL
    const topStops = unique.slice(0, 10);
    const path = topStops.map((s) => encodeURIComponent(s)).join('/');
    window.open(`https://www.google.com/maps/dir/${path}`, '_blank', 'noopener,noreferrer');
  };

  const displayedStops = selectedDayFilter === 'all'
    ? allStops
    : allStops.filter((s) => s.dayIndex === Number(selectedDayFilter) || s.dayIndex === 0);

  return (
    <div className="space-y-6">
      {/* Top Route Banner with Full Multi-Stop Button */}
      <div className="bg-ink-900/80 p-6 rounded-3xl border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-coral-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
              Interactive Route Navigation
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white font-display">Route Map & Stop Sequence</h3>
          <p className="text-xs text-slate-400">
            {allStops.length} verified stops across {trip.destination}. Open turn-by-turn driving & transit directions in Google Maps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => openMultiStopGoogleMapsRoute(displayedStops)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-coral-500 via-coral-600 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-2.5 shadow-glow transition-all"
            title="Open Google Maps with all stops connected in turn-by-turn order"
          >
            <Route className="w-4 h-4" />
            <span>
              {selectedDayFilter === 'all'
                ? `Open All ${displayedStops.length} Stops in Google Maps`
                : `Open Day ${selectedDayFilter} Route (${displayedStops.length} Stops)`}
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Day Filter Pills (if multiple days) */}
      {dayKeys.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedDayFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedDayFilter === 'all'
                ? 'bg-coral-500 text-white shadow-glow'
                : 'bg-ink-900 border border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            All Stops ({allStops.length})
          </button>
          {dayKeys.map((dateKey, idx) => {
            const count = (itinerary.groupedByDay[dateKey] || []).length;
            const dayNum = idx + 1;
            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDayFilter(String(dayNum))}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedDayFilter === String(dayNum)
                    ? 'bg-coral-500 text-white shadow-glow'
                    : 'bg-ink-900 border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span>Day {dayNum} ({count} Stops)</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid of Stops */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedStops.map((stop, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 hover:border-coral-500/40 transition-all flex flex-col justify-between space-y-4 overflow-hidden"
          >
            <div className="flex items-start gap-3 min-w-0 w-full overflow-hidden">
              <span className="w-8 h-8 rounded-xl bg-coral-500/10 text-coral-400 border border-coral-500/20 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                #{idx + 1}
              </span>
              <div className="space-y-1 min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-teal-400">{stop.type}</span>
                  {stop.time && (
                    <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                      {stop.time}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white leading-tight truncate" title={stop.title}>{stop.title}</h4>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-coral-400 shrink-0" />
                  <span className="truncate block text-slate-300" title={stop.displayAddress || stop.address}>
                    {stop.displayAddress || stop.address}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => openGoogleMapsDirections(stop)}
              className="w-full py-2 px-3 rounded-xl bg-ink-950 hover:bg-ink-850 text-slate-200 border border-white/5 hover:border-coral-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-coral-400" />
              <span>Open in Google Maps Directions</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: TRIP DOCUMENTS VAULT
// =========================================================