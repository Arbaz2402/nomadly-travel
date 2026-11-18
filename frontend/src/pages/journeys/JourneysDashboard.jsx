import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Map,
  Plus,
  Compass,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { JourneysMetricsBar } from '../../components/journeys/dashboard/JourneysMetricsBar';
import { PendingInvitationsList } from '../../components/journeys/dashboard/PendingInvitationsList';
import { JourneysFilterBar } from '../../components/journeys/dashboard/JourneysFilterBar';
import { TripCard } from '../../components/journeys/dashboard/TripCard';

export const JourneysDashboard = () => {
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
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_asc');
  const [respondingInviteId, setRespondingInviteId] = useState(null);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setFetchError(null);
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
      setFetchError(err.message || 'Could not load journeys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [statusFilter, sortBy, user?._id]);

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

  const handleQuickDemoLogin = async () => {
    try {
      await demoSignIn('customer');
      showToast('Signed in with Demo Traveler Account!', 'success');
      fetchTrips();
    } catch (e) {
      showToast(e.message || 'Failed to sign in', 'error');
    }
  };

  const pendingInvitations = trips.filter((t) => t.participantStatus === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 mb-8 border border-white/10 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-coral-400 uppercase tracking-wider mb-1">
            <Map className="w-4 h-4" />
            <span>Collaborative Journey Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            My Travel Journeys
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Orchestrate multi-day trip itineraries, track real-time budgets, split expenses with companions, and attach reservations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/journeys/new"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Journey</span>
          </Link>
          <button
            onClick={fetchTrips}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-ink-900 hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-50"
            title="Refresh journeys"
          >
            <RefreshCw className={`w-4 h-4 text-teal-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <JourneysMetricsBar metrics={metrics} />

      {/* Pending Invitations Banner */}
      <PendingInvitationsList
        pendingInvitations={pendingInvitations}
        respondingInviteId={respondingInviteId}
        onRespondInvite={handleRespondInvite}
      />

      {/* Filter and Search Controls */}
      <JourneysFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Trips Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-10 h-10 text-coral-500 animate-spin" />
          <p className="text-sm font-semibold">Loading your journeys...</p>
        </div>
      ) : fetchError ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-coral-500/20 bg-coral-500/[0.02] max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-coral-500/10 text-coral-400 flex items-center justify-center mx-auto shadow-glow">
            <AlertCircle className="w-8 h-8 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white font-display">Could Not Load Journeys</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {fetchError}. The server may be warming up or there was a brief network interruption.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={fetchTrips}
              className="px-6 py-2.5 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {trips.map((trip) => (
            <TripCard
              key={trip._id}
              trip={trip}
              respondingInviteId={respondingInviteId}
              onRespondInvite={handleRespondInvite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
