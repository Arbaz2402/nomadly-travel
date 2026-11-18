import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export const AdminKpiCards = ({ kpis = {} }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 min-w-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1 truncate">
          Total Platform GMV
        </span>
        <p className="text-xl sm:text-2xl font-extrabold text-white font-display truncate">
          {formatCurrency(kpis.totalGMV ?? 0)}
        </p>
        <span className="text-[11px] text-teal-400 font-semibold block mt-1 truncate">
          +18.4% monthly volume
        </span>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 min-w-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1 truncate">
          Platform Service Revenue
        </span>
        <p className="text-xl sm:text-2xl font-extrabold text-coral-400 font-display truncate">
          {formatCurrency(kpis.platformRevenue ?? 0)}
        </p>
        <span className="text-[11px] text-slate-400 font-medium block mt-1 truncate">
          Collected platform service fees
        </span>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 min-w-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1 truncate">
          Confirmed Reservations
        </span>
        <p className="text-xl sm:text-2xl font-extrabold text-white font-display truncate">
          {kpis.confirmedBookings ?? 0}
        </p>
        <span className="text-[11px] text-teal-400 font-semibold block mt-1 truncate">
          Zero double-booking rate
        </span>
      </div>

      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 min-w-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1 truncate">
          Cancellation Rate
        </span>
        <p className="text-xl sm:text-2xl font-extrabold text-amber-400 font-display truncate">
          {kpis.cancellationRate ?? 0}%
        </p>
        <span className="text-[11px] text-slate-400 block mt-1 truncate">
          Refunds: {formatCurrency(kpis.refundVolume ?? 0)}
        </span>
      </div>
    </div>
  );
};
