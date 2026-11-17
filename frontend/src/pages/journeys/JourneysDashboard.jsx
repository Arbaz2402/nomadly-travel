import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Map,
  Plus,
  Search,
  Calendar,
  Users,
  Wallet,
  TrendingUp,
  Clock,
  Compass,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
  Plane,
  Building2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';

export const JourneysDashboard = () => {
  const navigate = useNavigate();
  const { user, demoSignIn } = useAuthStore();
  const { showToast } = useToast();

  const [trips, setTrips] = useState([]);
  const [metrics, setMetrics] = useState({
    totalTrips: 0,
    upcomingCount: 0,
    ongoingCount: 0,
    completedCount: 0,
    draftCount: 0,
    totalPlannedBudget: 0,
    totalActualSpend: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_asc');
  const [respondingInviteId, setRespondingInviteId] = useState(null);

  const handleRespondInvite = async (tripId, action) => {
    try {
      setRespondingInviteId(tripId);
      const res = await ApiClient.respondToTripInvitation(tripId, action);
      if (res.success) {
        showToast(
          action === 'accept'
            ? 'Invitation accepted! You have joined the journey.'
            : 'Invitation declined.',
          'success'
        );
        fetchTrips();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update invitation response', 'error');
    } finally {
      setRespondingInviteId(null);
    }
  };

  const pendingInvitations = trips.filter((t) => t.participantStatus === 'pending');

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (sortBy === 'newest') params.sort = 'newest';
      if (sortBy === 'date_desc') params.sort = 'date_desc';

      const res = await ApiClient.getMyTrips(params);
      if (res.success) {
        setTrips(res.data || []);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
    } catch (err) {
      console.error('Failed to fetch journeys:', err);
      showToast('Could not load journeys: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [statusFilter, sortBy]);

  // Handle live search submit
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrips();
  };

  const handleQuickDemoLogin = async () => {
    try {
      await demoSignIn('customer');
      showToast('Signed in as Demo Traveler', 'success');
      fetchTrips();
    } catch (err) {
      showToast('Login failed: ' + err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ongoing':
        return {
          label: 'Ongoing Now',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-400 animate-pulse',
        };
      case 'upcoming':
        return {
          label: 'Upcoming',
          bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
          dot: 'bg-teal-400',
        };
      case 'completed':
        return {
          label: 'Completed',
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          dot: 'bg-slate-400',
        };
      case 'draft':
      default:
        return {
          label: 'Draft Itinerary',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          dot: 'bg-amber-400',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Hero Banner & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-500/10 border border-coral-500/20 text-coral-400 text-xs font-bold tracking-wider uppercase mb-3">
            <Map className="w-3.5 h-3.5" />
            Independent Journey Hub
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            My Journeys
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Orchestrate multi-city itineraries, manage external reservations (Booking.com, IRCTC, MakeMyTrip), track planned vs. actual expenses, and split costs with travel companions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/journeys/new"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white font-bold text-xs tracking-wide shadow-glow flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Create New Trip
          </Link>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Trips */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-gradient-to-br from-ink-900/90 to-ink-900/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Journeys</span>
            <div className="w-8 h-8 rounded-xl bg-coral-500/10 text-coral-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{metrics.totalTrips}</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-teal-400 font-bold">{metrics.upcomingCount}</span> upcoming •{' '}
            <span className="text-emerald-400 font-bold">{metrics.ongoingCount}</span> ongoing
          </p>
        </div>

        {/* Planned Budget */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-gradient-to-br from-ink-900/90 to-ink-900/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Planned Budget</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatCurrency(metrics.totalPlannedBudget, 'INR')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sum of all trip targets</p>
        </div>

        {/* Actual Expenditure */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-gradient-to-br from-ink-900/90 to-ink-900/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Actual Spent</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatCurrency(metrics.totalActualSpend, 'INR')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Recorded expenses & bookings</p>
        </div>

        {/* Completed & Archive */}
        <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-gradient-to-br from-ink-900/90 to-ink-900/40">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">{metrics.completedCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Archived travel memories</p>
        </div>
      </div>

      {/* Pending Journey Invitations Banner Section */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Pending Journey Invitations ({pendingInvitations.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingInvitations.map((inviteTrip) => (
              <div
                key={inviteTrip._id}
                className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-coral-500/10 to-ink-900 border border-amber-500/30 shadow-xl flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={inviteTrip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80'}
                    alt={inviteTrip.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Invited by {inviteTrip.inviterName || 'Traveler'}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1 truncate">{inviteTrip.title}</h4>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                      <Map className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="truncate">{inviteTrip.destination}</span>
                      <span className="text-slate-500">&bull;</span>
                      <span className="capitalize font-semibold text-coral-400">{inviteTrip.userRole || 'Editor'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleRespondInvite(inviteTrip._id, 'decline')}
                    disabled={respondingInviteId === inviteTrip._id}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-semibold border border-white/10 hover:border-rose-500/20 transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleRespondInvite(inviteTrip._id, 'accept')}
                    disabled={respondingInviteId === inviteTrip._id}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 text-white text-xs font-bold shadow-glow flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{respondingInviteId === inviteTrip._id ? 'Joining...' : 'Accept & Join Trip'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-ink-900/60 p-2.5 rounded-2xl border border-white/10">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1">
          {[
            { id: 'all', label: 'All Trips' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'ongoing', label: 'Ongoing' },
            { id: 'completed', label: 'Completed' },
            { id: 'draft', label: 'Drafts' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-coral-500 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search destination or trip..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-ink-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-coral-500"
            />
          </form>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-ink-950/80 border border-white/10 text-xs text-slate-300 font-semibold focus:outline-none focus:border-coral-500"
          >
            <option value="date_asc">Date: Upcoming first</option>
            <option value="date_desc">Date: Furthest first</option>
            <option value="newest">Recently created</option>
          </select>
        </div>
      </div>

      {/* Trips Grid / List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-10 h-10 text-coral-500 animate-spin" />
          <p className="text-sm font-semibold">Loading your journeys...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-coral-500/10 text-coral-400 flex items-center justify-center mx-auto shadow-glow">
            <Compass className="w-8 h-8 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-display">No Journeys Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? 'No trips matched your current filters. Try resetting the search or filter.'
                : 'You have not created any trips yet. Plan your dream vacation, road trip, or weekend getaway with independent itineraries!'}
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/journeys/new"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white text-xs font-bold shadow-glow flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Start Planning a Journey
            </Link>
            {!user && (
              <button
                onClick={handleQuickDemoLogin}
                className="px-5 py-3 rounded-2xl bg-ink-900 border border-white/10 hover:border-coral-500/50 text-slate-300 text-xs font-bold flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-coral-400" />
                Explore Seeded Demo Trip
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const statusConfig = getStatusBadge(trip.dynamicStatus || trip.status);
            const totalBudget = trip.budget?.totalBudget || 50000;
            const actualSpend = trip.actualSpend || 0;
            const utilization = trip.budgetUtilization || 0;

            return (
              <div
                key={trip._id}
                onClick={() => navigate(`/journeys/${trip._id}`)}
                className="group relative rounded-3xl bg-ink-900/90 border border-white/10 hover:border-coral-500/40 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
              >
                {/* Trip Cover Image Header */}
                <div className="relative h-48 w-full overflow-hidden bg-ink-950">
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
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                    {trip.participantStatus === 'pending' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-sm">
                        <Clock className="w-3 h-3 animate-pulse text-amber-400" />
                        Invite Pending
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border backdrop-blur-md ${statusConfig.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                        {statusConfig.label}
                      </span>
                    )}

                    <span className="px-2.5 py-1 rounded-full bg-ink-950/80 backdrop-blur-md text-slate-300 border border-white/10 text-[11px] font-semibold flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-coral-400" />
                      {trip.travelersCount || 1}
                    </span>
                  </div>

                  {/* Destination Overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-coral-400 block">
                      Primary Destination
                    </span>
                    <h3 className="text-xl font-black text-white font-display tracking-tight drop-shadow-md truncate">
                      {trip.destination}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
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
                            onClick={() => handleRespondInvite(trip._id, 'decline')}
                            disabled={respondingInviteId === trip._id}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-[11px] font-semibold transition-colors disabled:opacity-50"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleRespondInvite(trip._id, 'accept')}
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
          })}
        </div>
      )}
    </div>
  );
};
