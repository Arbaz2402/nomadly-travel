import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, MapPin, Calendar, Users, Wallet, CheckCircle2, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export const TripReportModal = ({
  trip,
  itinerary = { items: [] },
  expenses = { data: [] },
  settlement = { settlementPlan: [], memberBalances: [] },
  isOpen,
  onClose,
}) => {
  if (!isOpen || !trip) return null;

  const items = itinerary?.items || [];
  const expList = expenses?.data || [];
  const totalSpent = trip.actualSpend || 0;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-ink-950/90 backdrop-blur-md p-4 flex justify-center py-6 print:p-0 print:bg-white"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-ink-900 border border-white/10 shadow-2xl overflow-hidden m-auto print:border-0 print:shadow-none print:bg-white print:text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Bar (hidden when printing) */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-ink-950/90 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-coral-400" />
            <h3 className="text-sm font-bold text-white font-display">
              Journey Summary & Expense Report
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Header */}
          <div className="border-b border-white/10 pb-5 space-y-2 print:border-slate-300">
            <div className="flex items-center gap-2 text-xs font-bold text-coral-400 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>{trip.destination}</span>
              {trip.additionalDestinations?.length > 0 && (
                <span>• {trip.additionalDestinations.join(' • ')}</span>
              )}
            </div>
            <h1 className="text-2xl font-black text-white font-display print:text-black">
              {trip.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 print:text-slate-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {trip.travelersCount || 1} Travelers
              </span>
              <span className="flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" />
                Total Spent: <strong className="text-white print:text-black">{formatCurrency(totalSpent, trip.currency)}</strong>
              </span>
            </div>
          </div>

          {/* Itinerary Summary */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 print:text-teal-700">
              Itinerary Activities ({items.length})
            </h4>
            {items.length === 0 ? (
              <p className="text-xs text-slate-500">No itinerary activities recorded.</p>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="p-3 rounded-xl bg-ink-950/80 border border-white/5 flex items-center justify-between text-xs print:bg-slate-50 print:border-slate-200"
                  >
                    <div>
                      <span className="font-bold text-white print:text-black">{item.title}</span>
                      <span className="text-[11px] text-slate-400 block print:text-slate-600">
                        {formatDate(item.date)} {item.startTime ? `• ${item.startTime}` : ''} {item.location?.name ? `• ${item.location.name}` : ''}
                      </span>
                    </div>
                    {item.status === 'completed' && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 print:text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expense & Settlement Summary */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-coral-400 print:text-coral-700">
              Expense & Settlement Summary
            </h4>
            {expList.length === 0 ? (
              <p className="text-xs text-slate-500">No expenses recorded.</p>
            ) : (
              <div className="space-y-2">
                {expList.map((exp, idx) => (
                  <div
                    key={exp._id || idx}
                    className="p-3 rounded-xl bg-ink-950/80 border border-white/5 flex items-center justify-between text-xs print:bg-slate-50 print:border-slate-200"
                  >
                    <div>
                      <span className="font-bold text-white print:text-black">{exp.title}</span>
                      <span className="text-[11px] text-slate-400 block print:text-slate-600">
                        Paid by {exp.paidBy?.name} • {formatDate(exp.date)}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white print:text-black">
                      {formatCurrency(exp.convertedAmount || exp.amount, trip.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {settlement?.settlementPlan?.length > 0 && (
              <div className="p-4 rounded-2xl bg-ink-950 border border-white/10 space-y-1.5 text-xs print:bg-slate-50 print:border-slate-300">
                <p className="font-bold text-slate-300 uppercase text-[10px] print:text-slate-700">
                  Final Settlement Plan
                </p>
                {settlement.settlementPlan.map((s, idx) => (
                  <p key={idx} className="text-slate-200 print:text-black">
                    • <strong>{s.from}</strong> owes <strong>{s.to}</strong>:{' '}
                    <span className="font-mono font-bold text-emerald-400 print:text-emerald-700">
                      {formatCurrency(s.amount, trip.currency)}
                    </span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
};
