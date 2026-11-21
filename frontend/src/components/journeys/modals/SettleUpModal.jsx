import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, ArrowRight, Loader2, DollarSign } from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../utils/formatters';

export const SettleUpModal = ({ trip, isOpen, onClose, onSettled, initialData }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Derive all possible participants from trip
  const participants = React.useMemo(() => {
    const list = [];
    if (trip?.participants && trip.participants.length > 0) {
      trip.participants.forEach((p) => {
        list.push({
          userId: p.user?._id || p.user || null,
          name: p.name || 'Traveler',
          email: p.email || '',
        });
      });
    }
    return list;
  }, [trip]);

  const [fromMember, setFromMember] = useState(initialData?.from || '');
  const [toMember, setToMember] = useState(initialData?.to || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [paymentMethod, setPaymentMethod] = useState('UPI / GPay');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialData) {
      if (initialData.from) setFromMember(initialData.from);
      if (initialData.to) setToMember(initialData.to);
      if (initialData.amount) setAmount(initialData.amount);
    } else if (participants.length >= 2) {
      setFromMember(participants[0].name);
      setToMember(participants[1].name);
    }
  }, [initialData, participants]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromMember || !toMember) {
      showToast('Please select both payer and recipient', 'error');
      return;
    }
    if (fromMember === toMember) {
      showToast('Payer and recipient cannot be the same person', 'error');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      showToast('Please enter a valid settlement amount', 'error');
      return;
    }

    const payerObj = participants.find((p) => p.name === fromMember) || {
      name: fromMember,
      email: initialData?.fromEmail || '',
    };
    const recipientObj = participants.find((p) => p.name === toMember) || {
      name: toMember,
      email: initialData?.toEmail || '',
    };

    try {
      setLoading(true);
      const payload = {
        title: `Settlement: ${payerObj.name} paid ${recipientObj.name}`,
        category: 'settlement',
        amount: Number(amount),
        currency: trip.currency || 'INR',
        date,
        description: `Debt settlement via ${paymentMethod}`,
        paidBy: {
          userId: payerObj.userId || null,
          name: payerObj.name,
          email: payerObj.email,
        },
        splitType: 'custom',
        splits: [
          {
            user: recipientObj.userId || null,
            name: recipientObj.name,
            email: recipientObj.email,
            shareAmount: Number(amount),
            sharePercentage: 100,
            isSettled: true,
          },
        ],
      };

      const res = await ApiClient.createTripExpense(trip._id, payload);
      if (res.success) {
        showToast(`Settled ${formatCurrency(amount, trip.currency)} between ${payerObj.name} and ${recipientObj.name}!`, 'success');
        onSettled();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to record settlement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-ink-950/85 backdrop-blur-md p-4 flex justify-center py-6 sm:py-12 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-ink-900 border border-white/10 shadow-2xl overflow-hidden m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Record Settlement Payment</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300">
            Records an instant transfer between group members, automatically updating both balances and debt minimization.
          </div>

          {/* From & To Member */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Who Paid? (Debtor)</label>
              <select
                value={fromMember}
                onChange={(e) => setFromMember(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              >
                {participants.map((p, idx) => (
                  <option key={idx} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">To Whom? (Creditor)</label>
              <select
                value={toMember}
                onChange={(e) => setToMember(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              >
                {participants.map((p, idx) => (
                  <option key={idx} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Amount ({trip.currency || 'INR'}) *</label>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white font-mono font-bold"
                placeholder="6250"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          {/* Payment Method / Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Payment Method / Note</label>
            <div className="grid grid-cols-3 gap-2">
              {['UPI / GPay', 'Cash', 'Net Banking'].map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setPaymentMethod(mode)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    paymentMethod === mode
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                      : 'bg-ink-950 text-slate-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Preview */}
          {fromMember && toMember && amount && (
            <div className="p-3.5 rounded-2xl bg-ink-950 border border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">
                {fromMember} paid {toMember}
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrency(amount, trip.currency)}
              </span>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-ink-800 text-slate-300 text-xs font-semibold hover:bg-ink-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {loading ? 'Recording...' : 'Confirm Settlement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
};
