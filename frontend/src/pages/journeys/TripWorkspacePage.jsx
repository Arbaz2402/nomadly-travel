import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Sparkles,
  RefreshCw,
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
  Send,
  Mail,
  Copy,
  Route,
  Navigation,
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

import { ItineraryView } from '../../components/journeys/workspace/ItineraryView';
import { OverviewView } from '../../components/journeys/workspace/OverviewView';
import { CalendarView } from '../../components/journeys/workspace/CalendarView';
import { ExpensesView } from '../../components/journeys/workspace/ExpensesView';
import { SplittingView } from '../../components/journeys/workspace/SplittingView';
import { TripMapView } from '../../components/journeys/workspace/TripMapView';
import { DocumentsView } from '../../components/journeys/workspace/DocumentsView';
import { MembersView } from '../../components/journeys/workspace/MembersView';
import { AddActivityModal } from '../../components/journeys/modals/AddActivityModal';
import { AddExpenseModal } from '../../components/journeys/modals/AddExpenseModal';
import { AddMemberModal } from '../../components/journeys/modals/AddMemberModal';
import { UploadDocModal } from '../../components/journeys/modals/UploadDocModal';
import { AIModifyActivityModal } from '../../components/journeys/modals/AIModifyActivityModal';
import { EditActivityModal } from '../../components/journeys/modals/EditActivityModal';
import {
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  CHART_COLORS,
  cleanVenueTitle,
  buildExactVenueQuery,
} from '../../components/journeys/helpers';

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
  const [aiModifyModalOpen, setAiModifyModalOpen] = useState(false);
  const [aiModifyTargetItem, setAiModifyTargetItem] = useState(null);
  const [editActivityModalOpen, setEditActivityModalOpen] = useState(false);
  const [editTargetItem, setEditTargetItem] = useState(null);

  // Tab data states
  const [itinerary, setItinerary] = useState({ groupedByDay: {}, warnings: [], data: [] });
  const [expenses, setExpenses] = useState({ data: [], summary: {} });
  const [settlement, setSettlement] = useState({ memberBalances: [], settlementPlan: [] });
  const [analytics, setAnalytics] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Fetch Full Trip Info
  const [respondingInvite, setRespondingInvite] = useState(false);

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

  const handleRespondInvitation = async (action) => {
    try {
      setRespondingInvite(true);
      const res = await ApiClient.respondToTripInvitation(id, action);
      if (res.success) {
        showToast(res.message, 'success');
        if (action === 'accept') {
          fetchTripData();
          loadTabData('members');
        } else {
          navigate('/journeys');
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to respond to invitation', 'error');
    } finally {
      setRespondingInvite(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTripData();
    }
  }, [id, user?._id]);

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
  }, [activeTab, id, user?._id]);

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

      {/* Pending Invitation Alert Banner for the viewing user */}
      {trip.participantStatus === 'pending' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-coral-500/20 via-teal-500/15 to-ink-900 border border-coral-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral-500/20 border border-coral-500/30 flex items-center justify-center text-coral-400">
              <Mail className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Collaboration Invitation Request
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-coral-500/20 text-coral-300 border border-coral-500/30">
                  {trip.userRole?.toUpperCase()}
                </span>
              </h4>
              <p className="text-xs text-slate-300">
                You've been invited by the journey owner to collaborate as an{' '}
                <strong className="text-teal-400 capitalize">{trip.userRole}</strong>. Accept this request to participate in planning and editing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleRespondInvitation('decline')}
              disabled={respondingInvite}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => handleRespondInvitation('accept')}
              disabled={respondingInvite}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 hover:from-coral-600 text-white text-xs font-bold shadow-glow flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              {respondingInvite ? 'Joining...' : 'Accept Invitation'}
            </button>
          </div>
        </div>
      )}

      {/* Master Trip Hero Banner */}
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
                  onClick={() => setAttachModalOpen(true)}
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
          onOpenAiModify={(item) => {
            setAiModifyTargetItem(item);
            setAiModifyModalOpen(true);
          }}
          onOpenEditActivity={(item) => {
            setEditTargetItem(item);
            setEditActivityModalOpen(true);
          }}
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

      {/* AI Modify / Swap Activity Modal */}
      {aiModifyModalOpen && aiModifyTargetItem && (
        <AIModifyActivityModal
          trip={trip}
          item={aiModifyTargetItem}
          itinerary={itinerary}
          isOpen={aiModifyModalOpen}
          onClose={() => {
            setAiModifyModalOpen(false);
            setAiModifyTargetItem(null);
          }}
          onUpdated={() => {
            fetchTripData();
            loadTabData('itinerary');
            loadTabData('map');
          }}
        />
      )}

      {/* Edit Activity Modal */}
      {editActivityModalOpen && editTargetItem && (
        <EditActivityModal
          trip={trip}
          item={editTargetItem}
          isOpen={editActivityModalOpen}
          onClose={() => {
            setEditActivityModalOpen(false);
            setEditTargetItem(null);
          }}
          onUpdated={() => {
            fetchTripData();
            loadTabData('itinerary');
            loadTabData('map');
          }}
        />
      )}
    </div>
  );
};

