import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { useCheckoutPricing } from '../../hooks/useCheckoutPricing';
import { CheckoutStepper } from '../../components/checkout/CheckoutStepper';
import { SavedTravelersAutofill } from '../../components/checkout/SavedTravelersAutofill';
import { PassengerDetailsForm } from '../../components/checkout/PassengerDetailsForm';
import { JourneyAddons } from '../../components/checkout/JourneyAddons';
import { CheckoutOrderSummary } from '../../components/checkout/CheckoutOrderSummary';
import { PartnerBookingModal } from '../../components/checkout/PartnerBookingModal';
import { getPartnerInfo } from '../../utils/partnerLinks';

export const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, demoSignIn } = useAuthStore();
  const { showToast } = useToast();

  const checkoutState = location.state;
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  // Passenger & Contact State
  const [passengers, setPassengers] = useState([
    {
      title: 'Mr',
      firstName: '',
      lastName: '',
      gender: 'male',
      age: 28,
    },
  ]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Promotional Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Journey Protection Add-ons State
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  // Processing Guard
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!checkoutState) {
      navigate('/');
      return;
    }

    if (user) {
      setContactEmail(user.email || '');
      setContactPhone(user.phoneNumber || '+91 98765 43210');

      if (user.savedTravelers && user.savedTravelers.length > 0) {
        const primary = user.savedTravelers[0];
        setPassengers([
          {
            title: primary.title || 'Mr',
            firstName: primary.firstName || '',
            lastName: primary.lastName || '',
            gender: primary.gender || 'male',
            age: 30,
          },
        ]);
      }
    }
  }, [user, checkoutState, navigate]);

  if (!checkoutState) return null;

  const {
    category = 'flight',
    inventoryId,
    itinerary: rawItinerary,
    itinerarySnapshot,
    sessionId,
    seatNumbers,
    pricing,
    title,
  } = checkoutState;

  const itinerary = rawItinerary || itinerarySnapshot || {};
  const partnerInfo = getPartnerInfo(category, itinerary);

  // Custom hook for client pricing calculation
  const pricingMetrics = useCheckoutPricing({
    category,
    pricing,
    itinerary,
    passengerCount: passengers.length,
    selectedAddOns,
    appliedCoupon,
  });

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      setValidatingCoupon(true);
      setCouponError('');
      const res = await ApiClient.validateCoupon({
        code: couponInput,
        category,
        amount: pricingMetrics.rawBase,
      });

      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        showToast(
          `Promo ${res.data.code} applied! Saved ₹${res.data.calculatedDiscount}`,
          'success'
        );
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleAddPassenger = () => {
    if (passengers.length >= 4) {
      showToast('Maximum 4 travelers allowed per group booking', 'info');
      return;
    }
    setPassengers([
      ...passengers,
      {
        title: 'Mr',
        firstName: '',
        lastName: '',
        gender: 'male',
        age: 25,
      },
    ]);
  };

  const handleAutofillSaved = (saved) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[0] = {
        title: saved.title || 'Mr',
        firstName: saved.firstName,
        lastName: saved.lastName,
        gender: saved.gender || 'male',
        age: 29,
      };
      return updated;
    });
    showToast(`Autofilled details for ${saved.firstName} ${saved.lastName}`, 'success');
  };

  const handleInitiatePartnerBooking = () => {
    // Open partner booking in a new tab immediately - zero form filling needed
    if (partnerInfo?.url) {
      window.open(partnerInfo.url, '_blank', 'noopener,noreferrer');
    }

    // Open confirmation dialog on current tab
    setIsPartnerModalOpen(true);
  };

  const handleConfirmPartnerBooking = async (optionalPnr = '') => {
    let currentUser = user;
    if (!currentUser) {
      try {
        const res = await demoSignIn('customer');
        currentUser = res.user;
      } catch (e) {
        showToast('Please sign in to save your booking.', 'error');
        return;
      }
    }

    try {
      setIsProcessing(true);

      // If travelers were not filled out, use sensible defaults from profile
      const resolvedPassengers = passengers.length > 0 && passengers[0].firstName?.trim()
        ? passengers
        : [
            {
              title: 'Guest',
              firstName: currentUser?.displayName?.split(' ')[0] || 'Primary',
              lastName: currentUser?.displayName?.split(' ').slice(1).join(' ') || 'Traveler',
            },
          ];

      const resolvedContact = {
        email: contactEmail.trim() || currentUser?.email || 'traveler@nomadly.travel',
        phone: contactPhone.trim() || currentUser?.phoneNumber || '+91 99999 99999',
      };

      const bookingPayload = {
        travelCategory: category,
        inventoryId,
        passengers: resolvedPassengers,
        contactInfo: resolvedContact,
        couponCode: appliedCoupon?.code,
        addOns: selectedAddOns,
        sessionId,
        customSnapshot: itinerary,
        providerName: partnerInfo.name,
        providerReference: optionalPnr ? optionalPnr.trim() : undefined,
        isDirectConfirmed: true,
      };

      const bookingRes = await ApiClient.createBooking(bookingPayload);
      const booking = bookingRes.data;

      showToast(`Booking saved! Synchronized with ${partnerInfo.name}.`, 'success');

      if (booking) {
        try {
          sessionStorage.setItem('nomadly_latest_booking', JSON.stringify(booking));
        } catch (e) {
          console.warn('Could not cache booking to sessionStorage:', e);
        }
      }

      setIsPartnerModalOpen(false);

      navigate('/confirmation', {
        state: {
          booking,
          receipt: booking,
        },
      });
    } catch (err) {
      console.error('Save booking error:', err);
      showToast(err.message || 'Failed to save booking. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <CheckoutStepper currentStep={2} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {partnerInfo && (
            <div className="glass-panel p-4 rounded-2xl border border-coral-500/30 bg-coral-500/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-5 h-5 text-coral-400 shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-white">Book directly with {partnerInfo.name}</p>
                  <p className="text-[11px] text-slate-300">Skip the passenger form below and redirect directly without entering details.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleInitiatePartnerBooking}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs tracking-wide transition-all shrink-0 flex items-center justify-center gap-1.5"
              >
                <span>Book on {partnerInfo.name}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <SavedTravelersAutofill
            savedTravelers={user?.savedTravelers}
            onAutofill={handleAutofillSaved}
          />

          <PassengerDetailsForm
            passengers={passengers}
            setPassengers={setPassengers}
            onAddPassenger={handleAddPassenger}
            contactEmail={contactEmail}
            setContactEmail={setContactEmail}
            contactPhone={contactPhone}
            setContactPhone={setContactPhone}
          />

          <JourneyAddons
            selectedAddOns={selectedAddOns}
            setSelectedAddOns={setSelectedAddOns}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <CheckoutOrderSummary
            category={category}
            title={title}
            itinerary={itinerary}
            seatNumbers={seatNumbers}
            passengers={passengers}
            couponInput={couponInput}
            setCouponInput={setCouponInput}
            appliedCoupon={appliedCoupon}
            couponError={couponError}
            validatingCoupon={validatingCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            pricingMetrics={pricingMetrics}
            isProcessing={isProcessing}
            onPayAndConfirm={handleInitiatePartnerBooking}
            partnerInfo={partnerInfo}
          />
        </div>
      </div>

      <PartnerBookingModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        partnerInfo={partnerInfo}
        category={category}
        title={title}
        itinerary={itinerary}
        pricingMetrics={pricingMetrics}
        onConfirmBooking={handleConfirmPartnerBooking}
        isProcessing={isProcessing}
      />
    </div>
  );
};
