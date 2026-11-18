import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminBookingsTable = ({
  bookings = [],
  searchTerm = '',
  setSearchTerm,
  onFilter,
}) => {
  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">System Bookings Ledger</h2>
          <p className="text-xs text-slate-400">All real-time customer bookings across flights, stays, and rail</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-ink-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
          />
          <button
            onClick={onFilter}
            className="px-3 py-1.5 rounded-xl bg-ink-900 border border-white/10 text-xs font-bold text-slate-200"
          >
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-none rounded-2xl border border-white/5">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px] bg-ink-950/40">
              <th className="py-3 px-3">Reference</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Provider</th>
              <th className="py-3 px-3">Amount</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {bookings.map((b) => (
              <tr key={b._id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-coral-400">{b.bookingReference}</td>
                <td className="py-3 px-3 font-medium">{b.contactInfo?.email}</td>
                <td className="py-3 px-3 capitalize">{b.travelCategory}</td>
                <td className="py-3 px-3 text-slate-400">{b.providerName}</td>
                <td className="py-3 px-3 font-bold">{formatCurrency(b.pricing?.totalPayable)}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/10 text-teal-400">
                    {b.bookingStatus}
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400">{formatDate(b.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
