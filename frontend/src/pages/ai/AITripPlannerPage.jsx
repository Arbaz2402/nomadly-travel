import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  Calendar,
  Users,
  Wallet,
  Clock,
  MapPin,
  Check,
  ArrowRight,
  Loader2,
  Building2,
  Share2,
  Layers,
  Info,
  ChevronRight,
  MessageSquare,
  ExternalLink,
  Route,
  Map,
  Navigation,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { useAuthStore } from '../../store/authStore';

const POPULAR_DESTINATIONS = [
  'Goa',
  'Udaipur',
  'Dubai',
  'Jaipur',
  'Srinagar',
  'Mumbai',
  'Coorg',
  'Manali',
];

const INTEREST_OPTIONS = [
  { id: 'sightseeing', label: 'Sightseeing' },
  { id: 'culture', label: 'History & Heritage' },
  { id: 'food', label: 'Food & Cafes' },
  { id: 'adventure', label: 'Adventure Sports' },
  { id: 'beaches', label: 'Beaches & Water' },
  { id: 'wellness', label: 'Relaxation & Spa' },
];

export const AITripPlannerPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, openAuthModal } = useAuthStore();

  const [destination, setDestination] = useState('Goa');
  const [days, setDays] = useState(3);
  const [travelersCount, setTravelersCount] = useState(2);
  const [budgetStyle, setBudgetStyle] = useState('moderate');
  const [selectedInterests, setSelectedInterests] = useState(['sightseeing', 'culture', 'food']);
  const [customPrompt, setCustomPrompt] = useState('');

  const [generating, setGenerating] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const toggleInterest = (id) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  /**
   * Constructs a chained Google Maps directions link connecting all stops for a specific day
   */
  const getGoogleMapsRouteUrl = (activities = [], destination = '') => {
    if (!activities || activities.length === 0) return null;
    const stops = activities
      .map((a) => a.googleMapsQuery || (a.location ? `${a.location}, ${destination}`.trim() : null))
      .filter(Boolean);

    if (stops.length === 0) return null;
    if (stops.length === 1) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0])}`;
    }
    const path = stops.map((s) => encodeURIComponent(s)).join('/');
    return `https://www.google.com/maps/dir/${path}`;
  };

  /**
   * Constructs a multi-stop Google Maps directions link covering all unique highlights across the trip
   */
  const getAllTripStopsRouteUrl = (days = [], destination = '') => {
    if (!days || days.length === 0) return null;
    const allStops = [];
    days.forEach((d) => {
      d.activities?.forEach((a) => {
        const query = a.googleMapsQuery || (a.location ? `${a.location}, ${destination}`.trim() : null);
        if (query && !allStops.includes(query)) {
          allStops.push(query);
        }
      });
    });
    if (allStops.length === 0) return null;
    if (allStops.length === 1) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(allStops[0])}`;
    }
    const topStops = allStops.slice(0, 10);
    return `https://www.google.com/maps/dir/${topStops.map((s) => encodeURIComponent(s)).join('/')}`;
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!destination.trim()) {
      showToast('Please enter a destination', 'error');
      return;
    }

    try {
      setGenerating(true);
      const res = await ApiClient.generateAIItinerary({
        destination: destination.trim(),
        days: Number(days),
        travelersCount: Number(travelersCount),
        budgetStyle,
        interests: selectedInterests,
        customPrompt: customPrompt.trim(),
      });

      if (res.success && res.data) {
        setItinerary(res.data);
        setActiveDayIndex(0);
        showToast('Itinerary synthesized successfully!', 'success');
      }
    } catch (err) {
      console.warn('AI Itinerary error:', err.message);
      showToast(err.message || 'Failed to generate itinerary. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportToJourney = async () => {
    if (!user) {
      showToast('Please sign in to save this itinerary to your personal journeys workspace.', 'info');
      if (openAuthModal) openAuthModal('signin');
      return;
    }

    if (!itinerary) return;

    try {
      setExporting(true);
      const res = await ApiClient.exportAIItineraryToJourney({
        title: itinerary.title || `Trip to ${itinerary.destination}`,
        destination: itinerary.destination,
        days: itinerary.days,
        travelersCount: itinerary.travelersCount,
        estimatedTotalBudget: itinerary.estimatedTotalBudget,
      });

      if (res.success && res.data?.tripId) {
        showToast('Itinerary saved to My Journeys!', 'success');
        navigate(`/journeys/${res.data.tripId}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to export to journey', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-b from-ink-900 to-ink-950 border-b border-white/10 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-coral-500/10 via-amber-500/10 to-teal-500/10 border border-coral-500/30 text-coral-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-coral-400" />
            AI-Powered Smart Trip Concierge
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Plan Your Dream Journey in Seconds
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Tell us where you want to go. Our travel intelligence creates a day-by-day plan with authentic spots, timing, and direct 1-click export to your Journey Workspace.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Generator Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-5">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Compass className="w-5 h-5 text-coral-500" />
                Trip Preferences
              </h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Destination Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Destination City / Region *
                  </label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Goa, Udaipur, Dubai, Coorg..."
                    className="w-full px-4 py-3 rounded-2xl bg-ink-950 border border-white/10 text-white text-sm focus:outline-none focus:border-coral-500 transition-colors"
                  />
                  {/* Quick destination chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {POPULAR_DESTINATIONS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDestination(d)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          destination.toLowerCase() === d.toLowerCase()
                            ? 'bg-coral-500/20 text-coral-400 border border-coral-500/40'
                            : 'bg-ink-900 text-slate-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration & Travelers */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Duration (Days)
                    </label>
                    <select
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-white text-xs focus:outline-none focus:border-coral-500"
                    >
                      <option value="2">2 Days (Weekend)</option>
                      <option value="3">3 Days (Long Weekend)</option>
                      <option value="4">4 Days (Mini Vacation)</option>
                      <option value="5">5 Days (Full Retreat)</option>
                      <option value="7">7 Days (Week-long)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Travelers
                    </label>
                    <select
                      value={travelersCount}
                      onChange={(e) => setTravelersCount(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-white text-xs focus:outline-none focus:border-coral-500"
                    >
                      <option value="1">Solo (1 traveler)</option>
                      <option value="2">Couple (2 travelers)</option>
                      <option value="4">Friends / Family (4)</option>
                      <option value="6">Group (6+)</option>
                    </select>
                  </div>
                </div>

                {/* Budget Style */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Budget Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'budget', label: 'Budget' },
                      { id: 'moderate', label: 'Balanced' },
                      { id: 'luxury', label: 'Luxury' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBudgetStyle(b.id)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all text-center ${
                          budgetStyle === b.id
                            ? 'bg-coral-500/20 border-coral-500 text-coral-400'
                            : 'bg-ink-950 border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Travel Interests */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Travel Interests
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {INTEREST_OPTIONS.map((item) => {
                      const isSelected = selectedInterests.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleInterest(item.id)}
                          className={`p-2 rounded-xl text-left text-xs font-medium border flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-teal-500/15 border-teal-500/40 text-teal-300'
                              : 'bg-ink-950 border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{item.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-teal-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Prompt / Special Requests */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Custom Prompt / Special Instructions</span>
                    </label>
                    <span className="text-[10px] text-teal-400 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Gemini AI
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Traveling with infant, need stroller-friendly spots; 5th wedding anniversary with romantic candlelit dining; Pure vegetarian street food trail..."
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-ink-950 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-coral-500 transition-colors resize-none leading-relaxed"
                  />
                  {/* Quick suggestion prompt chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      'Romantic / Anniversary',
                      'Vegetarian Food Trail',
                      'Kid & Stroller Friendly',
                      'Offbeat & Hidden Gems',
                      'Scenic Photography Walk',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() =>
                          setCustomPrompt((prev) =>
                            prev ? `${prev}; ${suggestion}` : suggestion
                          )
                        }
                        className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.09] border border-white/5 transition-colors"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={generating}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white text-xs font-bold shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Authentic Itinerary...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Smart Itinerary</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Output Preview */}
          <div className="lg:col-span-7">
            {generating ? (
              <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-coral-500/10 border border-coral-500/20 text-coral-400 mx-auto flex items-center justify-center animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">
                  Crafting Your {destination} Itinerary
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Analyzing top-rated spots, calculating optimal driving routes, and pairing verified local stays...
                </p>
              </div>
            ) : !itinerary ? (
              <div className="glass-panel rounded-3xl border border-white/10 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-ink-900 border border-white/10 text-slate-400 mx-auto flex items-center justify-center">
                  <Compass className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">Ready to Build Your Journey</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Pick your destination and preferences on the left, then click Generate to create an instant full-scale itinerary.
                </p>
                <button
                  onClick={() => handleGenerate()}
                  className="px-5 py-2.5 rounded-xl bg-ink-900 hover:bg-ink-850 border border-white/10 text-xs font-bold text-slate-300 transition-colors"
                >
                  Try Sample (Goa in 3 Days)
                </button>
              </div>
            ) : (
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

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {itinerary.overview}
                  </p>

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
                        onClick={handleExportToJourney}
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
                      {getGoogleMapsRouteUrl(itinerary.days[activeDayIndex].activities, itinerary.destination) && (
                        <a
                          href={getGoogleMapsRouteUrl(itinerary.days[activeDayIndex].activities, itinerary.destination)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-coral-500/20 via-coral-500/10 to-amber-500/20 hover:from-coral-500/30 hover:to-amber-500/30 border border-coral-500/35 text-coral-300 hover:text-white text-xs font-bold transition-all shadow-glow group"
                          title="Open Google Maps with all stops for this day in sequential driving order"
                        >
                          <Route className="w-3.5 h-3.5 text-coral-400 group-hover:scale-110 transition-transform" />
                          <span>
                            Open Day {itinerary.days[activeDayIndex].day} Route ({itinerary.days[activeDayIndex].activities?.length || 0} Stops)
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
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.googleMapsQuery || `${act.location}, ${itinerary.destination || ''}`.trim())}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-coral-500/10 hover:bg-coral-500/20 border border-coral-500/25 text-[11px] font-semibold text-coral-400 hover:text-coral-300 transition-all group shadow-sm"
                                title="Open location in Google Maps"
                              >
                                <MapPin className="w-3 h-3 text-coral-400 group-hover:scale-110 transition-transform shrink-0" />
                                <span>{act.location}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-coral-400/70 group-hover:text-coral-300 shrink-0" />
                              </a>
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
                        <p className="text-[11px] text-slate-400">{itinerary.matchedHotel.address?.city}</p>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITripPlannerPage;
