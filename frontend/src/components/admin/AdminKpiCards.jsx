import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export const AdminKpiCards = ({ kpis = {} }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 min-w-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1 truncate">
          Total Users
        </span>
        <p className="text-xl sm:text-2xl font-extrabold text-white font-display truncate">
          {kpis.totalUsers ?? 0}
        </p>
        <span className="text-[11px] text-teal-400 font-semibold block mt-1 truncate">
          Registered accounts
        </span>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 min-w-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1 truncate">
          Total Journeys
        </span>
        <p className="text-xl sm:text-2xl font-extrabold text-coral-400 font-display truncate">
          {kpis.totalTrips ?? 0}
        </p>
        <span className="text-[11px] text-slate-400 font-medium block mt-1 truncate">
          {kpis.activeTrips ?? 0} active • {kpis.completedTrips ?? 0} completed
        </span>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 min-w-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1 truncate">
          Tracked Expenses
        </span>
        <p className="text-xl sm:text-2xl font-extrabold text-white font-display truncate">
          {formatCurrency(kpis.totalTrackedExpenses ?? 0)}
        </p>
        <span className="text-[11px] text-teal-400 font-semibold block mt-1 truncate">
          Across all group splits
        </span>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 min-w-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1 truncate">
          Vault Documents
        </span>
        <p className="text-xl sm:text-2xl font-extrabold text-amber-400 font-display truncate">
          {kpis.totalDocuments ?? 0}
        </p>
        <span className="text-[11px] text-slate-400 block mt-1 truncate">
          Stored trip files
        </span>
      </div>
    </div>
  );
};
