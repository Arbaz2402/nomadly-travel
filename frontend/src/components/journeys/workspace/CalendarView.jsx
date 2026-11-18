import React from 'react';
import { Plus } from 'lucide-react';
import { formatDate } from '../../../utils/formatters';
import { CATEGORY_COLORS } from '../helpers';

export const CalendarView = ({ trip, itinerary, onOpenAddActivity }) => {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  // Generate all dates in trip
  const dates = [];
  const curr = new Date(start);
  while (curr <= end) {
    dates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-display">Journey Calendar</h3>
          <p className="text-xs text-slate-400">View all activities across the chronological itinerary.</p>
        </div>
        <button
          onClick={onOpenAddActivity}
          className="px-3.5 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {dates.map((d) => {
          const dateKey = d.toISOString().split('T')[0];
          const items = itinerary.groupedByDay?.[dateKey] || [];

          return (
            <div
              key={dateKey}
              className="p-4 rounded-2xl bg-ink-950/80 border border-white/10 flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-300">
                    {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                    {items.length} items
                  </span>
                </div>

                <div className="space-y-1.5">
                  {items.map((it) => (
                    <div
                      key={it._id}
                      className="p-1.5 rounded-lg bg-ink-900 border border-white/5 text-[11px] truncate flex items-center gap-1.5"
                    >
                      <span className="text-[9px] font-mono font-bold text-coral-400 shrink-0">
                        {it.startTime}
                      </span>
                      <span className="text-slate-200 truncate">{it.title}</span>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <span className="text-[11px] text-slate-500 italic block pt-2">Free day</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: EXPENSE TRACKER (MULTI-CURRENCY & CHARTS)
// =========================================================