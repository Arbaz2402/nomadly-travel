import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Send, Loader2, ArrowRight } from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../utils/formatters';

export const NotifySettlementModal = ({ trip, isOpen, onClose, initialData }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      setCustomMessage(
        `Hi ${initialData.from}, please settle ${formatCurrency(initialData.amount, trip.currency)} owed to ${initialData.to} for "${trip.title}".`
      );
    }
  }, [isOpen, initialData, trip]);

  if (!isOpen || !initialData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!initialData.fromEmail) {
      showToast('No email address found for this participant', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await ApiClient.notifySettlementDebtor(trip._id, {
        debtorName: initialData.from,
        debtorEmail: initialData.fromEmail,
        creditorName: initialData.to,
        amount: initialData.amount,
        customMessage,
      });

      if (res.success) {
        showToast(res.message || `Reminder sent to ${initialData.fromEmail}!`, 'success');
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to send settlement reminder', 'error');
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
            <div className="w-8 h-8 rounded-full bg-coral-500/20 text-coral-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white font-display">
              Send Settlement Email Reminder
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Recipient & Amount Card */}
          <div className="p-4 rounded-2xl bg-ink-950 border border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Sending To:</span>
              <span className="font-bold text-white">{initialData.from}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="font-mono text-teal-400">{initialData.fromEmail}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-slate-400 flex items-center gap-1">
                Owes {initialData.to} <ArrowRight className="w-3 h-3 text-coral-400" />
              </span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {formatCurrency(initialData.amount, trip.currency)}
              </span>
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Custom Message / Payment Instructions (UPI, Bank, etc.)
            </label>
            <textarea
              rows="4"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal note or UPI ID (e.g., Please GPay to arbaz@okicici)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-coral-500"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-ink-800 text-slate-300 text-xs font-semibold hover:bg-ink-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {loading ? 'Sending...' : 'Send Email Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
};
