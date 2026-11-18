import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { useCheckoutPricing } from '../../hooks/useCheckoutPricing';
import { CheckoutStepper } from '../../components/checkout/CheckoutStepper';
import { SavedTravelersAutofill } from '../../components/checkout/SavedTravelersAutofill';
import { PassengerDetailsForm } from '../../components/checkout/PassengerDetailsForm';
import { JourneyAddons } from '../../components/checkout/JourneyAddons';
import { CheckoutOrderSummary } from '../../components/checkout/CheckoutOrderSummary';

export const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, demoSignIn } = useAuthStore();
  const { showToast } = useToast();

  const checkoutState = location.state;

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

  const handlePaymentAndConfirm = async () => {
    let currentUser = user;
    if (!currentUser) {
      try {
        const demoRes = await demoSignIn('customer');
        currentUser = demoRes.user;
        showToast('Signed in with Demo Traveler account for checkout', 'info');
      } catch (e) {
        showToast('Authentication required to book.', 'error');
        return;
      }
    }

    for (const p of passengers) {
      if (!p.firstName.trim() || !p.lastName.trim()) {
        showToast('Please provide full first and last name for all travelers.', 'error');
        return;
      }
    }

    if (!contactEmail.trim() || !contactPhone.trim()) {
      showToast('Please provide contact email and phone number for receipt delivery.', 'error');
      return;
    }

    try {
      setIsProcessing(true);

      const bookingPayload = {
        travelCategory: category,
        inventoryId,
        passengers,
        contactInfo: { email: contactEmail, phone: contactPhone },
        couponCode: appliedCoupon?.code,
        addOns: selectedAddOns,
        sessionId,
        customSnapshot: itinerary,
      };

      const bookingRes = await ApiClient.createBooking(bookingPayload);
      const booking = bookingRes.data;

      const orderRes = await ApiClient.createPaymentOrder({
        bookingId: booking._id,
        amount: booking.pricing.totalPayable,
        currency: booking.pricing.currency,
      });

      const { orderId } = orderRes.data;

      const verifyRes = await ApiClient.verifyPayment({
        bookingId: booking._id,
        orderId,
        paymentId: `pay_sandbox_${Date.now()}`,
        signature: 'sandbox_verified_secure_signature',
      });

      showToast('Payment verified successfully! Booking confirmed.', 'success');

      if (verifyRes.data?.booking) {
        try {
          sessionStorage.setItem('nomadly_latest_booking', JSON.stringify(verifyRes.data.booking));
        } catch (e) {
          console.warn('Could not cache booking to sessionStorage:', e);
        }
      }

      navigate('/confirmation', {
        state: {
          booking: verifyRes.data.booking,
          receipt: verifyRes.data.booking,
        },
      });
    } catch (err) {
      console.error('Checkout error:', err);
      showToast(err.message || 'Payment processing failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <CheckoutStepper currentStep={2} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
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
            onPayAndConfirm={handlePaymentAndConfirm}
          />
        </div>
      </div>
    </div>
  );
};
