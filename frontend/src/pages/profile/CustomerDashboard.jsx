import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { BookingsList } from '../../components/customer/BookingsList';
import { SavedTravelersList } from '../../components/customer/SavedTravelersList';
import { AttachBookingModal } from '../../components/customer/AttachBookingModal';

export const CustomerDashboard = () => {
  const { user, checkSession } = useAuthStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // New Traveler Modal / State
  const [showAddTraveler, setShowAddTraveler] = useState(false);
  const [travelerForm, setTravelerForm] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    gender: 'male',
    nationality: 'Indian',
  });

  // Trip picker modal state
  const [selectedBookingForTrip, setSelectedBookingForTrip] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [attachingTripId, setAttachingTripId] = useState(null);

  const handleOpenTripPicker = async (booking) => {
    setSelectedBookingForTrip(booking);
    try {
      setLoadingTrips(true);
      const res = await ApiClient.getMyTrips();
      if (res.success) {
        setUserTrips(res.data || []);
      }
    } catch (err) {
      console.warn('Could not load trips:', err.message);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleAttachBooking = async (tripId) => {
    if (!selectedBookingForTrip) return;
    try {
      setAttachingTripId(tripId);
      const res = await ApiClient.attachBookingToTrip(tripId, {
        bookingId: selectedBookingForTrip._id,
      });
      if (res.success) {
        showToast('Booking attached to journey!', 'success');
        setSelectedBookingForTrip(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to attach booking', 'error');
    } finally {
      setAttachingTripId(null);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      setFetchError(null);
      const res = await ApiClient.getMyBookings();
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setFetchError(err.message || 'Could not load your reservations');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?._id, user?.email]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Eligible refunds will be processed.')) {
      return;
    }
    try {
      const res = await ApiClient.cancelBooking(bookingId, { reason: 'Customer requested' });
      if (res.success) {
        showToast('Booking cancelled. Eligible refund initiated.', 'info');
        fetchBookings();
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    }
  };

  const handleSaveTraveler = async (e) => {
    e.preventDefault();
    if (!travelerForm.firstName.trim() || !travelerForm.lastName.trim()) {
      showToast('First and Last name are required', 'error');
      return;
    }
    try {
      await ApiClient.addTraveler(travelerForm);
      showToast('Saved traveler added!', 'success');
      setShowAddTraveler(false);
      setTravelerForm({ title: 'Mr', firstName: '', lastName: '', gender: 'male', nationality: 'Indian' });
      checkSession();
    } catch (err) {
      showToast(err.message || 'Failed to save traveler', 'error');
    }
  };

  const handleDeleteTraveler = async (id) => {
    try {
      await ApiClient.deleteTraveler(id);
      showToast('Traveler removed', 'info');
      checkSession();
    } catch (err) {
      showToast(err.message || 'Failed to remove traveler', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile Header Banner */}
      <div className="glass-panel rounded-3xl p-6 mb-8 border border-white/10 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-coral-500 to-amber-400 text-white flex items-center justify-center font-extrabold text-2xl font-display shadow-glow">
            {user?.displayName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight font-display">
                {user?.displayName || 'Traveler Account'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold uppercase">
                {user?.role || 'Verified Customer'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
          </div>
        </div>

        {/* Dashboard Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-ink-900 border border-white/10">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'bookings' ? 'bg-coral-500 text-white shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
            >
              My Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('travelers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'travelers' ? 'bg-coral-500 text-white shadow-glow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Saved Travelers ({user?.savedTravelers?.length || 0})
            </button>
          </div>

          <button
            onClick={fetchBookings}
            disabled={loadingBookings}
            className="p-2.5 rounded-2xl bg-ink-900 hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-50"
            title="Refresh bookings"
            aria-label="Refresh bookings"
          >
            <RefreshCw className={`w-4 h-4 text-teal-400 ${loadingBookings ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab 1: Bookings List */}
      {activeTab === 'bookings' && (
        <BookingsList
          bookings={bookings}
          loadingBookings={loadingBookings}
          fetchError={fetchError}
          onRefresh={fetchBookings}
          onOpenTripPicker={handleOpenTripPicker}
          onCancelBooking={handleCancelBooking}
        />
      )}

      {/* Tab 2: Saved Travelers */}
      {activeTab === 'travelers' && (
        <SavedTravelersList
          travelers={user?.savedTravelers}
          showAddTraveler={showAddTraveler}
          setShowAddTraveler={setShowAddTraveler}
          travelerForm={travelerForm}
          setTravelerForm={setTravelerForm}
          handleSaveTraveler={handleSaveTraveler}
          handleDeleteTraveler={handleDeleteTraveler}
        />
      )}

      {/* Trip Picker Modal */}
      <AttachBookingModal
        booking={selectedBookingForTrip}
        userTrips={userTrips}
        loadingTrips={loadingTrips}
        attachingTripId={attachingTripId}
        onClose={() => setSelectedBookingForTrip(null)}
        onAttach={handleAttachBooking}
      />
    </div>
  );
};
