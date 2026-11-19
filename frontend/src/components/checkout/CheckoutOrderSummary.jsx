import React from 'react';
import { Ticket, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const CheckoutOrderSummary = ({
  category = 'flight',
  title,
  itinerary = {},
  seatNumbers = [],
  passengers = [],
  couponInput,
  setCouponInput,
  appliedCoupon,
  couponError,
  validatingCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  pricingMetrics,
  isProcessing,
  onPayAndConfirm,
  partnerInfo,
}) => {
  const { rawBase, taxes, serviceFee, addOnsTotal, discountAmount, estimatedPayable } =
    pricingMetrics;

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/10 sticky top-28 space-y-6">
      <h3 className="text-base font-bold text-white tracking-tight font-display border-b border-white/5 pb-3">
        Booking Summary
      </h3>

      {/* Itinerary Snapshot */}
      <div className="bg-ink-900/60 p-4 rounded-2xl border border-white/5 text-xs space-y-2">
        <span className="text-[10px] uppercase font-bold text-coral-400 tracking-wider block">
          {(category || 'travel').toUpperCase()} RESERVATION
        </span>
        <p className="font-bold text-white text-sm">
          {title ||
            itinerary?.title ||
            itinerary?.airline ||
            itinerary?.hotelName ||
            itinerary?.trainName ||
            itinerary?.operatorName ||
            'Travel Reservation'}
        </p>
        {itinerary?.originCity && itinerary?.destinationCity && (
          <p className="text-slate-300">
            {itinerary.originCity} → {itinerary.destinationCity}
          </p>
        )}
        {seatNumbers && seatNumbers.length > 0 && (
          <p className="text-teal-400 font-semibold">Seats: {seatNumbers.join(', ')}</p>
        )}
        <p className="text-slate-400 text-[11px]">Travelers: {passengers.length} Adult(s)</p>
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
              onClick={onApplyCoupon}
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
              onClick={onRemoveCoupon}
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
          Try promo codes:{' '}
          <code className="text-coral-400 font-bold">NOMAD10</code>,{' '}
          <code className="text-coral-400 font-bold">FLYHIGH</code>
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

      {/* Book on Partner CTA */}
      <button
        type="button"
        disabled={isProcessing}
        onClick={onPayAndConfirm}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-coral-500 via-coral-600 to-coral-700 hover:from-coral-600 hover:to-coral-800 text-white font-extrabold text-sm tracking-wide shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Preparing Booking...</span>
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4" />
            <span>Book on {partnerInfo?.name || 'Partner'}</span>
          </>
        )}
      </button>

      <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
        <span>Official Partner Booking • Automatically Syncs with NOMADLY</span>
      </div>
    </div>
  );
};
