import React from 'react';
import { ShieldCheck, Copy, QrCode } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const BoardingVoucherCard = ({ booking, onCopyReference }) => {
  return (
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
                onClick={onCopyReference}
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
            <p className="text-base font-bold text-white capitalize">
              {booking?.travelCategory || 'Travel'}
            </p>
            <p className="text-xs text-slate-400">
              {booking?.providerName || 'Nomadly Travel'}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Booking Date
            </span>
            <p className="text-sm font-bold text-white">
              {formatDate(booking?.createdAt || new Date())}
            </p>
            <p className="text-xs text-teal-400">
              Payment: {(booking?.paymentStatus || 'PAID').toUpperCase()}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Lead Contact
            </span>
            <p className="text-sm font-bold text-white truncate">
              {booking?.contactInfo?.email || 'N/A'}
            </p>
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
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-2xl bg-ink-900/60 border border-white/5"
              >
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
              <span className="text-[9px] uppercase font-extrabold block text-slate-600">
                Scan to Verify
              </span>
              <span className="text-xs font-mono font-bold">{booking.bookingReference}</span>
              <span className="text-[10px] text-teal-600 font-bold block">VALIDATED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
