import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, LogOut, Loader2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTripWorkspace } from '../../hooks/useTripWorkspace';
import { TripWorkspaceHero } from '../../components/journeys/workspace/TripWorkspaceHero';
import { TripCollaborationBanner } from '../../components/journeys/workspace/TripCollaborationBanner';
import { TripModalsManager } from '../../components/journeys/workspace/TripModalsManager';

// Tab Views
import { ItineraryView } from '../../components/journeys/workspace/ItineraryView';
import { OverviewView } from '../../components/journeys/workspace/OverviewView';
import { CalendarView } from '../../components/journeys/workspace/CalendarView';
import { ExpensesView } from '../../components/journeys/workspace/ExpensesView';
import { SplittingView } from '../../components/journeys/workspace/SplittingView';
import { TripMapView } from '../../components/journeys/workspace/TripMapView';
import { DocumentsView } from '../../components/journeys/workspace/DocumentsView';
import { MembersView } from '../../components/journeys/workspace/MembersView';
import { PackingView } from '../../components/journeys/workspace/PackingView';
import { ApiClient } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const TripWorkspacePage = () => {
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const {
    trip,
    loading,
    loadError,
    activeTab,
    setActiveTab,
    itinerary,
    expenses,
    settlement,
    analytics,
    participants,
    documents,
    activityLogs,
    respondingInvite,
    attachModalOpen,
    setAttachModalOpen,
    addActivityOpen,
    setAddActivityOpen,
    addExpenseOpen,
    setAddExpenseOpen,
    addMemberOpen,
    setAddMemberOpen,
    uploadDocOpen,
    setUploadDocOpen,
    aiModifyModalOpen,
    setAiModifyModalOpen,
    aiModifyTargetItem,
    setAiModifyTargetItem,
    editActivityModalOpen,
    setEditActivityModalOpen,
    editTargetItem,
    setEditTargetItem,
    fetchTripData,
    loadTabData,
    handleRespondInvitation,
    handleDeleteTrip,
    handleLeaveJourney,
  } = useTripWorkspace();

  const [editingExpense, setEditingExpense] = React.useState(null);
  const [settleUpModalOpen, setSettleUpModalOpen] = React.useState(false);
  const [settleUpData, setSettleUpData] = React.useState(null);

  const handleUpdateTripStatus = async (newStatus) => {
    try {
      const res = await ApiClient.updateTrip(trip._id, { status: newStatus });
      if (res.success) {
        const label =
          newStatus === 'ongoing'
            ? 'Journey started! Live Active Mode is now on.'
            : newStatus === 'completed'
            ? 'Journey marked as completed!'
            : 'Journey status updated.';
        showToast(label, 'success');
        fetchTripData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update journey status', 'error');
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
      {/* Back link & Top Bar */}
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
          {isOwner ? (
            <button
              onClick={handleDeleteTrip}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete Journey"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleLeaveJourney}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all shadow-sm"
              title="Leave this journey"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave Journey</span>
            </button>
          )}
        </div>
      </div>

      {/* Pending Invitation Alert Banner */}
      {trip.participantStatus === 'pending' && (
        <TripCollaborationBanner
          userRole={trip.userRole}
          respondingInvite={respondingInvite}
          onRespondInvitation={handleRespondInvitation}
        />
      )}

      {/* Master Trip Hero Banner with Tab Bar */}
      <TripWorkspaceHero
        trip={trip}
        canEdit={canEdit}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAttachBooking={() => setAttachModalOpen(true)}
        onUpdateStatus={handleUpdateTripStatus}
      />

      {/* Live Active Journey Banner */}
      {(trip.dynamicStatus === 'ongoing' || trip.status === 'ongoing') && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-300 block">
                Active Journey Mode — {trip.title} is Live!
              </span>
              <span className="text-slate-300">
                Quickly log live expenses, check off your itinerary, or access your boarding passes & IDs.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('expenses')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-200 text-xs font-bold transition-all"
            >
              + Log Live Expense
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className="px-3 py-1.5 rounded-xl bg-ink-900 hover:bg-ink-800 border border-white/10 text-slate-200 text-xs font-semibold transition-all"
            >
              View Docs
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT VIEWS */}
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

      {activeTab === 'overview' && (
        <OverviewView
          trip={trip}
          analytics={analytics}
          expenses={expenses}
          activityLogs={activityLogs}
          onSwitchTab={(t) => setActiveTab(t)}
        />
      )}

      {activeTab === 'calendar' && (
        <CalendarView
          trip={trip}
          itinerary={itinerary}
          onOpenAddActivity={() => setAddActivityOpen(true)}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpensesView
          trip={trip}
          expenses={expenses}
          analytics={analytics}
          canEdit={canEdit}
          onRefresh={() => {
            loadTabData('expenses');
            loadTabData('splitting');
          }}
          onOpenAddExpense={() => {
            setEditingExpense(null);
            setAddExpenseOpen(true);
          }}
          onOpenEditExpense={(exp) => setEditingExpense(exp)}
        />
      )}

      {activeTab === 'splitting' && (
        <SplittingView
          trip={trip}
          settlement={settlement}
          expenses={expenses}
          canEdit={canEdit}
          onRefresh={() => {
            loadTabData('splitting');
            loadTabData('expenses');
          }}
          onOpenAddExpense={() => {
            setEditingExpense(null);
            setAddExpenseOpen(true);
          }}
          onOpenEditExpense={(exp) => setEditingExpense(exp)}
          onOpenSettleUp={(data) => {
            setSettleUpData(data);
            setSettleUpModalOpen(true);
          }}
        />
      )}

      {activeTab === 'packing' && (
        <PackingView
          trip={trip}
          canEdit={canEdit}
          onRefresh={fetchTripData}
        />
      )}

      {activeTab === 'map' && <TripMapView trip={trip} itinerary={itinerary} />}

      {activeTab === 'documents' && (
        <DocumentsView
          trip={trip}
          documents={documents}
          canEdit={canEdit}
          onRefresh={() => loadTabData('documents')}
          onOpenUpload={() => setUploadDocOpen(true)}
        />
      )}

      {activeTab === 'members' && (
        <MembersView
          trip={trip}
          participants={participants}
          isOwner={isOwner}
          onRefresh={() => loadTabData('members')}
          onOpenAddMember={() => setAddMemberOpen(true)}
          onLeaveJourney={handleLeaveJourney}
        />
      )}

      {/* MODALS MANAGER */}
      <TripModalsManager
        trip={trip}
        itinerary={itinerary}
        activeTab={activeTab}
        attachModalOpen={attachModalOpen}
        setAttachModalOpen={setAttachModalOpen}
        addActivityOpen={addActivityOpen}
        setAddActivityOpen={setAddActivityOpen}
        addExpenseOpen={addExpenseOpen}
        setAddExpenseOpen={setAddExpenseOpen}
        editingExpense={editingExpense}
        setEditingExpense={setEditingExpense}
        settleUpModalOpen={settleUpModalOpen}
        setSettleUpModalOpen={setSettleUpModalOpen}
        settleUpData={settleUpData}
        setSettleUpData={setSettleUpData}
        addMemberOpen={addMemberOpen}
        setAddMemberOpen={setAddMemberOpen}
        uploadDocOpen={uploadDocOpen}
        setUploadDocOpen={setUploadDocOpen}
        aiModifyModalOpen={aiModifyModalOpen}
        setAiModifyModalOpen={setAiModifyModalOpen}
        aiModifyTargetItem={aiModifyTargetItem}
        setAiModifyTargetItem={setAiModifyTargetItem}
        editActivityModalOpen={editActivityModalOpen}
        setEditActivityModalOpen={setEditActivityModalOpen}
        editTargetItem={editTargetItem}
        setEditTargetItem={setEditTargetItem}
        onTripDataRefresh={fetchTripData}
        onTabRefresh={loadTabData}
      />
    </div>
  );
};

export default TripWorkspacePage;
