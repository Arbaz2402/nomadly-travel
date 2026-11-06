import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Printer,
  Compass,
  ArrowRight,
  QrCode,
  ShieldCheck,
  Calendar,
  MapPin,
  User,
  Copy,
  Map,
  Plus,
  Loader2,
  X,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { ApiClient } from '../../services/api';

export const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(() => {
    if (location.state?.booking) return location.state.booking;
    try {
      const cached = sessionStorage.getItem('nomadly_latest_booking');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(!booking);
  const [showAddToTripModal, setShowAddToTripModal] = useState(false);
  const [userTrips, setUserTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [attachingTripId, setAttachingTripId] = useState(null);

  useEffect(() => {
    const resolveBooking = async () => {
      if (booking) {
        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff5a36', '#14b8a6', '#f59e0b', '#ffffff'],
          });
        } catch {
          // ignore confetti animation error in headless / restricted canvas
        }
        return;
      }

      // If no booking in state or sessionStorage, attempt to fetch user's latest booking from API
      try {
        setLoading(true);
        const res = await ApiClient.getMyBookings();
        if (res.success && res.data && res.data.length > 0) {
          const latest = res.data[0];
          setBooking(latest);
          try {
            sessionStorage.setItem('nomadly_latest_booking', JSON.stringify(latest));
          } catch (e) {
            // ignore
          }
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#ff5a36', '#14b8a6', '#f59e0b', '#ffffff'],
            });
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.warn('Could not auto-load latest booking:', err.message);
      } finally {
        setLoading(false);
      }
    };

    resolveBooking();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyReference = () => {
    if (!booking?.bookingReference) return;
    navigator.clipboard.writeText(booking.bookingReference);
    showToast('Booking reference copied to clipboard!', 'success');
  };

  const fetchUserTrips = async () => {
    try {
      setLoadingTrips(true);
      const res = await ApiClient.getMyTrips();
      if (res.success) {
        setUserTrips(res.data || []);
      }
    } catch (err) {
      console.warn('Could not load user journeys:', err.message);
    } finally {
      setLoadingTrips(false);
    }
  };

  const handleOpenAddToTrip = () => {
    setShowAddToTripModal(true);
    fetchUserTrips();
  };

  const handleAttachToSelectedTrip = async (tripId) => {
    try {
      setAttachingTripId(tripId);
      const res = await ApiClient.attachBookingToTrip(tripId, {
        bookingId: booking._id,
      });
      if (res.success) {
        showToast('Reservation successfully linked to journey itinerary!', 'success');
        navigate(`/journeys/${tripId}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to attach booking', 'error');
    } finally {
      setAttachingTripId(null);
    }
  };

  const handleCreateNewTripWithBooking = () => {
    const snap = booking?.itinerarySnapshot || {};
    const dest = snap.destinationCity || snap.city || snap.destination || 'My Destination';
    navigate('/journeys/new', {
      state: {
        prefillTitle: `Trip to ${dest}`,
        prefillDestination: dest,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 text-coral-500 animate-spin" />
        <p className="text-xs font-semibold">Retrieving your confirmed reservation...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-ink-900 border border-white/10 mx-auto flex items-center justify-center text-coral-400 shadow-glow">
          <Calendar className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white font-display">No Active Booking Session</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            No active e-ticket found in this browser session. You can view all confirmed travel reservations in your profile or explore new journeys.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs shadow-glow transition-all"
          >
            Go to My Bookings
          </Link>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-2xl bg-ink-900 hover:bg-ink-800 border border-white/10 text-slate-300 font-semibold text-xs transition-colors"
          >
            Search Flights & Stays
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Banner */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-teal-500/20 text-teal-400 border border-teal-500/30 mx-auto flex items-center justify-center mb-4 shadow-glow-teal animate-bounce">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-teal-400 block mb-1">
          Reservation Confirmed
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-2">
          You're all set to travel!
        </h1>
        <p className="text-sm text-slate-300">
          A confirmation e-ticket with trip details has been dispatched to{' '}
          <span className="font-semibold text-white">{booking?.contactInfo?.email || 'your registered email'}</span>
        </p>
      </div>

      {/* Main E-Ticket / Boarding Voucher Card */}
      <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden mb-8 print:border-black print:text-black">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-ink-900 to-ink-850 p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-coral-400 tracking-wider block">
              NOMADLY OFFICIAL BOARDING VOUCHER
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-xl font-extrabold text-white font-mono tracking-tight">
                {booking?.bookingReference || 'NMD-CONFIRMED'}
              </h2>
              {booking?.bookingReference && (
                <button
                  onClick={handleCopyReference}
                  className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
                  title="Copy Reference"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Status: {(booking?.bookingStatus || 'CONFIRMED').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Category & Provider Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-white/5">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Travel Category
              </span>
              <p className="text-base font-bold text-white capitalize">{booking?.travelCategory || 'Travel'}</p>
              <p className="text-xs text-slate-400">{booking?.providerName || 'Nomadly Travel'}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Booking Date
              </span>
              <p className="text-sm font-bold text-white">{formatDate(booking?.createdAt || new Date())}</p>
              <p className="text-xs text-teal-400">Payment: {(booking?.paymentStatus || 'PAID').toUpperCase()}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Lead Contact
              </span>
              <p className="text-sm font-bold text-white truncate">{booking?.contactInfo?.email || 'N/A'}</p>
              <p className="text-xs text-slate-400">{booking?.contactInfo?.phone || ''}</p>
            </div>
          </div>

          {/* Passengers List */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-3">
              Confirmed Travelers
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {booking.passengers?.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-ink-900/60 border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-coral-500/20 text-coral-400 flex items-center justify-center font-bold text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs">
                      {p.title} {p.firstName} {p.lastName}
                    </p>
                    <p className="text-[11px] text-slate-400 capitalize">
                      {p.gender} {p.seatNumber ? `• Seat ${p.seatNumber}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & QR Verification */}
          <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Total Amount Paid
              </span>
              <p className="text-3xl font-extrabold text-white font-display">
                {formatCurrency(booking.pricing?.totalPayable, booking.pricing?.currency)}
              </p>
              <span className="text-[11px] text-teal-400 font-semibold block">
                Inclusive of GST & Platform fees
              </span>
            </div>

            {/* QR Simulation Box */}
            <div className="p-3 bg-white rounded-2xl flex items-center gap-3">
              <QrCode className="w-16 h-16 text-ink-950" />
              <div className="text-ink-950 pr-2">
                <span className="text-[9px] uppercase font-extrabold block text-slate-600">Scan to Verify</span>
                <span className="text-xs font-mono font-bold">{booking.bookingReference}</span>
                <span className="text-[10px] text-teal-600 font-bold block">VALIDATED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={handlePrint}
          className="px-5 py-3 rounded-2xl bg-ink-900 hover:bg-ink-800 text-slate-200 border border-white/10 text-xs font-bold transition-all flex items-center gap-2"
        >
          <Printer className="w-4 h-4 text-coral-500" />
          <span>Print / Save as PDF</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddToTrip}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white text-xs font-bold shadow-glow transition-all flex items-center gap-2"
          >
            <Map className="w-4 h-4 stroke-[2.2]" />
            <span>Add to My Journeys</span>
          </button>
          <Link
            to="/dashboard"
            className="px-5 py-3 rounded-2xl bg-ink-900 hover:bg-ink-800 text-white border border-white/10 text-xs font-bold transition-all"
          >
            My Bookings
          </Link>
        </div>
      </div>

      {/* Add To Journey Modal */}
      {showAddToTripModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] overflow-y-auto bg-ink-950/85 backdrop-blur-md p-4 sm:p-6 flex min-h-screen items-center justify-center animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddToTripModal(false);
            }}
          >
            <div
              className="relative w-full max-w-lg rounded-3xl bg-ink-900 border border-white/10 shadow-2xl p-6 sm:p-8 space-y-4 my-auto max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-coral-400 tracking-wider">
                    Independent Journey Hub
                  </span>
                  <h3 className="text-lg font-bold text-white font-display">Add Booking to Journey</h3>
                </div>
                <button
                  onClick={() => setShowAddToTripModal(false)}
                  type="button"
                  aria-label="Close dialog"
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Link this confirmed booking (<span className="font-mono text-teal-400">{booking.bookingReference}</span>) into one of your existing trip plans, or create a brand new journey!
              </p>

              {/* List of existing journeys */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {loadingTrips ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-coral-500" />
                    <span className="text-xs">Loading your journeys...</span>
                  </div>
                ) : userTrips.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-ink-950 border border-white/5 text-center text-xs text-slate-400">
                    No active journeys found yet.
                  </div>
                ) : (
                  userTrips.map((t) => (
                    <div
                      key={t._id}
                      className="p-3 rounded-2xl bg-ink-950/80 hover:bg-ink-850 border border-white/5 hover:border-coral-500/30 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{t.title}</h4>
                        <p className="text-[11px] text-slate-400">
                          {t.destination} • {formatDate(t.startDate)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleAttachToSelectedTrip(t._id)}
                        disabled={attachingTripId === t._id}
                        className="px-3.5 py-1.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-glow disabled:opacity-50 flex items-center gap-1 shrink-0"
                      >
                        {attachingTripId === t._id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Linking...
                          </>
                        ) : (
                          'Add to Trip'
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Option to create a new trip */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Want to start a fresh itinerary?</span>
                <button
                  onClick={handleCreateNewTripWithBooking}
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create New Journey
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
