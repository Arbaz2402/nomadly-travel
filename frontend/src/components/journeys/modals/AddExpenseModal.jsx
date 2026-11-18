import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

export const AddExpenseModal = ({ trip, isOpen, onClose, onCreated }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'food',
    amount: '',
    currency: trip.currency || 'INR',
    date: new Date().toISOString().split('T')[0],
    description: '',
    splitType: 'equal',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await ApiClient.createTripExpense(trip._id, formData);
      if (res.success) {
        showToast('Expense recorded!', 'success');
        onCreated();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to record expense', 'error');
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
          <h3 className="text-lg font-bold text-white font-display">Record Trip Expense</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Expense Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Group Dinner at Cafe 1947"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Amount *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="2500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white font-semibold"
              >
                {['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'THB', 'JPY'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              >
                <option value="food">Food & Dining</option>
                <option value="flights">Flights</option>
                <option value="hotels">Hotels / Stays</option>
                <option value="trains">Trains</option>
                <option value="buses">Buses</option>
                <option value="local_transportation">Local Transit / Cabs</option>
                <option value="activities">Activities & Sightseeing</option>
                <option value="shopping">Shopping</option>
                <option value="insurance">Insurance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-ink-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-glow"
            >
              {loading ? 'Saving...' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
};
