import React from 'react';
import { Search } from 'lucide-react';

const STATUS_FILTERS = [
  { id: 'all', label: 'All Trips' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'completed', label: 'Completed' },
  { id: 'draft', label: 'Drafts' },
];

export const JourneysFilterBar = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by destination or title..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-ink-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-coral-500 transition-colors"
        />
      </div>

      {/* Status Filter Buttons & Sort Dropdown */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-ink-900 border border-white/10 overflow-x-auto scrollbar-none">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === f.id
                  ? 'bg-coral-500 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-ink-900 border border-white/10 rounded-2xl px-3 py-2 text-xs text-slate-300 font-semibold focus:outline-none focus:border-coral-500"
        >
          <option value="date_asc">Dates: Upcoming First</option>
          <option value="date_desc">Dates: Furthest Away</option>
          <option value="newest">Recently Created</option>
        </select>
      </div>
    </div>
  );
};
