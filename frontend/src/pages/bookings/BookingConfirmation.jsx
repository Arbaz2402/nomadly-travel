import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Printer, Map, Calendar, Loader2 } from 'lucide-react';
import { useBookingConfirmation } from '../../hooks/useBookingConfirmation';
import { BoardingVoucherCard } from '../../components/bookings/BoardingVoucherCard';
import { AddToTripModal } from '../../components/bookings/AddToTripModal';

export const BookingConfirmation = () => {
  const {
    booking,
    loading,
    showAddToTripModal,
    setShowAddToTripModal,
    userTrips,
    loadingTrips,
    attachingTripId,
    handlePrint,
    handleCopyReference,
    handleOpenAddToTrip,
    handleAttachToSelectedTrip,
    handleCreateNewTripWithBooking,
  } = useBookingConfirmation();

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
          <h2 className="text-2xl font-extrabold text-white font-display">
            No Active Booking Session
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            No active e-ticket found in this browser session. You can view all confirmed travel
            reservations in your profile or explore new journeys.
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
            className="px-5 py-2.5 rounded-2xl bg-ink-900 hover:bg-ink-850 border border-white/10 text-slate-300 font-semibold text-xs transition-colors"
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
          <span className="font-semibold text-white">
            {booking?.contactInfo?.email || 'your registered email'}
          </span>
        </p>
      </div>

      {/* Main E-Ticket / Boarding Voucher Card */}
      <BoardingVoucherCard booking={booking} onCopyReference={handleCopyReference} />

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
      <AddToTripModal
        isOpen={showAddToTripModal}
        onClose={() => setShowAddToTripModal(false)}
        bookingReference={booking.bookingReference}
        userTrips={userTrips}
        loadingTrips={loadingTrips}
        attachingTripId={attachingTripId}
        onAttachToTrip={handleAttachToSelectedTrip}
        onCreateNewTrip={handleCreateNewTripWithBooking}
      />
    </div>
  );
};

export default BookingConfirmation;
