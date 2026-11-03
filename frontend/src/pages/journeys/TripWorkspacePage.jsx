import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Map,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Wallet,
  TrendingUp,
  Plus,
  ArrowLeft,
  Share2,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign,
  FileText,
  Upload,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Plane,
  Building2,
  Train,
  Bus,
  Utensils,
  Camera,
  ShoppingBag,
  Car,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Layers,
  ArrowRight,
  UserPlus,
  X,
  Check,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { ApiClient } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { AttachBookingModal } from '../../components/journeys/AttachBookingModal';

const CATEGORY_ICONS = {
  flight: Plane,
  hotel: Building2,
  train: Train,
  bus: Bus,
  car_rental: Car,
  restaurant: Utensils,
  sightseeing: Camera,
  activities: Camera,
  shopping: ShoppingBag,
  other: MapPin,
};

const CATEGORY_COLORS = {
  flight: '#38bdf8',
  hotel: '#fb923c',
  train: '#a78bfa',
  bus: '#34d399',
  car_rental: '#f43f5e',
  restaurant: '#facc15',
  sightseeing: '#e879f9',
  activities: '#2dd4bf',
  shopping: '#f472b6',
  other: '#94a3b8',
};

const CHART_COLORS = ['#ff5a36', '#14b8a6', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];

