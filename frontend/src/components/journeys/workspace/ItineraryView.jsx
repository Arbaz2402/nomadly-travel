import React from 'react';
import {
  Plus,
  Clock,
  Sparkles,
  ExternalLink,
  Edit2,
  Edit3,
  Trash2,
  Calendar,
  Compass,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Route,
} from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import {
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  cleanVenueTitle,
  buildExactVenueQuery,
} from '../helpers';

export const ItineraryView = ({
  trip,
  itinerary,
  canEdit,
  onRefresh,
  onOpenAddActivity,
  onOpenAttachBooking,
  onOpenAiModify,
  onOpenEditActivity,
}) => {
  const { showToast } = useToast();
  const dayKeys = Object.keys(itinerary.groupedByDay || {}).sort();

  const handleDeleteItem = async (itemId, title) => {
    if (!window.confirm(`Delete activity "${title}" from itinerary?`)) return;
    try {
      const res = await ApiClient.deleteItineraryItem(trip._id, itemId);
      if (res.success) {
        showToast('Activity removed', 'info');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete activity', 'error');
    }
  };

  const openDayRouteOnMaps = (dayItems = []) => {
    const stops = dayItems
      .map((it) => buildExactVenueQuery(it.title, it.location?.address || it.location?.name, trip.destination))
      .filter(Boolean);

    if (stops.length === 0) return;
    if (stops.length === 1) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0])}`, '_blank', 'noopener,noreferrer');
      return;
    }
    const path = stops.slice(0, 10).map((s) => encodeURIComponent(s)).join('/');
    window.open(`https://www.google.com/maps/dir/${path}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Scheduling Warnings Banner */}
      {itinerary.warnings && itinerary.warnings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            Scheduling & Conflict Alerts ({itinerary.warnings.length})
          </div>
          <ul className="text-xs space-y-1 pl-6 list-disc text-amber-200">
            {itinerary.warnings.map((w, idx) => (
              <li key={idx}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-900/60 p-4 rounded-2xl border border-white/5">
        <div>
          <h3 className="text-base font-bold text-white font-display">Daily Timeline</h3>
          <p className="text-xs text-slate-400">
            Chronological itinerary organized by day with conflict detection and external reservations.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAttachBooking}
              className="px-3.5 py-2 rounded-xl bg-ink-800 hover:bg-ink-700 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Attach Booking
            </button>
            <button
              onClick={onOpenAddActivity}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </div>
        )}
      </div>

      {/* Days List */}
      {dayKeys.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 space-y-3">
          <MapPin className="w-10 h-10 text-slate-500 mx-auto" />
          <h4 className="text-base font-bold text-white">No activities planned yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Build your custom travel itinerary! Add flights, hotels, express trains, local restaurants, or sightseeing stops.
          </p>
          {canEdit && (
            <button
              onClick={onOpenAddActivity}
              className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs shadow-glow inline-flex items-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" />
              Add First Activity
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {dayKeys.map((dateStr, dayIndex) => {
            const items = itinerary.groupedByDay[dateStr] || [];
            return (
              <div
                key={dateStr}
                className="rounded-3xl bg-ink-900/60 border border-white/5 overflow-hidden"
              >
                {/* Day Header */}
                <div className="bg-ink-950/80 px-6 py-3.5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-coral-500/10 text-coral-400 border border-coral-500/20 font-bold text-xs flex items-center justify-center font-mono">
                      {dayIndex + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {new Date(dateStr).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {items.length > 0 && (
                      <button
                        onClick={() => openDayRouteOnMaps(items)}
                        className="px-3 py-1.5 rounded-xl bg-ink-900 hover:bg-ink-850 border border-white/10 hover:border-coral-500/40 text-coral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                        title="Open turn-by-turn route with all stops for this day in Google Maps"
                      >
                        <Route className="w-3.5 h-3.5 text-coral-400" />
                        <span>Day Route ({items.length} Stops)</span>
                        <ExternalLink className="w-3 h-3 text-coral-400/80" />
                      </button>
                    )}
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {items.length} {items.length === 1 ? 'event' : 'events'}
                    </span>
                  </div>
                </div>

                {/* Day Activities */}
                <div className="p-4 sm:p-6 space-y-3">
                  {items.map((item) => {
                    const Icon = CATEGORY_ICONS[item.category] || MapPin;
                    const catColor = CATEGORY_COLORS[item.category] || '#ff5a36';

                    return (
                      <div
                        key={item._id}
                        className="p-4 rounded-2xl bg-ink-850/80 hover:bg-ink-850 border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          {/* Time & Category Icon */}
                          <div className="flex flex-col items-center shrink-0">
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                              style={{ backgroundColor: `${catColor}20`, color: catColor }}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 mt-1.5 font-bold">
                              {item.startTime}
                            </span>
                          </div>

                          {/* Activity Details */}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="text-sm font-bold text-white">{item.title}</h5>

                              {/* Source Badge */}
                              {item.sourceType === 'nomadly_booking' ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  NOMADLY Confirmed
                                </span>
                              ) : item.sourceType === 'external_booking' ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" />
                                  {item.externalProvider || 'External Booking'}
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                                  Manual
                                </span>
                              )}

                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-white/5 text-slate-300">
                                {item.status}
                              </span>
                            </div>

                            {item.description && (
                              <p className="text-xs text-slate-300">{item.description}</p>
                            )}

                            {/* Location & Timespan */}
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                              {item.location?.name && (() => {
                                const venueQuery = buildExactVenueQuery(item.title, item.location?.address || item.location?.name, trip.destination);
                                return (
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueQuery)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-coral-400 transition-colors group cursor-pointer"
                                    title={`Open exact venue in Google Maps: ${venueQuery}`}
                                  >
                                    <MapPin className="w-3 h-3 text-coral-400 group-hover:scale-110 transition-transform" />
                                    <span className="group-hover:underline underline-offset-2">{item.location.name}</span>
                                    <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                                  </a>
                                );
                              })()}
                              <span>
                                {item.startTime} — {item.endTime}
                              </span>
                              {item.bookingReference && (
                                <span className="font-mono text-slate-300 bg-ink-950 px-1.5 py-0.5 rounded border border-white/5">
                                  Ref: {item.bookingReference}
                                </span>
                              )}
                            </div>

                            {item.notes && (
                              <p className="text-[11px] text-slate-400 italic">"{item.notes}"</p>
                            )}
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          {item.actualCost > 0 && (
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-teal-400">
                                {formatCurrency(item.actualCost, item.currency || trip.currency)}
                              </span>
                              <span className="text-[10px] text-slate-500 block">Actual Cost</span>
                            </div>
                          )}

                          {canEdit && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => onOpenAiModify && onOpenAiModify(item)}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-coral-500/15 via-coral-500/10 to-amber-500/15 hover:from-coral-500/25 hover:to-amber-500/25 text-coral-400 hover:text-coral-300 border border-coral-500/30 flex items-center gap-1.5 transition-all shadow-sm group"
                                title="Tell AI: 'I don't want this, give this' to swap or modify"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-coral-400 group-hover:rotate-12 transition-transform" />
                                <span className="hidden sm:inline">Change with AI</span>
                                <span className="sm:hidden">AI</span>
                              </button>

                              <button
                                onClick={() => onOpenEditActivity && onOpenEditActivity(item)}
                                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                title="Edit Activity Manually"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteItem(item._id, item.title)}
                                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Delete Activity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: TRIP OVERVIEW TAB
// =========================================================