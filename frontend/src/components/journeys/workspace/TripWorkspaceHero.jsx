import React from 'react';
import {
  Users,
  Calendar as CalendarIcon,
  MapPin,
  ShieldCheck,
  Layers,
  Compass,
  Wallet,
  TrendingUp,
  Map,
  FileText,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export const TripWorkspaceHero = ({
  trip,
  canEdit,
  activeTab,
  setActiveTab,
  onOpenAttachBooking,
}) => {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-ink-900 shadow-2xl">
      <div className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[340px] w-full flex flex-col justify-between p-4 sm:p-6 md:p-8">
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/40" />

        {/* Top Badges & Actions */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-ink-950/80 backdrop-blur-md border border-white/10 text-xs font-bold text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              {trip.dynamicStatus?.toUpperCase() || 'UPCOMING'}
            </span>
            <span className="px-3 py-1 rounded-full bg-ink-950/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-coral-400" />
              {trip.travelersCount || 1} Travelers
            </span>
          </div>

          {/* Quick Action Buttons */}
          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAttachBooking}
                className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-ink-900/90 backdrop-blur-md hover:bg-ink-850 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Attach NOMADLY Booking</span>
                <span className="sm:hidden">Attach Booking</span>
              </button>
            </div>
          )}
        </div>

        {/* Banner Bottom Information */}
        <div className="relative z-10 mt-6 sm:mt-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-bold text-coral-400 uppercase tracking-widest mb-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{trip.destination}</span>
              {trip.additionalDestinations?.length > 0 && (
                <span className="text-slate-400 font-normal truncate">
                  • {trip.additionalDestinations.join(' • ')}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-display tracking-tight drop-shadow-md break-words">
              {trip.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-2 mt-1.5">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              </span>
              <span>•</span>
              <span className="text-slate-400">{trip.itemsCount || 0} activities</span>
            </p>
          </div>

          {/* Spend vs Budget Summary Pill */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-ink-900/85 backdrop-blur-md border border-white/10 shrink-0 text-left md:text-right w-full sm:w-auto">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Expenditure / Budget
            </span>
            <div className="text-base sm:text-lg font-black font-mono text-white mt-0.5">
              {formatCurrency(trip.actualSpend || 0, trip.currency)}{' '}
              <span className="text-xs font-normal text-slate-400">
                / {formatCurrency(trip.budget?.totalBudget || 50000, trip.currency)}
              </span>
            </div>
            <div className="w-full sm:w-36 h-1.5 rounded-full bg-ink-950 mt-1.5 overflow-hidden md:ml-auto">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-coral-500 rounded-full"
                style={{ width: `${Math.min(100, trip.budgetUtilization || 0)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-ink-950/90 border-t border-white/10 px-2 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none snap-x">
        {[
          { id: 'itinerary', label: 'Itinerary Builder', icon: Layers },
          { id: 'overview', label: 'Trip Overview', icon: Compass },
          { id: 'calendar', label: 'Calendar View', icon: CalendarIcon },
          { id: 'expenses', label: 'Expense Tracker', icon: Wallet },
          { id: 'splitting', label: 'Expense Splitting', icon: TrendingUp },
          { id: 'map', label: 'Trip Map', icon: Map },
          { id: 'documents', label: 'Documents', icon: FileText, count: trip.documentsCount },
          { id: 'members', label: 'Collaboration', icon: Users, count: trip.participants?.length },
        ].map((tab) => {
          const Icon = tab.icon || Layers;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 sm:py-3.5 px-2.5 sm:px-3 rounded-none border-b-2 text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap shrink-0 snap-start ${
                isActive
                  ? 'border-coral-500 text-coral-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2] shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300 font-mono">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
