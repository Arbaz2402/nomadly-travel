import React from 'react';
import { Compass, Check, MessageSquare, Sparkles, Loader2 } from 'lucide-react';

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

export const TripPreferencesCard = ({
  destination,
  setDestination,
  days,
  setDays,
  travelersCount,
  setTravelersCount,
  budgetStyle,
  setBudgetStyle,
  selectedInterests,
  toggleInterest,
  customPrompt,
  setCustomPrompt,
  generating,
  onGenerate,
}) => {
  return (
    <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-5">
      <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
        <Compass className="w-5 h-5 text-coral-500" />
        Trip Preferences
      </h2>

      <form onSubmit={onGenerate} className="space-y-4">
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
                  setCustomPrompt((prev) => (prev ? `${prev}; ${suggestion}` : suggestion))
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
  );
};
