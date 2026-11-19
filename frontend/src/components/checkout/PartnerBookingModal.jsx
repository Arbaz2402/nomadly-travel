import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, CheckCircle, ShieldCheck, X, Ticket, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const PartnerBookingModal = ({
  isOpen,
  onClose,
  partnerInfo,
  category,
  title,
  itinerary,
  pricingMetrics,
  onConfirmBooking,
  isProcessing,
}) => {
  const [pnrInput, setPnrInput] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirmBooking(pnrInput.trim());
  };

  const handleReopen = () => {
    if (partnerInfo?.url) {
      window.open(partnerInfo.url, '_blank', 'noopener,noreferrer');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-ink-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Partner Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-coral-500/10 border border-coral-500/30 flex items-center justify-center text-coral-400 shrink-0">
            <ExternalLink className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              {partnerInfo?.badge || 'Authorized Booking Partner'}
            </div>
            <h3 className="text-lg font-bold text-white font-display mt-0.5">
              Complete on {partnerInfo?.name || 'Partner Site'}
            </h3>
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-4 rounded-2xl bg-ink-950/70 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">{title || `${category?.toUpperCase()} Reservation`}</span>
            <span className="font-extrabold text-coral-400">
              {formatCurrency(pricingMetrics?.estimatedPayable || 0)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            We opened the official {partnerInfo?.name} reservation page in a new tab to complete your booking.
          </p>
        </div>

        {/* PNR / Confirmation Input (Optional) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-teal-400" />
              Partner PNR / Booking ID
            </span>
            <span className="text-[11px] text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={pnrInput}
            onChange={(e) => setPnrInput(e.target.value)}
            placeholder="e.g. WX9K2L or leave empty"
            className="w-full bg-ink-950 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-coral-500 font-mono tracking-wider uppercase"
          />
          <p className="text-[11px] text-slate-400">
            If the partner issued a confirmation code, paste it above. If not, you can leave it blank and confirm.
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleConfirm}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-coral-500 via-coral-600 to-coral-700 hover:from-coral-600 hover:to-coral-800 text-white font-extrabold text-sm tracking-wide shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving to Your Trips...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Confirm & Add to My Journeys</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs px-1">
            <button
              type="button"
              onClick={handleReopen}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-open Partner Tab
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-rose-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
