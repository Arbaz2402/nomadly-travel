import React from 'react';

export const PackageItineraryTimeline = ({
  itinerary = [],
  activeDayTab = 1,
  setActiveDayTab,
}) => {
  if (!itinerary || itinerary.length === 0) return null;

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-display">
            Day-by-Day Curated Itinerary
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Every detail planned for maximum relaxation and seamless travel.
          </p>
        </div>
        <div className="flex items-center gap-1">
          {itinerary.map((item) => (
            <button
              key={item.day}
              type="button"
              onClick={() => setActiveDayTab(item.day)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                activeDayTab === item.day
                  ? 'bg-teal-500 text-ink-950 shadow-md scale-105'
                  : 'bg-ink-900 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              D{item.day}
            </button>
          ))}
        </div>
      </div>

      {/* Itinerary Timeline */}
      <div className="space-y-4 pt-2">
        {itinerary.map((item) => {
          const isActive = activeDayTab === item.day;
          return (
            <div
              key={item.day}
              onClick={() => setActiveDayTab(item.day)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-ink-900/90 border-teal-500/40 shadow-lg'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                    isActive
                      ? 'bg-teal-500 text-ink-950'
                      : 'bg-ink-950 text-slate-400 border border-white/10'
                  }`}
                >
                  {item.day}
                </span>
                <h4 className="text-sm font-bold text-white">
                  Day {item.day}: {item.title}
                </h4>
              </div>
              <p className="text-xs text-slate-300 pl-10 leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
