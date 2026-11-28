import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiClient } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';

export const useTripWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('itinerary');

  // Modal states
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
        const sRes = await ApiClient.getTripSettlement(id);
        if (sRes.success) setSettlement(sRes.data);
      }
      if (tab === 'splitting') {
        const res = await ApiClient.getTripSettlement(id);
        if (res.success) setSettlement(res.data);
        const expRes = await ApiClient.getTripExpenses(id);
        if (expRes.success) setExpenses(expRes);
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
    if (id) {
      fetchTripData();
    }
  }, [id, user?._id]);

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

  const handleLeaveJourney = async () => {
    if (!window.confirm('Are you sure you want to leave this journey? You will be removed from travelers and lose access to its workspace.')) {
      return;
    }
    try {
      const res = await ApiClient.leaveJourney(trip._id);
      if (res.success) {
        showToast('You have successfully left the journey.', 'info');
        navigate('/journeys');
      }
    } catch (err) {
      showToast(err.message || 'Failed to leave journey', 'error');
    }
  };

  return {
    id,
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
  };
};
