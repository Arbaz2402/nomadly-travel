import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Clock, ArrowRight } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const getStatusBadge = (status = 'upcoming') => {
  switch (status.toLowerCase()) {
    case 'ongoing':
    case 'in_progress':
      return {
        label: 'In Progress',
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        dot: 'bg-amber-400 animate-pulse',
      };
    case 'completed':
      return {
        label: 'Completed',
        bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
        dot: 'bg-teal-400',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        dot: 'bg-rose-400',
      };
    case 'draft':
      return {
        label: 'Draft',
        bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        dot: 'bg-slate-400',
      };
    default:
      return {
        label: 'Upcoming',
        bg: 'bg-coral-500/10 text-coral-400 border-coral-500/20',
        dot: 'bg-coral-400',
      };
  }
};

export const TripCard = ({ trip, respondingInviteId, onRespondInvite }) => {
  const navigate = useNavigate();
  const statusConfig = getStatusBadge(trip.dynamicStatus || trip.status);
  const totalBudget = trip.budget?.totalBudget || 50000;
  const actualSpend = trip.actualSpend || 0;
  const utilization = trip.budgetUtilization || 0;

  return (
    <div
      onClick={() => navigate(`/journeys/${trip._id}`)}
      className="group relative rounded-3xl bg-ink-900/90 border border-white/10 hover:border-coral-500/40 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col min-w-0"
    >
      {/* Trip Cover Image Header */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-ink-950">
        <img
          src={trip.coverImage}
          alt={trip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />

        {/* Status & Category Badges */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between gap-1.5 sm:gap-2">
          {trip.participantStatus === 'pending' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-sm truncate">
              <Clock className="w-3 h-3 animate-pulse text-amber-400 shrink-0" />
              Invite Pending
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md truncate ${statusConfig.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
          )}

          <span className="px-2 sm:px-2.5 py-1 rounded-full bg-ink-950/80 backdrop-blur-md text-slate-300 border border-white/10 text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-coral-400" />
            {trip.travelersCount || 1}
          </span>
        </div>

        {/* Destination Overlay */}
        <div className="absolute bottom-3 left-3 sm:left-4 right-3 sm:right-4">
          <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-coral-400 block truncate">
            Primary Destination
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white font-display tracking-tight drop-shadow-md truncate">
            {trip.destination}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
        <div>
          {/* Trip Title */}
          <h4 className="text-base font-bold text-white group-hover:text-coral-400 transition-colors line-clamp-1">
            {trip.title}
          </h4>

          {/* Date Span */}
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>
              {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
            </span>
          </p>

          {/* Additional Destinations Tags */}
          {trip.additionalDestinations && trip.additionalDestinations.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {trip.additionalDestinations.slice(0, 3).map((dest, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5"
                >
                  {dest}
                </span>
              ))}
              {trip.additionalDestinations.length > 3 && (
                <span className="text-[10px] text-slate-500 font-semibold self-center">
                  +{trip.additionalDestinations.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Pending Invitation Alert in Card */}
          {trip.participantStatus === 'pending' && (
            <div
              className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 mt-3"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[11px] font-semibold text-amber-300">
                Invited as <strong className="capitalize text-white">{trip.userRole || 'Editor'}</strong>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onRespondInvite(trip._id, 'decline')}
                  disabled={respondingInviteId === trip._id}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-[11px] font-semibold transition-colors disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => onRespondInvite(trip._id, 'accept')}
                  disabled={respondingInviteId === trip._id}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-[11px] font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  Accept
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Budget & Spend Progress */}
        <div className="pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Budget Spent</span>
            <span className="font-mono font-bold text-slate-200">
              {formatCurrency(actualSpend, trip.currency || 'INR')}{' '}
              <span className="text-slate-500 font-normal">
                / {formatCurrency(totalBudget, trip.currency || 'INR')}
              </span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-ink-950 overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                utilization > 100
                  ? 'bg-rose-500'
                  : utilization > 80
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-teal-500 to-coral-500'
              }`}
              style={{ width: `${Math.min(100, utilization)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>{trip.itemsCount || 0} planned activities</span>
            <span className="flex items-center gap-1 text-coral-400 font-bold group-hover:translate-x-1 transition-transform">
              Open Workspace
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
