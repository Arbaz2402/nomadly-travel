import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { X, Loader2, Mail, Send } from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

export const AddMemberModal = ({ trip, isOpen, onClose, onCreated }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await ApiClient.addTripParticipant(trip._id, { name, email, role });
      if (res.success) {
        onClose();
        setName('');
        setEmail('');
        onCreated();
        showToast(
          res.message || `Invitation email successfully sent to ${name} (${email})!`,
          res.emailSent === false ? 'warning' : 'success'
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to send collaboration request', 'error');
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
        className="relative w-full max-w-sm rounded-3xl bg-ink-900 border border-white/10 shadow-2xl p-6 space-y-4 m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-coral-500/10 border border-coral-500/20 text-coral-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">Send Collaboration Request</h3>
              <p className="text-[11px] text-slate-400">Invite a partner to plan this journey</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed bg-ink-950/60 p-3 rounded-2xl border border-white/5">
          An invitation request will be sent to the companion. They will be in{' '}
          <strong className="text-amber-400">Pending</strong> status until they accept the request.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Companion Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-coral-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Companion Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. priya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-coral-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Role & Permissions</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white font-semibold focus:outline-none focus:border-coral-500"
            >
              <option value="editor">Editor (Can edit itinerary & track expenses)</option>
              <option value="viewer">Viewer (Read-only access)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-500/[0.08] border border-teal-500/20 text-xs text-teal-300 font-medium">
            <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>An invitation email will be delivered to their inbox automatically.</span>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-white/5">
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-rose-600 hover:from-coral-600 text-white text-xs font-bold shadow-glow flex items-center gap-1.5 disabled:opacity-50 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Sending...' : 'Send Invitation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
};
