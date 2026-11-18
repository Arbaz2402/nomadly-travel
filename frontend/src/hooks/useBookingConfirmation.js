import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ApiClient } from '../services/api';
import { useToast } from '../context/ToastContext';

export const useBookingConfirmation = () => {
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

  return {
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
  };
};
