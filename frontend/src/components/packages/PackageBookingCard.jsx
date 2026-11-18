import React from 'react';
import { ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const PackageBookingCard = ({ pkg, onBookNow }) => {
  if (!pkg) return null;

  return (
    <>
      {/* Desktop Sticky Booking Card */}
      <div className="lg:col-span-4 sticky top-28 space-y-4">
        <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(pkg.pricing?.originalTotal, pkg.pricing?.currency)}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold">
                Save {formatCurrency(pkg.pricing?.savings, pkg.pricing?.currency)} ({pkg.discountPercent}%)
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-display">
                {formatCurrency(pkg.pricing?.packagePrice, pkg.pricing?.currency)}
              </span>
              <span className="text-xs text-slate-400">Total package</span>
            </div>
            <p className="text-xs text-teal-400 font-semibold">
              Only {formatCurrency(pkg.pricing?.perPerson, pkg.pricing?.currency)} per person (based on 2 travelers)
            </p>
          </div>

          {/* Quick Summary Specs */}
          <div className="space-y-2.5 border-y border-white/10 py-4 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Destination:</span>
              <span className="font-bold text-white">{pkg.destinationCity}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Duration:</span>
              <span className="font-bold text-white">
                {pkg.nights} Nights / {pkg.days || pkg.nights + 1} Days
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Flights:</span>
              <span className="font-bold text-white">Return Non-stop Included</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Stay:</span>
              <span className="font-bold text-white">5★ Verified Resort</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Taxes & Fees:</span>
              <span className="font-bold text-teal-400">Calculated at Checkout</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onBookNow}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-extrabold shadow-glow-teal flex items-center justify-center gap-2 transition-all group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Instant confirmation • Direct airline & resort confirmation codes generated
            </p>
          </div>
        </div>

        {/* Assistance card */}
        <div className="p-4 rounded-2xl bg-ink-900/60 border border-white/5 text-xs text-slate-400 space-y-1 text-center">
          <span className="font-bold text-white block">Need custom dates or more travelers?</span>
          <p>Our 24/7 Concierge team can tailor any package to your travel dates.</p>
        </div>
      </div>

      {/* Mobile Floating Bottom Booking Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-ink-950/95 backdrop-blur-xl border-t border-white/10 p-3.5 sm:p-4 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xl">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 line-through">
              {formatCurrency(pkg.pricing?.originalTotal, pkg.pricing?.currency)}
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-[10px] font-bold">
              -{pkg.discountPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-white font-display truncate">
              {formatCurrency(pkg.pricing?.packagePrice, pkg.pricing?.currency)}
            </span>
            <span className="text-[10px] text-slate-400 shrink-0">for 2</span>
          </div>
        </div>

        <button
          onClick={onBookNow}
          className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 text-white text-xs sm:text-sm font-bold shadow-glow-teal flex items-center gap-2 shrink-0"
        >
          <span>Book Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};
