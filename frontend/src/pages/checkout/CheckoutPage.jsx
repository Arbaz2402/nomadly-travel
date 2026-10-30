import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  User,
  Ticket,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

export const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, demoSignIn } = useAuthStore();
  const { showToast } = useToast();

  const checkoutState = location.state;

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

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Add-ons
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  // Submitting & Processing
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
  }, [user, checkoutState]);

  if (!checkoutState) return null;

  const { category, inventoryId, itinerary, sessionId, seatNumbers } = checkoutState;

  // Calculate local preview (Authoritative validation occurs on the server)
  const baseFare = itinerary.baseFare || 3000;
  const quantity = passengers.length;
  const rawBase = baseFare * quantity;
  const taxes = Math.round(rawBase * (category === 'flight' || category === 'hotel' ? 0.18 : 0.12));
  const serviceFee = category === 'bus' ? 40 : 150;
  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.calculatedDiscount : 0;
  const estimatedPayable = Math.max(0, rawBase + taxes + serviceFee + addOnsTotal - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      setValidatingCoupon(true);
      setCouponError('');
      const res = await ApiClient.validateCoupon({
        code: couponInput,
        category,
        amount: rawBase,
      });

      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        showToast(`Promo ${res.data.code} applied! Saved ₹${res.data.calculatedDiscount}`, 'success');
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
    // 1. Ensure user is authenticated, if not sign in via demo quickly
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

    // Validate traveler inputs
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

      // Step A: Create authoritative booking on server
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

      // Step B: Create payment order
      const orderRes = await ApiClient.createPaymentOrder({
        bookingId: booking._id,
        amount: booking.pricing.totalPayable,
        currency: booking.pricing.currency,
      });

      const { orderId } = orderRes.data;

      // Step C: Verify payment securely on server (Sandbox/Razorpay verification)
      const verifyRes = await ApiClient.verifyPayment({
        bookingId: booking._id,
        orderId,
        paymentId: `pay_sandbox_${Date.now()}`,
        signature: 'sandbox_verified_secure_signature',
      });

      showToast('Payment verified successfully! Booking confirmed.', 'success');

      // Navigate to Confirmation Page
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
      {/* Checkout Progress Stepper */}
      <div className="flex items-center justify-center gap-4 mb-10 text-xs font-semibold">
        <span className="text-teal-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> 1. Search & Select
        </span>
        <span className="w-8 h-[1px] bg-teal-500/40"></span>
        <span className="text-coral-500 flex items-center gap-1.5 font-bold">
          <span className="w-4 h-4 rounded-full bg-coral-500 text-white flex items-center justify-center text-[10px]">2</span>
          2. Review & Traveler Details
        </span>
        <span className="w-8 h-[1px] bg-white/10"></span>
        <span className="text-slate-500 flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-full bg-ink-800 text-slate-400 flex items-center justify-center text-[10px]">3</span>
          3. Confirmation
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Traveler Details & Addons */}
        <div className="lg:col-span-8 space-y-6">
          {/* Quick Saved Travelers Helper */}
          {user?.savedTravelers && user.savedTravelers.length > 0 && (
            <div className="glass-panel rounded-3xl p-5 border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-coral-500" />
                  Quick Autofill from Saved Travelers
                </p>
                <p className="text-[11px] text-slate-400">Click to instantly populate lead passenger details</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {user.savedTravelers.map((saved) => (
                  <button
                    key={saved._id || saved.firstName}
                    type="button"
                    onClick={() => handleAutofillSaved(saved)}
                    className="px-3 py-1.5 rounded-xl bg-ink-900 hover:bg-coral-500/10 border border-white/10 hover:border-coral-500/40 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-coral-400" />
                    <span>{saved.firstName} {saved.lastName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Passengers Forms */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <User className="w-5 h-5 text-coral-500" />
                  Traveler Details
                </h2>
                <p className="text-xs text-slate-400">Must match government-issued photo ID</p>
              </div>

              <button
                type="button"
                onClick={handleAddPassenger}
                className="text-xs font-bold text-coral-400 hover:text-coral-300"
              >
                + Add Another Passenger
              </button>
            </div>

            {passengers.map((p, idx) => (
              <div key={idx} className="bg-ink-900/50 p-4 rounded-2xl border border-white/5 space-y-3">
                <span className="text-[11px] font-bold text-coral-400 uppercase tracking-wider block">
                  Passenger {idx + 1} {idx === 0 && '(Lead Passenger)'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Title
                    </label>
                    <select
                      value={p.title}
                      onChange={(e) => {
                        const updated = [...passengers];
                        updated[idx].title = e.target.value;
                        setPassengers(updated);
                      }}
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Mr">Mr</option>
                      <option value="Ms">Ms</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Dr">Dr</option>
                    </select>
                  </div>

                  <div className="sm:col-span-5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={p.firstName}
                      onChange={(e) => {
                        const updated = [...passengers];
                        updated[idx].firstName = e.target.value;
                        setPassengers(updated);
                      }}
                      placeholder="e.g. Aarav"
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-coral-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={p.lastName}
                      onChange={(e) => {
                        const updated = [...passengers];
                        updated[idx].lastName = e.target.value;
                        setPassengers(updated);
                      }}
                      placeholder="e.g. Sharma"
                      className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-coral-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Contact Details */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Contact & E-Ticket Delivery Information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="traveler@example.com"
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-coral-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-coral-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Add-on Protection Options */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Recommended Journey Add-ons
            </h3>

            <div className="space-y-3">
              {[
                { id: 'insurance', name: 'Comprehensive Travel Care & Baggage Protection', price: 299, desc: 'Coverage up to ₹5,00,000 for emergency medical & delay protection' },
                { id: 'zero_cancel', name: 'Zero Cancellation Guarantee', price: 499, desc: 'Receive 100% instant refund if you cancel up to 12 hours prior to departure' },
              ].map((addon) => {
                const isSelected = selectedAddOns.some((a) => a.id === addon.id);
                return (
                  <label
                    key={addon.id}
                    className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-ink-900 border-teal-500/50 shadow-glow-teal'
                        : 'bg-ink-900/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedAddOns(selectedAddOns.filter((a) => a.id !== addon.id));
                          } else {
                            setSelectedAddOns([...selectedAddOns, addon]);
                          }
                        }}
                        className="mt-1 rounded bg-ink-950 border-white/20 text-teal-500 focus:ring-0 w-4 h-4"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{addon.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{addon.desc}</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-teal-400 ml-3">
                      +{formatCurrency(addon.price)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Summary, Coupon Code, Price Breakdown & Payment */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-white/10 sticky top-28 space-y-6">
            <h3 className="text-base font-bold text-white tracking-tight font-display border-b border-white/5 pb-3">
              Booking Summary
            </h3>

            {/* Itinerary Snapshot */}
            <div className="bg-ink-900/60 p-4 rounded-2xl border border-white/5 text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-coral-400 tracking-wider block">
                {category.toUpperCase()} RESERVATION
              </span>
              <p className="font-bold text-white text-sm">
                {itinerary.airline || itinerary.hotelName || itinerary.trainName || itinerary.operatorName}
              </p>
              {itinerary.originCity && itinerary.destinationCity && (
                <p className="text-slate-300">
                  {itinerary.originCity} → {itinerary.destinationCity}
                </p>
              )}
              {seatNumbers && seatNumbers.length > 0 && (
                <p className="text-teal-400 font-semibold">
                  Seats: {seatNumbers.join(', ')}
                </p>
              )}
              <p className="text-slate-400 text-[11px]">
                Travelers: {passengers.length} Adult(s)
              </p>
            </div>

            {/* Coupon Code Section */}
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-coral-500" />
                Apply Promotional Coupon
              </label>

              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g. NOMAD10, FLYHIGH"
                    className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase focus:border-coral-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    disabled={validatingCoupon || !couponInput.trim()}
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 rounded-xl bg-ink-800 hover:bg-coral-500 text-white font-bold text-xs transition-all disabled:opacity-50"
                  >
                    {validatingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs">
                  <div>
                    <span className="font-mono font-bold">{appliedCoupon.code}</span>
                    <span className="text-[11px] block text-teal-400">Coupon applied successfully!</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-slate-400 hover:text-white text-xs underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {couponError}
                </p>
              )}

              <p className="text-[10px] text-slate-500 mt-1.5">
                Try promo codes: <code className="text-coral-400 font-bold">NOMAD10</code>, <code className="text-coral-400 font-bold">FLYHIGH</code>
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pt-3 border-t border-white/5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Base Fare ({passengers.length} Traveler)</span>
                <span className="font-medium text-white">{formatCurrency(rawBase)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST</span>
                <span className="font-medium text-white">{formatCurrency(taxes)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Service Fee</span>
                <span className="font-medium text-white">{formatCurrency(serviceFee)}</span>
              </div>
              {addOnsTotal > 0 && (
                <div className="flex justify-between text-teal-400">
                  <span>Journey Protection</span>
                  <span>+{formatCurrency(addOnsTotal)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-coral-400 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-sm">
                <span className="font-bold text-white font-display">Total Payable</span>
                <span className="text-2xl font-extrabold text-white font-display">
                  {formatCurrency(estimatedPayable)}
                </span>
              </div>
            </div>

            {/* Pay & Confirm CTA */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePaymentAndConfirm}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-coral-500 via-coral-600 to-coral-700 hover:from-coral-600 hover:to-coral-800 text-white font-extrabold text-sm tracking-wide shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying & Confirming...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay & Confirm Reservation</span>
                </>
              )}
            </button>

            <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Razorpay 256-bit Sandbox / Live SSL Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
