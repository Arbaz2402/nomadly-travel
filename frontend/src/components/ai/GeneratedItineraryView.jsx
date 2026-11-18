import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Layers,
  Map,
  ExternalLink,
  ArrowRight,
  Loader2,
  Route,
  MapPin,
  Building2,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import {
  cleanVenueTitle,
  buildExactVenueQuery,
  getGoogleMapsRouteUrl,
  getAllTripStopsRouteUrl,
} from '../../utils/mapsUrlBuilder';

export const GeneratedItineraryView = ({
  itinerary,
  activeDayIndex,
  setActiveDayIndex,
  exporting,
  onExportToJourney,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Generated Header Summary */}
      <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                AI Recommended Plan • {itinerary.days?.length} Days
              </span>
              {itinerary.source && (
                <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[10px] font-semibold">
                  {itinerary.source.includes('gemini') ? 'Google Gemini AI' : 'Nomadly Engine'}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-extrabold text-white font-display">
              {itinerary.title}
            </h2>
            {itinerary.customPrompt && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Custom Prompt: &ldquo;{itinerary.customPrompt}&rdquo;</span>
              </div>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Estimated Budget
            </span>
            <span className="text-2xl font-extrabold text-white font-display">
              {formatCurrency(itinerary.estimatedTotalBudget, itinerary.currency)}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{itinerary.overview}</p>

        {/* 1-Click Export & Multi-Stop Route Banner */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Layers className="w-4 h-4 text-coral-400" />
            <span>Ready to organize or navigate this itinerary?</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Entire Trip Multi-Stop Route Button */}
            {getAllTripStopsRouteUrl(itinerary.days, itinerary.destination) && (
              <a
                href={getAllTripStopsRouteUrl(itinerary.days, itinerary.destination)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-ink-850 border border-white/10 hover:border-coral-500/40 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm group"
                title="Open all stops across the entire trip chained together in Google Maps"
              >
                <Map className="w-3.5 h-3.5 text-coral-400 group-hover:scale-110 transition-transform" />
                <span>Complete Trip Route (All Stops)</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
              </a>
            )}

            <button
              onClick={onExportToJourney}
              disabled={exporting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-xs font-bold shadow-glow-teal flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <span>Save & Export to My Journeys</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Day-by-Day Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {itinerary.days?.map((d, index) => (
          <button
            key={index}
            onClick={() => setActiveDayIndex(index)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeDayIndex === index
                ? 'bg-coral-500 text-white shadow-glow'
                : 'bg-ink-900 border border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Day {d.day}: {d.title?.split(':')[0]}
          </button>
        ))}
      </div>

      {/* Active Day Activities List */}
      {itinerary.days?.[activeDayIndex] && (
        <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block mb-0.5">
                Day {itinerary.days[activeDayIndex].day} Stops & Navigation
              </span>
              <h3 className="text-base font-bold text-white font-display">
                {itinerary.days[activeDayIndex].title}
              </h3>
            </div>

            {/* Day Multi-Stop Route Button */}
            {getGoogleMapsRouteUrl(
              itinerary.days[activeDayIndex].activities,
              itinerary.destination
            ) && (
              <a
                href={getGoogleMapsRouteUrl(
                  itinerary.days[activeDayIndex].activities,
                  itinerary.destination
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-coral-500/20 via-coral-500/10 to-amber-500/20 hover:from-coral-500/30 hover:to-amber-500/30 border border-coral-500/35 text-coral-300 hover:text-white text-xs font-bold transition-all shadow-glow group"
                title="Open Google Maps with all stops for this day in sequential driving order"
              >
                <Route className="w-3.5 h-3.5 text-coral-400 group-hover:scale-110 transition-transform" />
                <span>
                  Open Day {itinerary.days[activeDayIndex].day} Route (
                  {itinerary.days[activeDayIndex].activities?.length || 0} Stops)
                </span>
                <ExternalLink className="w-3 h-3 text-coral-400/80 group-hover:text-white" />
              </a>
            )}
          </div>

          <div className="space-y-4">
            {itinerary.days[activeDayIndex].activities?.map((act, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-ink-900/70 border border-white/5 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-coral-500/20 border border-coral-500/35 text-coral-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 font-mono text-[10px] font-bold">
                      {act.time}
                    </span>
                    <h4 className="text-xs font-bold text-white">{act.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {act.description}
                  </p>
                  <div className="pt-2">
                    {(() => {
                      const venueQuery = buildExactVenueQuery(
                        act.title,
                        act.googleMapsQuery || act.location,
                        itinerary.destination
                      );
                      const cleanVenue = cleanVenueTitle(act.title);
                      let displayLoc = (act.location || itinerary.destination || '').trim();
                      if (
                        cleanVenue &&
                        !displayLoc.toLowerCase().includes(cleanVenue.toLowerCase()) &&
                        displayLoc.toLowerCase() !== cleanVenue.toLowerCase()
                      ) {
                        displayLoc = `${cleanVenue}, ${displayLoc}`;
                      }
                      return (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            venueQuery
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-coral-500/10 hover:bg-coral-500/20 border border-coral-500/25 text-[11px] font-semibold text-coral-400 hover:text-coral-300 transition-all group shadow-sm"
                          title={`Open exact venue in Google Maps: ${venueQuery}`}
                        >
                          <MapPin className="w-3 h-3 text-coral-400 group-hover:scale-110 transition-transform shrink-0" />
                          <span>{displayLoc}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-coral-400/70 group-hover:text-coral-300 shrink-0" />
                        </a>
                      );
                    })()}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-white">
                    {act.cost > 0 ? formatCurrency(act.cost) : 'Free'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paired Real Hotel Stays (if found) */}
      {itinerary.matchedHotel && (
        <div className="p-4 rounded-2xl bg-ink-900/60 border border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Recommended Boutique Stay
              </span>
              <p className="text-xs font-bold text-white">{itinerary.matchedHotel.name}</p>
              <p className="text-[11px] text-slate-400">
                {itinerary.matchedHotel.address?.city}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/hotels')}
            className="px-4 py-2 rounded-xl bg-ink-850 hover:bg-ink-800 border border-white/10 text-xs font-bold text-white transition-colors"
          >
            View Hotel
          </button>
        </div>
      )}
    </div>
  );
};
