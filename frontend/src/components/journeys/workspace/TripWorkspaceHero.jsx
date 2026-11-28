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
  Luggage,
  Play,
  CheckCircle2,
  Clock,
  RotateCcw,
  Edit2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export const TripWorkspaceHero = ({
  trip,
  canEdit,
  activeTab,
  setActiveTab,
  onOpenAttachBooking,
  onUpdateStatus,
  onOpenEditTrip,
}) => {
  const status = trip.dynamicStatus || trip.status || 'upcoming';

  // Compute countdown / active day progress from dates
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const dayMs = 1000 * 60 * 60 * 24;
  const totalDays = Math.max(1, Math.ceil((end - start) / dayMs) + 1);
  const daysUntilStart = Math.ceil((start - now) / dayMs);
  const currentDay = Math.min(totalDays, Math.max(1, Math.floor((now - start) / dayMs) + 1));

  const packedCount = (trip.packingList || []).reduce(
    (sum, cat) => sum + (cat.items?.filter((i) => i.packed).length || 0),
    0
  );
  const totalPackItems = (trip.packingList || []).reduce(
    (sum, cat) => sum + (cat.items?.length || 0),
    0
  );
  const activeCollabCount = (trip.participants || []).filter(
    (p) => !p.status || p.status === 'accepted' || p.role === 'owner'
  ).length;
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
            <span
              className={`px-3 py-1 rounded-full bg-ink-950/80 backdrop-blur-md border text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider ${
                status === 'ongoing'
                  ? 'border-emerald-500/40 text-emerald-400'
                  : status === 'completed'
                  ? 'border-blue-500/40 text-blue-400'
                  : 'border-white/10 text-teal-400'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  status === 'ongoing'
                    ? 'bg-emerald-400 animate-pulse'
                    : status === 'completed'
                    ? 'bg-blue-400'
                    : 'bg-teal-400'
                }`}
              />
              {status === 'ongoing'
                ? `LIVE • DAY ${currentDay} OF ${totalDays}`
                : status === 'upcoming' && daysUntilStart >= 0
                ? daysUntilStart === 0
                  ? 'STARTS TODAY'
                  : `STARTS IN ${daysUntilStart}D`
                : status.toUpperCase()}
            </span>
            <span className="px-3 py-1 rounded-full bg-ink-950/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-coral-400" />
              {trip.travelersCount || 1} Travelers
            </span>
          </div>

          {/* Quick Action Buttons: Start / Complete Journey + Attach Booking */}
          {canEdit && (
            <div className="flex flex-wrap items-center gap-2">
              {status !== 'ongoing' && status !== 'completed' && onUpdateStatus && (
                <button
                  onClick={() => onUpdateStatus('ongoing')}
                  className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all"
                  title="Start this journey now and enter Live Active Mode"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Journey</span>
                </button>
              )}

              {status === 'ongoing' && onUpdateStatus && (
                <button
                  onClick={() => onUpdateStatus('completed')}
                  className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
                  title="Mark this journey as completed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Complete Journey</span>
                </button>
              )}

              {status === 'completed' && onUpdateStatus && (
                <button
                  onClick={() => onUpdateStatus('ongoing')}
                  className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all"
                  title="Start or reopen this journey"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start / Reopen Journey</span>
                </button>
              )}

              {onOpenEditTrip && (
                <button
                  onClick={onOpenEditTrip}
                  className="px-3 py-1.5 sm:py-2 rounded-xl bg-ink-900/90 hover:bg-ink-850 border border-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
                  title="Edit journey dates, title, or budget"
                >
                  <Edit2 className="w-3.5 h-3.5 text-coral-400" />
                  <span className="hidden sm:inline">Edit Dates</span>
                </button>
              )}

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
      <div className="bg-ink-950/90 border-t border-white/10 px-3 sm:px-5 flex items-center gap-1 lg:gap-1.5 overflow-x-auto md:overflow-visible md:flex-wrap scrollbar-none snap-x">
        {[
          { id: 'itinerary', label: 'Itinerary', icon: Layers },
          { id: 'overview', label: 'Overview', icon: Compass },
          { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
          { id: 'expenses', label: 'Expenses', icon: Wallet },
          { id: 'splitting', label: 'Splitting', icon: TrendingUp },
          { id: 'packing', label: 'Packing', icon: Luggage, count: totalPackItems > 0 ? `${packedCount}/${totalPackItems}` : undefined },
          { id: 'map', label: 'Trip Map', icon: Map },
          { id: 'documents', label: 'Documents', icon: FileText, count: trip.documentsCount },
          { id: 'members', label: 'Collaboration', icon: Users, count: activeCollabCount },
        ].map((tab) => {
          const Icon = tab.icon || Layers;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 sm:py-3.5 px-2.5 sm:px-3 rounded-none border-b-2 text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 snap-start ${
                isActive
                  ? 'border-coral-500 text-coral-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2] shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (typeof tab.count === 'string' || tab.count > 0) && (
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
