import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { X, Sparkles, Loader2, Compass, AlertCircle, MapPin, Building2, Check, ExternalLink } from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../utils/formatters';

const detectTripStay = (trip = {}, items = []) => {
  // 1. From trip segments (booked hotels)
  const hotelSegment = (trip.segments || []).find((s) => s.segmentType === 'hotel');
  if (hotelSegment) return hotelSegment.title || hotelSegment.toLocation;

  // 2. From itinerary items with category hotel or check-in
  const hotelItem = (items || []).find(
    (it) => it.category === 'hotel' || /check-in|stay\s+at|resort|hotel/i.test(it.title)
  );
  if (hotelItem) {
    return hotelItem.location?.name || hotelItem.location?.address || hotelItem.title;
  }

  // 3. From trip stay or destination
  return trip.stayLocation || trip.recommendedStayArea || null;
};

export const AIModifyActivityModal = ({ trip, item, itinerary, isOpen, onClose, onUpdated }) => {
  const { showToast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [replacement, setReplacement] = useState(null);
  const detectedStay = detectTripStay(trip, itinerary?.data || []);
  const [stayLocation, setStayLocation] = useState(detectedStay || '');

  if (!isOpen || !item) return null;

  const quickChips = [
    '☕ Coffee estate tour or plantation tasting',
    '🍛 Authentic local pure vegetarian restaurant',
    '🌿 Serene nature viewpoint or waterfall walk',
    '🏛️ Historic palace or ancient temple visit',
    '🧘 Relaxing wellness, spa or indoor activity',
    '💸 Scenic free photography spot or lake stroll',
  ];

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) {
      showToast('Please describe what you would like to change or swap', 'error');
      return;
    }
    try {
      setLoading(true);
      const existingActivities = (itinerary?.data || [])
        .filter((act) => String(act._id) !== String(item._id))
        .map((act) => act.title)
        .filter(Boolean);

      const res = await ApiClient.modifyActivityWithAI({
        destination: trip.destination,
        currentActivity: {
          title: item.title,
          category: item.category,
          time: item.startTime,
          location: item.location?.name || item.location?.address || trip.destination,
          description: item.description,
        },
        userPrompt: prompt.trim(),
        dayTitle: item.date ? formatDate(item.date) : '',
        stayLocation: stayLocation ? stayLocation.trim() : null,
        existingActivities,
      });

      if (res.success && res.data) {
        setReplacement(res.data);
        showToast('AI found a great alternative!', 'success');
      } else {
        showToast(res.message || 'Failed to generate alternative', 'error');
      }
    } catch (err) {
      showToast(err.message || 'AI generation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!replacement) return;
    try {
      setApplying(true);
      const payload = {
        title: replacement.title,
        description: replacement.description,
        category: replacement.category || item.category || 'sightseeing',
        location: {
          name: replacement.location?.name || replacement.location || trip.destination,
          address: replacement.location?.address || replacement.googleMapsQuery || trip.destination,
        },
        startTime: replacement.startTime || item.startTime,
        endTime: replacement.endTime || item.endTime,
        estimatedCost: Number(replacement.estimatedCost) || 0,
      };

      const res = await ApiClient.updateItineraryItem(trip._id, item._id, payload);
      if (res.success) {
        showToast('Activity swapped with AI replacement successfully!', 'success');
        onUpdated();
        onClose();
      } else {
        showToast(res.message || 'Failed to update activity', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to apply replacement', 'error');
    } finally {
      setApplying(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-ink-900 border border-white/10 rounded-3xl w-full max-w-xl p-6 sm:p-7 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-coral-500/15 border border-coral-500/30 text-coral-400">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-coral-400 font-mono">
                AI Activity Assistant
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white font-display">
              Change or Swap Activity
            </h3>
            <p className="text-xs text-slate-400">
              Tell AI what you don't like or what you'd prefer instead, and get an authentic local replacement in {trip.destination}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Activity Banner */}
        <div className="p-4 rounded-2xl bg-ink-950/80 border border-white/5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Current Activity to Replace
          </span>
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                <MapPin className="w-3 h-3 text-coral-400 shrink-0" />
                <span className="truncate">{item.location?.name || trip.destination}</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                {item.startTime}
              </span>
            </div>
          </div>
        </div>

        {/* Base Stay Context (so AI knows distance/proximity) */}
        {stayLocation && (
          <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-ink-950/70 border border-teal-500/20 text-xs text-slate-300">
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="truncate">
                Base Stay: <strong className="text-white font-semibold">{stayLocation}</strong>
              </span>
            </div>
            <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 shrink-0">
              Active in AI Context
            </span>
          </div>
        )}

        {/* Prompt Input Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>What would you like instead?</span>
              <span className="text-[11px] font-normal text-slate-500">e.g. "I don't want this, give this"</span>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I don't want rafting, give me a relaxing coffee estate tour or spice plantation walk instead"
              className="w-full px-4 py-3 rounded-2xl bg-ink-950 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-coral-500/50 resize-none transition-colors"
            />
          </div>

          {/* Quick inspiration chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Suggestions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(`I don't want ${item.title}, give me a ${chip.replace(/^[^\s]+\s*/, '')} instead.`)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-coral-500/15 text-slate-300 hover:text-coral-300 border border-white/5 hover:border-coral-500/30 transition-all text-left"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating recommendations...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Alternative</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* AI Replacement Result Card */}
        {replacement && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 via-ink-950 to-coral-500/10 border border-teal-500/30 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1 font-mono">
                <Check className="w-3.5 h-3.5" />
                AI Recommended Alternative
              </span>
              <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                {replacement.startTime || item.startTime}
              </span>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-extrabold text-white leading-tight">
                {replacement.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {replacement.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                {(() => {
                  const mapsQuery = buildExactVenueQuery(
                    replacement.title,
                    replacement.googleMapsQuery || replacement.location?.address || replacement.location?.name || replacement.location,
                    trip.destination
                  );
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
                  const displayLoc = replacement.location?.name || replacement.location?.address || replacement.location || trip.destination;

                  return (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 hover:text-teal-200 font-semibold transition-all group shadow-sm"
                      title={`Open location in Google Maps: ${mapsQuery}`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform shrink-0" />
                      <span className="group-hover:underline underline-offset-2">{displayLoc}</span>
                      <ExternalLink className="w-3 h-3 text-teal-400/80 group-hover:text-teal-200 shrink-0" />
                    </a>
                  );
                })()}
                {replacement.estimatedCost > 0 && (
                  <span className="text-slate-300 font-mono">
                    Est. {formatCurrency(replacement.estimatedCost, trip.currency)}
                  </span>
                )}
              </div>
            </div>

            {(() => {
              const mapsQuery = buildExactVenueQuery(
                replacement.title,
                replacement.googleMapsQuery || replacement.location?.address || replacement.location?.name || replacement.location,
                trip.destination
              );
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

              return (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-teal-300 hover:text-white bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 flex items-center gap-1.5 transition-all shadow-sm group"
                    title="Open and verify this exact place on Google Maps before applying"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-teal-400 group-hover:scale-110 transition-transform" />
                    <span>View on Google Maps</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReplacement(null)}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Try Another
                    </button>
                    <button
                      type="button"
                      disabled={applying}
                      onClick={handleApply}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-glow transition-all"
                    >
                      {applying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Applying...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Apply to My Itinerary</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
};

// =========================================================
// MODAL: EDIT ACTIVITY MANUALLY
// =========================================================
