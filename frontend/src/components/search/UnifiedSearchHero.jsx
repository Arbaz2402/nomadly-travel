import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Sparkles,
  Calendar,
  Coins,
  Luggage,
  Map,
  ArrowRight
} from 'lucide-react';

export const UnifiedSearchHero = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('Coorg');
  const [days, setDays] = useState('4');

  const handlePlanTrip = (e) => {
    e.preventDefault();
    navigate(`/ai-planner?destination=${encodeURIComponent(destination)}&days=${days}`);
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Editorial Background Image with Midnight Gradient Overlay */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=85"
          alt="Cinematic Alpine & Coastal Horizon"
          className="w-full h-full object-cover object-center opacity-30 scale-105 transform filter saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-950/80 to-ink-950"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-coral-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Tagline & Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral-500/10 border border-coral-500/20 text-coral-400 text-xs font-semibold uppercase tracking-wider mb-5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Group &amp; Solo Trip Planner
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-5 font-display">
            Your entire journey, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-400 via-coral-500 to-amber-300">
              organized in one place.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Plan group itineraries, split shared expenses, store &amp; preview travel documents, track live currency rates, and pack with confidence.
          </p>
        </div>

        {/* Floating Glass Quick-Launch Panel */}
        <div className="glass-panel rounded-3xl p-4 sm:p-6 shadow-2xl max-w-4xl mx-auto border border-white/10 relative z-20 space-y-5">
          <form onSubmit={handlePlanTrip} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-5 bg-ink-900/80 border border-white/5 rounded-2xl p-3 focus-within:border-coral-500 transition-colors">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Where are you traveling?
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-coral-500 flex-shrink-0" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Coorg, Goa, Dubai, Swiss Alps"
                  className="bg-transparent text-sm text-white font-medium focus:outline-none w-full"
                />
              </div>
            </div>

            <div className="sm:col-span-3 bg-ink-900/80 border border-white/5 rounded-2xl p-3 focus-within:border-coral-500 transition-colors">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Duration (Days)
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="bg-transparent text-sm text-white font-medium focus:outline-none w-full"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <button
                type="submit"
                className="w-full py-3.5 sm:py-4 px-4 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-sm tracking-wide shadow-glow transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 stroke-[2.2] shrink-0" />
                <span>Launch Trip Planner</span>
              </button>
            </div>
          </form>

          {/* Direct Feature Shortcuts */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => navigate('/journeys')}
              className="px-4 py-2 rounded-xl bg-ink-900 hover:bg-ink-800 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Map className="w-3.5 h-3.5 text-coral-400" />
              My Journeys & Expense Splitting
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/currency-converter')}
              className="px-4 py-2 rounded-xl bg-ink-900 hover:bg-ink-800 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Coins className="w-3.5 h-3.5 text-teal-400" />
              Live Currency FX & Cash Estimator
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/packing-checklist')}
              className="px-4 py-2 rounded-xl bg-ink-900 hover:bg-ink-800 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Luggage className="w-3.5 h-3.5 text-amber-400" />
              Smart Packing Checklists
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
