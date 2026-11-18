import React from 'react';
import { Map, Calendar, Compass, Wallet } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

export const JourneysMetricsBar = ({ metrics = {} }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Map className="w-3.5 h-3.5 text-coral-400" />
          <span>Total Journeys</span>
        </div>
        <p className="text-xl sm:text-2xl font-black text-white font-display">
          {metrics.totalTrips || 0}
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Calendar className="w-3.5 h-3.5 text-teal-400" />
          <span>Upcoming</span>
        </div>
        <p className="text-xl sm:text-2xl font-black text-white font-display">
          {metrics.upcomingCount || 0}
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>In Progress</span>
        </div>
        <p className="text-xl sm:text-2xl font-black text-amber-400 font-display">
          {metrics.ongoingCount || 0}
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Wallet className="w-3.5 h-3.5 text-purple-400" />
          <span>Total Budget</span>
        </div>
        <p className="text-xl sm:text-2xl font-black text-white font-display truncate">
          {formatCurrency(metrics.totalPlannedBudget || 0)}
        </p>
      </div>
    </div>
  );
};
