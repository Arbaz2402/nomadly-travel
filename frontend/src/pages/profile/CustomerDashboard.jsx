import React, { useState, useEffect } from 'react';
import {
  User,
  Calendar,
  Compass,
  CreditCard,
  Bookmark,
  ShieldAlert,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plane,
  Building2,
  Train,
  Bus,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const CustomerDashboard = () => {
  const { user, checkSession } = useAuthStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // New Traveler Modal / State
  const [showAddTraveler, setShowAddTraveler] = useState(false);
  const [travelerForm, setTravelerForm] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    gender: 'male',
    nationality: 'Indian',
  });

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await ApiClient.getMyBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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

  const getCategoryIcon = (cat) => {
    if (cat === 'flight') return Plane;
    if (cat === 'hotel') return Building2;
    if (cat === 'train') return Train;
    return Bus;
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

        {/* Dashboard Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1 rounded-2xl bg-ink-900 border border-white/10">
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
      </div>

      {/* Tab 1: Bookings List */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {loadingBookings ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass-card rounded-2xl p-6 h-36 animate-pulse bg-ink-900/40"></div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
              <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No reservations booked yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                Explore flights, hotels, express trains, or sleeper buses and complete your first reservation!
              </p>
              <a
                href="/"
                className="px-5 py-2.5 rounded-xl bg-coral-500 text-white text-xs font-bold inline-block shadow-glow"
              >
                Start Exploring
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const Icon = getCategoryIcon(booking.travelCategory);
                const isCancelled = booking.bookingStatus === 'cancelled';

                return (
                  <div
                    key={booking._id}
                    className="glass-card rounded-2xl p-6 border border-white/10 hover:border-coral-500/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-ink-900 border border-white/10 flex items-center justify-center text-coral-500 flex-shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-coral-400 text-xs">
                            {booking.bookingReference}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                              isCancelled
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                            }`}
                          >
                            {booking.bookingStatus}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white font-display">
                          {booking.providerName}
                        </h3>

                        <p className="text-xs text-slate-400 mt-1">
                          Booked on: {formatDate(booking.createdAt)} • Travelers: {booking.passengers?.length || 1}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          Total Amount
                        </span>
                        <span className="text-xl font-extrabold text-white font-display">
                          {formatCurrency(booking.pricing?.totalPayable, booking.pricing?.currency)}
                        </span>
                      </div>

                      {!isCancelled && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="px-4 py-2 rounded-xl bg-ink-900 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 text-xs font-bold transition-all"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Travelers */}
      {activeTab === 'travelers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight">Saved Passengers & Family</h2>
            <button
              onClick={() => setShowAddTraveler(true)}
              className="px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Traveler</span>
            </button>
          </div>

          {/* Modal / Form for adding traveler */}
          {showAddTraveler && (
            <form onSubmit={handleSaveTraveler} className="glass-panel rounded-3xl p-6 border border-coral-500/30 space-y-4">
              <h3 className="text-sm font-bold text-white tracking-tight">Add Traveler Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Title</label>
                  <select
                    value={travelerForm.title}
                    onChange={(e) => setTravelerForm({ ...travelerForm, title: e.target.value })}
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Dr">Dr</option>
                  </select>
                </div>
                <div className="sm:col-span-5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">First Name</label>
                  <input
                    type="text"
                    value={travelerForm.firstName}
                    onChange={(e) => setTravelerForm({ ...travelerForm, firstName: e.target.value })}
                    placeholder="First Name"
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={travelerForm.lastName}
                    onChange={(e) => setTravelerForm({ ...travelerForm, lastName: e.target.value })}
                    placeholder="Last Name"
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTraveler(false)}
                  className="px-4 py-2 rounded-xl bg-ink-900 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-coral-500 text-white text-xs font-bold"
                >
                  Save Traveler
                </button>
              </div>
            </form>
          )}

          {/* List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {user?.savedTravelers?.map((saved) => (
              <div
                key={saved._id}
                className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ink-900 border border-white/10 flex items-center justify-center font-bold text-coral-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">
                      {saved.title} {saved.firstName} {saved.lastName}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">{saved.gender} • {saved.nationality || 'Indian'}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTraveler(saved._id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove traveler"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