export const TripWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('itinerary');

  // Modal states
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [uploadDocOpen, setUploadDocOpen] = useState(false);

  // Tab data states
  const [itinerary, setItinerary] = useState({ groupedByDay: {}, warnings: [], data: [] });
  const [expenses, setExpenses] = useState({ data: [], summary: {} });
  const [settlement, setSettlement] = useState({ memberBalances: [], settlementPlan: [] });
  const [analytics, setAnalytics] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Fetch Full Trip Info
  const fetchTripData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await ApiClient.getTripById(id);
      if (res && res.success && res.data) {
        setTrip(res.data);
      } else {
        setLoadError(res?.message || 'Journey record could not be loaded.');
      }
    } catch (err) {
      console.error('Trip fetch error:', err);
      setLoadError(err.message || 'Could not load journey.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTripData();
    }
  }, [id]);

  // Fetch Sub-tab specific data
  const loadTabData = async (tab) => {
    if (!id) return;
    try {
      if (tab === 'itinerary' || tab === 'calendar' || tab === 'map') {
        const res = await ApiClient.getTripItinerary(id);
        if (res.success) setItinerary(res);
      }
      if (tab === 'expenses' || tab === 'overview') {
        const res = await ApiClient.getTripExpenses(id);
        if (res.success) setExpenses(res);
        const aRes = await ApiClient.getTripAnalytics(id);
        if (aRes.success) setAnalytics(aRes.data);
      }
      if (tab === 'splitting') {
        const res = await ApiClient.getTripSettlement(id);
        if (res.success) setSettlement(res.data);
      }
      if (tab === 'members') {
        const res = await ApiClient.getTripParticipants(id);
        if (res.success) setParticipants(res.data);
      }
      if (tab === 'documents') {
        const res = await ApiClient.getTripDocuments(id);
        if (res.success) setDocuments(res.data);
      }
      if (tab === 'overview') {
        const logsRes = await ApiClient.getTripActivityLogs(id);
        if (logsRes.success) setActivityLogs(logsRes.data);
      }
    } catch (err) {
      console.warn('Tab load failed:', err.message);
    }
  };

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab, id]);

  const handleDeleteTrip = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${trip.title}" and all its records?`)) {
      return;
    }
    try {
      const res = await ApiClient.deleteTrip(trip._id);
      if (res.success) {
        showToast('Journey deleted', 'info');
        navigate('/journeys');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete journey', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-10 h-10 text-coral-500 animate-spin" />
        <p className="text-sm font-semibold">Loading Journey Workspace...</p>
      </div>
    );
  }

  if (loadError || !trip) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="glass-panel p-8 max-w-md w-full text-center rounded-3xl border border-white/10 space-y-4 shadow-2xl bg-ink-900/90">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white font-display">Journey Not Accessible</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {loadError || 'This journey does not exist or you do not have permission to view it.'}
          </p>
          {user && (
            <p className="text-[11px] text-slate-500">
              Signed in as: <span className="text-slate-300 font-semibold">{user.email}</span>
            </p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              to="/journeys"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs shadow-glow transition-all"
            >
              Back to My Journeys
            </Link>
            <button
              onClick={fetchTripData}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = trip.userRole === 'owner';
  const canEdit = trip.userRole === 'owner' || trip.userRole === 'editor';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Back link */}
      <div className="flex items-center justify-between">
        <Link
          to="/journeys"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Journeys
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            Role: <span className="text-teal-400">{trip.userRole?.toUpperCase()}</span>
          </span>
          {isOwner && (
            <button
              onClick={handleDeleteTrip}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete Journey"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Master Trip Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-ink-900 shadow-2xl">
        <div className="relative h-60 sm:h-72 w-full overflow-hidden">
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
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
                  onClick={() => setAttachModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-ink-900/90 backdrop-blur-md hover:bg-ink-850 border border-white/15 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  Attach NOMADLY Booking
                </button>
              </div>
            )}
          </div>

          {/* Banner Bottom Information */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-coral-400 uppercase tracking-widest mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{trip.destination}</span>
                {trip.additionalDestinations?.length > 0 && (
                  <span className="text-slate-400 font-normal">
                    • {trip.additionalDestinations.join(' • ')}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight drop-shadow-md">
                {trip.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 mt-1">
                <CalendarIcon className="w-3.5 h-3.5 text-teal-400" />
                <span>
                  {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                </span>
                <span>•</span>
                <span className="text-slate-400">{trip.itemsCount || 0} activities</span>
              </p>
            </div>

            {/* Spend vs Budget Summary Pill */}
            <div className="p-3.5 rounded-2xl bg-ink-900/80 backdrop-blur-md border border-white/10 shrink-0 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Expenditure / Budget
              </span>
              <div className="text-lg font-black font-mono text-white mt-0.5">
                {formatCurrency(trip.actualSpend || 0, trip.currency)}{' '}
                <span className="text-xs font-normal text-slate-400">
                  / {formatCurrency(trip.budget?.totalBudget || 50000, trip.currency)}
                </span>
              </div>
              <div className="w-36 h-1.5 rounded-full bg-ink-950 mt-1.5 overflow-hidden ml-auto">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-coral-500 rounded-full"
                  style={{ width: `${Math.min(100, trip.budgetUtilization || 0)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-ink-950/80 border-t border-white/10 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto">
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
                className={`py-3.5 px-3 rounded-none border-b-2 text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-coral-500 text-coral-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2]" />
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

      {/* TAB CONTENT VIEWS */}

      {/* 1. ITINERARY BUILDER */}
      {activeTab === 'itinerary' && (
        <ItineraryView
          trip={trip}
          itinerary={itinerary}
          canEdit={canEdit}
          onRefresh={() => loadTabData('itinerary')}
          onOpenAddActivity={() => setAddActivityOpen(true)}
          onOpenAttachBooking={() => setAttachModalOpen(true)}
        />
      )}

      {/* 2. TRIP OVERVIEW */}
      {activeTab === 'overview' && (
        <OverviewView
          trip={trip}
          analytics={analytics}
          expenses={expenses}
          activityLogs={activityLogs}
          onSwitchTab={(t) => setActiveTab(t)}
        />
      )}

      {/* 3. CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <CalendarView
          trip={trip}
          itinerary={itinerary}
          onOpenAddActivity={() => setAddActivityOpen(true)}
        />
      )}

      {/* 4. EXPENSE TRACKER */}
      {activeTab === 'expenses' && (
        <ExpensesView
          trip={trip}
          expenses={expenses}
          analytics={analytics}
          canEdit={canEdit}
          onRefresh={() => loadTabData('expenses')}
          onOpenAddExpense={() => setAddExpenseOpen(true)}
        />
      )}

      {/* 5. EXPENSE SPLITTING & SETTLEMENT */}
      {activeTab === 'splitting' && (
        <SplittingView
          trip={trip}
          settlement={settlement}
          onRefresh={() => loadTabData('splitting')}
        />
      )}

      {/* 6. TRIP MAP */}
      {activeTab === 'map' && <TripMapView trip={trip} itinerary={itinerary} />}

      {/* 7. TRIP DOCUMENTS VAULT */}
      {activeTab === 'documents' && (
        <DocumentsView
          trip={trip}
          documents={documents}
          canEdit={canEdit}
          onRefresh={() => loadTabData('documents')}
          onOpenUpload={() => setUploadDocOpen(true)}
        />
      )}

      {/* 8. COLLABORATION & MEMBERS */}
      {activeTab === 'members' && (
        <MembersView
          trip={trip}
          participants={participants}
          isOwner={isOwner}
          onRefresh={() => loadTabData('members')}
          onOpenAddMember={() => setAddMemberOpen(true)}
        />
      )}

      {/* MODALS */}

      {/* Attach Booking Modal */}
      <AttachBookingModal
        trip={trip}
        isOpen={attachModalOpen}
        onClose={() => setAttachModalOpen(false)}
        onAttached={() => {
          fetchTripData();
          loadTabData(activeTab);
        }}
      />

      {/* Add Activity Modal */}
      {addActivityOpen && (
        <AddActivityModal
          trip={trip}
          isOpen={addActivityOpen}
          onClose={() => setAddActivityOpen(false)}
          onCreated={() => {
            fetchTripData();
            loadTabData('itinerary');
          }}
        />
      )}

      {/* Add Expense Modal */}
      {addExpenseOpen && (
        <AddExpenseModal
          trip={trip}
          isOpen={addExpenseOpen}
          onClose={() => setAddExpenseOpen(false)}
          onCreated={() => {
            fetchTripData();
            loadTabData('expenses');
          }}
        />
      )}

      {/* Add Member Modal */}
      {addMemberOpen && (
        <AddMemberModal
          trip={trip}
          isOpen={addMemberOpen}
          onClose={() => setAddMemberOpen(false)}
          onCreated={() => {
            fetchTripData();
            loadTabData('members');
          }}
        />
      )}

      {/* Upload Document Modal */}
      {uploadDocOpen && (
        <UploadDocModal
          trip={trip}
          isOpen={uploadDocOpen}
          onClose={() => setUploadDocOpen(false)}
          onUploaded={() => {
            fetchTripData();
            loadTabData('documents');
          }}
        />
      )}
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: ITINERARY VIEW (DRAG, OVERLAPS, CATEGORIES)
// =========================================================
const ItineraryView = ({
  trip,
  itinerary,
  canEdit,
  onRefresh,
  onOpenAddActivity,
  onOpenAttachBooking,
}) => {
  const { showToast } = useToast();
  const dayKeys = Object.keys(itinerary.groupedByDay || {}).sort();

  const handleDeleteItem = async (itemId, title) => {
    if (!window.confirm(`Delete activity "${title}" from itinerary?`)) return;
    try {
      const res = await ApiClient.deleteItineraryItem(trip._id, itemId);
      if (res.success) {
        showToast('Activity removed', 'info');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete activity', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Scheduling Warnings Banner */}
      {itinerary.warnings && itinerary.warnings.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            Scheduling & Conflict Alerts ({itinerary.warnings.length})
          </div>
          <ul className="text-xs space-y-1 pl-6 list-disc text-amber-200">
            {itinerary.warnings.map((w, idx) => (
              <li key={idx}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Top Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-900/60 p-4 rounded-2xl border border-white/5">
        <div>
          <h3 className="text-base font-bold text-white font-display">Daily Timeline</h3>
          <p className="text-xs text-slate-400">
            Chronological itinerary organized by day with conflict detection and external reservations.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAttachBooking}
              className="px-3.5 py-2 rounded-xl bg-ink-800 hover:bg-ink-700 text-slate-200 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Attach Booking
            </button>
            <button
              onClick={onOpenAddActivity}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </div>
        )}
      </div>

      {/* Days List */}
      {dayKeys.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 space-y-3">
          <MapPin className="w-10 h-10 text-slate-500 mx-auto" />
          <h4 className="text-base font-bold text-white">No activities planned yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Build your custom travel itinerary! Add flights, hotels, express trains, local restaurants, or sightseeing stops.
          </p>
          {canEdit && (
            <button
              onClick={onOpenAddActivity}
              className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs shadow-glow inline-flex items-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" />
              Add First Activity
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {dayKeys.map((dateStr, dayIndex) => {
            const items = itinerary.groupedByDay[dateStr] || [];
            return (
              <div
                key={dateStr}
                className="rounded-3xl bg-ink-900/60 border border-white/5 overflow-hidden"
              >
                {/* Day Header */}
                <div className="bg-ink-950/80 px-6 py-3.5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-coral-500/10 text-coral-400 border border-coral-500/20 font-bold text-xs flex items-center justify-center font-mono">
                      {dayIndex + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {new Date(dateStr).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {items.length} {items.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {/* Day Activities */}
                <div className="p-4 sm:p-6 space-y-3">
                  {items.map((item) => {
                    const Icon = CATEGORY_ICONS[item.category] || MapPin;
                    const catColor = CATEGORY_COLORS[item.category] || '#ff5a36';

                    return (
                      <div
                        key={item._id}
                        className="p-4 rounded-2xl bg-ink-850/80 hover:bg-ink-850 border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          {/* Time & Category Icon */}
                          <div className="flex flex-col items-center shrink-0">
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                              style={{ backgroundColor: `${catColor}20`, color: catColor }}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 mt-1.5 font-bold">
                              {item.startTime}
                            </span>
                          </div>

                          {/* Activity Details */}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h5 className="text-sm font-bold text-white">{item.title}</h5>

                              {/* Source Badge */}
                              {item.sourceType === 'nomadly_booking' ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  NOMADLY Confirmed
                                </span>
                              ) : item.sourceType === 'external_booking' ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" />
                                  {item.externalProvider || 'External Booking'}
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                                  Manual
                                </span>
                              )}

                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-white/5 text-slate-300">
                                {item.status}
                              </span>
                            </div>

                            {item.description && (
                              <p className="text-xs text-slate-300">{item.description}</p>
                            )}

                            {/* Location & Timespan */}
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                              {item.location?.name && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-coral-400" />
                                  {item.location.name}
                                </span>
                              )}
                              <span>
                                {item.startTime} — {item.endTime}
                              </span>
                              {item.bookingReference && (
                                <span className="font-mono text-slate-300 bg-ink-950 px-1.5 py-0.5 rounded border border-white/5">
                                  Ref: {item.bookingReference}
                                </span>
                              )}
                            </div>

                            {item.notes && (
                              <p className="text-[11px] text-slate-400 italic">"{item.notes}"</p>
                            )}
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          {item.actualCost > 0 && (
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-teal-400">
                                {formatCurrency(item.actualCost, item.currency || trip.currency)}
                              </span>
                              <span className="text-[10px] text-slate-500 block">Actual Cost</span>
                            </div>
                          )}

                          {canEdit && (
                            <button
                              onClick={() => handleDeleteItem(item._id, item.title)}
                              className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete Activity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: TRIP OVERVIEW TAB
// =========================================================
const OverviewView = ({ trip, analytics, expenses, activityLogs, onSwitchTab }) => {
  const budget = trip.budget?.totalBudget || 50000;
  const spent = trip.actualSpend || 0;
  const remaining = Math.max(0, budget - spent);
  const utilization = trip.budgetUtilization || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Financials & Highlights */}
      <div className="lg:col-span-2 space-y-6">
        {/* Budget Progress Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display">Budget Telemetry</h3>
            <button
              onClick={() => onSwitchTab('expenses')}
              className="text-xs text-coral-400 hover:underline font-semibold flex items-center gap-1"
            >
              View Full Tracker <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3.5 rounded-2xl bg-ink-950 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Budget</span>
              <span className="text-base sm:text-lg font-black font-mono text-white mt-0.5 block">
                {formatCurrency(budget, trip.currency)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-ink-950 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Spent</span>
              <span className="text-base sm:text-lg font-black font-mono text-teal-400 mt-0.5 block">
                {formatCurrency(spent, trip.currency)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-ink-950 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Remaining</span>
              <span className="text-base sm:text-lg font-black font-mono text-coral-400 mt-0.5 block">
                {formatCurrency(remaining, trip.currency)}
              </span>
            </div>
          </div>

          {/* Progress Gauge */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-400 font-semibold">
              <span>Utilization ({utilization}%)</span>
              <span>
                {spent > budget ? 'Budget exceeded!' : `${Math.round(100 - utilization)}% available`}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-ink-950 overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  utilization > 100
                    ? 'bg-rose-500'
                    : utilization > 80
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-teal-400 to-coral-500'
                }`}
                style={{ width: `${Math.min(100, utilization)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Route Highlights */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <h3 className="text-base font-bold text-white font-display">Destinations & Route</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-coral-500/10 border border-coral-500/30 text-coral-400 font-bold text-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Primary: {trip.destination}
            </span>
            {trip.additionalDestinations?.map((dest, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold"
              >
                {dest}
              </span>
            ))}
          </div>
          {trip.description && (
            <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/5">
              {trip.description}
            </p>
          )}
        </div>
      </div>

      {/* Right Col: Activity Log Stream */}
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
            <Clock className="w-4 h-4" />
            Recent Activity & Collaboration
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No activity logged yet.</p>
            ) : (
              activityLogs.map((log) => (
                <div key={log._id} className="text-xs pb-3 border-b border-white/5 space-y-0.5">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-bold text-slate-200">{log.userName}</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-300">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: CALENDAR VIEW
// =========================================================
const CalendarView = ({ trip, itinerary, onOpenAddActivity }) => {
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  // Generate all dates in trip
  const dates = [];
  const curr = new Date(start);
  while (curr <= end) {
    dates.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-display">Journey Calendar</h3>
          <p className="text-xs text-slate-400">View all activities across the chronological itinerary.</p>
        </div>
        <button
          onClick={onOpenAddActivity}
          className="px-3.5 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {dates.map((d) => {
          const dateKey = d.toISOString().split('T')[0];
          const items = itinerary.groupedByDay?.[dateKey] || [];

          return (
            <div
              key={dateKey}
              className="p-4 rounded-2xl bg-ink-950/80 border border-white/10 flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                  <span className="text-xs font-bold text-slate-300">
                    {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                    {items.length} items
                  </span>
                </div>

                <div className="space-y-1.5">
                  {items.map((it) => (
                    <div
                      key={it._id}
                      className="p-1.5 rounded-lg bg-ink-900 border border-white/5 text-[11px] truncate flex items-center gap-1.5"
                    >
                      <span className="text-[9px] font-mono font-bold text-coral-400 shrink-0">
                        {it.startTime}
                      </span>
                      <span className="text-slate-200 truncate">{it.title}</span>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <span className="text-[11px] text-slate-500 italic block pt-2">Free day</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: EXPENSE TRACKER (MULTI-CURRENCY & CHARTS)
// =========================================================
const ExpensesView = ({ trip, expenses, analytics, canEdit, onRefresh, onOpenAddExpense }) => {
  const { showToast } = useToast();

  const handleDeleteExpense = async (expId, title) => {
    if (!window.confirm(`Delete expense "${title}"?`)) return;
    try {
      const res = await ApiClient.deleteTripExpense(trip._id, expId);
      if (res.success) {
        showToast('Expense record deleted', 'info');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  const chartData = analytics?.categoryBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-900/60 p-4 rounded-2xl border border-white/5">
        <div>
          <h3 className="text-base font-bold text-white font-display">Expense Management</h3>
          <p className="text-xs text-slate-400">
            Multi-currency conversions, planned vs. actual analytics, and category breakdown.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={onOpenAddExpense}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
          >
            <Plus className="w-4 h-4" /> Record Expense
          </button>
        )}
      </div>

      {/* Visual Analytics Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Category Spending Breakdown
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={4}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b132b', border: '1px solid rgba(255,255,255,0.1)' }}
                    formatter={(val) => formatCurrency(val, trip.currency)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Daily Spending Timeline
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.dailySpending || []}>
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b132b', border: '1px solid rgba(255,255,255,0.1)' }}
                    formatter={(val) => formatCurrency(val, trip.currency)}
                  />
                  <Bar dataKey="amount" fill="#ff5a36" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Expense List */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-4 bg-ink-950/80 border-b border-white/5 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span>Expense Item</span>
          <span>Amount & Converted</span>
        </div>

        <div className="divide-y divide-white/5">
          {expenses.data?.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No expenses recorded yet.</div>
          ) : (
            expenses.data.map((exp) => (
              <div
                key={exp._id}
                className="p-4 hover:bg-white/[0.02] flex items-center justify-between gap-4 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{exp.title}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                      {exp.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Paid by <span className="font-semibold text-slate-300">{exp.paidBy?.name}</span> on{' '}
                    {formatDate(exp.date)}
                    {exp.currency !== trip.currency && (
                      <span className="text-teal-400 ml-1.5">
                        (Rate: 1 {exp.currency} = {exp.exchangeRate} {trip.currency})
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-white block">
                      {formatCurrency(exp.convertedAmount || exp.amount, trip.currency)}
                    </span>
                    {exp.currency !== trip.currency && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Orig: {exp.amount} {exp.currency}
                      </span>
                    )}
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => handleDeleteExpense(exp._id, exp.title)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: EXPENSE SPLITTING & SETTLEMENT
// =========================================================
const SplittingView = ({ trip, settlement, onRefresh }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-ink-900/60 p-5 rounded-2xl border border-white/5">
        <h3 className="text-base font-bold text-white font-display">Who Owes Whom</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Automated debt minimization algorithm simplifies group payments into the fewest possible transactions.
        </p>
      </div>

      {/* Simplified Debt Settlement Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-coral-400">
          Suggested Settlement Transactions
        </h4>

        {settlement.settlementPlan?.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-3xl border border-white/10 text-xs text-slate-400">
            All expenses are fully settled! No payments are owed.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settlement.settlementPlan.map((s, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center">
                    {s.from.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{s.from}</p>
                    <p className="text-[10px] text-slate-400">owes</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-coral-400" />
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center">
                    {s.to.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{s.to}</p>
                    <p className="text-[10px] text-slate-400">creditor</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {formatCurrency(s.amount, trip.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Balances Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-4 bg-ink-950/80 border-b border-white/5 text-xs text-slate-400 font-bold uppercase tracking-wider">
          Individual Balances
        </div>
        <div className="divide-y divide-white/5">
          {settlement.memberBalances?.map((m, i) => (
            <div key={i} className="p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white">{m.name}</span>
                <span className="text-[11px] text-slate-400 block">{m.email || 'Participant'}</span>
              </div>
              <div className="flex items-center gap-6 text-right font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">Paid</span>
                  <span className="text-slate-200">{formatCurrency(m.totalPaid, trip.currency)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Share</span>
                  <span className="text-slate-200">{formatCurrency(m.totalOwed, trip.currency)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Net</span>
                  <span
                    className={`font-bold ${
                      m.netBalance > 0
                        ? 'text-teal-400'
                        : m.netBalance < 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {m.netBalance > 0 ? '+' : ''}
                    {formatCurrency(m.netBalance, trip.currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: TRIP MAP VIEW
// =========================================================
const TripMapView = ({ trip, itinerary }) => {
  const allStops = [];

  // Add primary destination
  allStops.push({
    title: trip.destination,
    type: 'Primary Destination',
    address: trip.destination,
  });

  // Add additional destinations
  (trip.additionalDestinations || []).forEach((dest) => {
    allStops.push({
      title: dest,
      type: 'Stop',
      address: dest,
    });
  });

  // Add itinerary locations
  (itinerary.data || []).forEach((it) => {
    if (it.location?.name) {
      allStops.push({
        title: it.title,
        type: it.category,
        address: it.location.address || it.location.name,
      });
    }
  });

  const openGoogleMapsDirections = (destinationAddress) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationAddress)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-ink-900/60 p-5 rounded-2xl border border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white font-display">Route Map & Stop Sequence</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic overview of destinations, transit legs, and sightseeing locations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allStops.map((stop, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 hover:border-coral-500/40 transition-all flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-xl bg-coral-500/10 text-coral-400 border border-coral-500/20 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                #{idx + 1}
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-400">{stop.type}</span>
                <h4 className="text-sm font-bold text-white leading-tight">{stop.title}</h4>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-coral-400 shrink-0" />
                  <span className="truncate">{stop.address}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => openGoogleMapsDirections(stop.address)}
              className="w-full py-2 px-3 rounded-xl bg-ink-950 hover:bg-ink-850 text-slate-200 border border-white/5 hover:border-coral-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-coral-400" />
              Open in Google Maps Directions
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: TRIP DOCUMENTS VAULT
// =========================================================
const DocumentsView = ({ trip, documents, canEdit, onRefresh, onOpenUpload }) => {
  const { showToast } = useToast();

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await ApiClient.downloadTripDocument(trip._id, docId);
      if (res.success && res.data?.fileData) {
        const link = document.createElement('a');
        link.href = res.data.fileData;
        link.download = fileName || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Document downloaded', 'success');
      }
    } catch (err) {
      showToast('Download failed: ' + err.message, 'error');
    }
  };

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Delete document "${title}"?`)) return;
    try {
      const res = await ApiClient.deleteTripDocument(trip._id, docId);
      if (res.success) {
        showToast('Document removed', 'info');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete document', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-ink-900/60 p-4 rounded-2xl border border-white/5">
        <div>
          <h3 className="text-base font-bold text-white font-display">Private Travel Documents Locker</h3>
          <p className="text-xs text-slate-400">
            Securely store flight boarding passes, hotel confirmations, insurance policies, and receipts.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
          >
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {documents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs glass-panel rounded-3xl border border-white/10">
            No travel documents uploaded yet. Keep your tickets & vouchers safely backed up here.
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc._id}
              className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-ink-950 border border-white/10 text-coral-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-400">
                    {doc.category?.replace('_', ' ')}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">{doc.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{doc.fileName}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                <button
                  onClick={() => handleDownload(doc._id, doc.fileName)}
                  className="text-teal-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>

                {canEdit && (
                  <button
                    onClick={() => handleDelete(doc._id, doc.title)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: COLLABORATION & MEMBERS
// =========================================================
const MembersView = ({ trip, participants, isOwner, onRefresh, onOpenAddMember }) => {
  const { showToast } = useToast();

  const handleRoleChange = async (participantId, newRole) => {
    try {
      const res = await ApiClient.updateTripParticipantRole(trip._id, participantId, newRole);
      if (res.success) {
        showToast('Member role updated', 'success');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update role', 'error');
    }
  };

  const handleRemoveMember = async (participantId, name) => {
    if (!window.confirm(`Remove ${name} from this journey?`)) return;
    try {
      const res = await ApiClient.removeTripParticipant(trip._id, participantId);
      if (res.success) {
        showToast('Member removed', 'info');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove member', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-ink-900/60 p-4 rounded-2xl border border-white/5">
        <div>
          <h3 className="text-base font-bold text-white font-display">Travel Companions & Collaboration</h3>
          <p className="text-xs text-slate-400">
            Invite travel partners with Editor (modify itinerary & expenses) or Viewer (read-only) roles.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={onOpenAddMember}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
          >
            <UserPlus className="w-4 h-4" /> Invite Member
          </button>
        )}
      </div>

      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden divide-y divide-white/5">
        {participants.map((p) => (
          <div key={p._id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-coral-500 text-white font-bold text-sm flex items-center justify-center">
                {p.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{p.name}</p>
                <p className="text-xs text-slate-400">{p.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isOwner && p.role !== 'owner' ? (
                <select
                  value={p.role}
                  onChange={(e) => handleRoleChange(p._id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-slate-200 font-semibold focus:outline-none focus:border-coral-500"
                >
                  <option value="editor">Editor (Can edit)</option>
                  <option value="viewer">Viewer (Read only)</option>
                </select>
              ) : (
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  {p.role}
                </span>
              )}

              {isOwner && p.role !== 'owner' && (
                <button
                  onClick={() => handleRemoveMember(p._id, p.name)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400"
                  title="Remove from trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================
// MODALS: ADD ACTIVITY, ADD EXPENSE, ADD MEMBER, UPLOAD DOC
// =========================================================

const AddActivityModal = ({ trip, isOpen, onClose, onCreated }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'activities',
    sourceType: 'manual_entry',
    externalProvider: '',
    externalBookingUrl: '',
    bookingReference: '',
    locationName: '',
    date: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '',
    startTime: '10:00',
    endTime: '12:00',
    estimatedCost: 0,
    actualCost: 0,
    currency: trip.currency || 'INR',
    status: 'planned',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await ApiClient.addItineraryItem(trip._id, {
        ...formData,
        location: { name: formData.locationName, address: formData.locationName },
      });
      if (res.success) {
        showToast('Activity added to itinerary!', 'success');
        onCreated();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add activity', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-ink-900 border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-display">Add Itinerary Activity</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Category & Source Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              >
                <option value="flight">Flight</option>
                <option value="hotel">Hotel / Stay</option>
                <option value="train">Train</option>
                <option value="bus">Bus</option>
                <option value="car_rental">Car Rental</option>
                <option value="restaurant">Restaurant</option>
                <option value="sightseeing">Sightseeing</option>
                <option value="activities">Activities</option>
                <option value="shopping">Shopping</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Source Type</label>
              <select
                value={formData.sourceType}
                onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              >
                <option value="manual_entry">Manual Entry</option>
                <option value="external_booking">External Booking (Booking.com, IRCTC, etc.)</option>
                <option value="unbooked_activity">Unbooked Wishlist Activity</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Activity Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Scuba Diving Session or Hotel Check-in"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
            />
          </div>

          {formData.sourceType === 'external_booking' && (
            <div className="grid grid-cols-2 gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">External Provider</label>
                <input
                  type="text"
                  placeholder="e.g. Booking.com, IRCTC"
                  value={formData.externalProvider}
                  onChange={(e) => setFormData({ ...formData, externalProvider: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Confirmation / PNR</label>
                <input
                  type="text"
                  placeholder="e.g. BK-98234"
                  value={formData.bookingReference}
                  onChange={(e) => setFormData({ ...formData, bookingReference: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              >
              </input>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Location / Venue</label>
              <input
                type="text"
                placeholder="e.g. Baga Beach or Old Manali"
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Actual Cost</label>
              <input
                type="number"
                min="0"
                value={formData.actualCost}
                onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-ink-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-glow"
            >
              {loading ? 'Saving...' : 'Add Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddExpenseModal = ({ trip, isOpen, onClose, onCreated }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'food',
    amount: '',
    currency: trip.currency || 'INR',
    date: new Date().toISOString().split('T')[0],
    description: '',
    splitType: 'equal',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await ApiClient.createTripExpense(trip._id, formData);
      if (res.success) {
        showToast('Expense recorded!', 'success');
        onCreated();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to record expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-ink-900 border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-display">Record Trip Expense</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Expense Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Group Dinner at Cafe 1947"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Amount *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="2500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white font-semibold"
              >
                {['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'THB', 'JPY'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              >
                <option value="food">Food & Dining</option>
                <option value="flights">Flights</option>
                <option value="hotels">Hotels / Stays</option>
                <option value="trains">Trains</option>
                <option value="buses">Buses</option>
                <option value="local_transportation">Local Transit / Cabs</option>
                <option value="activities">Activities & Sightseeing</option>
                <option value="shopping">Shopping</option>
                <option value="insurance">Insurance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-ink-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-glow"
            >
              {loading ? 'Saving...' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddMemberModal = ({ trip, isOpen, onClose, onCreated }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await ApiClient.addTripParticipant(trip._id, { name, email, role });
      if (res.success) {
        showToast('Companion invited to journey!', 'success');
        onCreated();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to invite companion', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-ink-900 border border-white/10 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-display">Invite Companion</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. priya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Role & Permissions</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white font-semibold"
            >
              <option value="editor">Editor (Can edit itinerary & expenses)</option>
              <option value="viewer">Viewer (Read-only access)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-ink-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-glow"
            >
              {loading ? 'Inviting...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UploadDocModal = ({ trip, isOpen, onClose, onUploaded }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [file, setFile] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        showToast('File size exceeds 10MB limit', 'error');
        return;
      }
      setFile(selected);
      if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    try {
      setLoading(true);
      // Read as Data URL
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await ApiClient.uploadTripDocument(trip._id, {
            title,
            category,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: reader.result,
          });
          if (res.success) {
            showToast('Document uploaded securely!', 'success');
            onUploaded();
            onClose();
          }
        } catch (uploadErr) {
          showToast(uploadErr.message || 'Upload failed', 'error');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast(err.message || 'File read failed', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-ink-900 border border-white/10 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-display">Upload Travel Document</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Document Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Hotel Voucher or Boarding Pass"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Document Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
            >
              <option value="flight_ticket">Flight Ticket / Boarding Pass</option>
              <option value="hotel_confirmation">Hotel Voucher</option>
              <option value="train_ticket">Train Ticket</option>
              <option value="bus_ticket">Bus Ticket</option>
              <option value="travel_insurance">Travel Insurance</option>
              <option value="expense_receipt">Expense Receipt</option>
              <option value="passport_visa">Passport / Visa Copy</option>
              <option value="other">Other Travel Document</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Select File (Max 10MB) *</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-ink-800 file:text-slate-200 hover:file:bg-ink-700"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-ink-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-glow"
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
