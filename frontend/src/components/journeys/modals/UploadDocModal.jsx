import { createPortal } from 'react-dom';
import React, { useState, useMemo } from 'react';
import { X, Loader2, UploadCloud, User } from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

export const UploadDocModal = ({ trip, isOpen, onClose, onUploaded }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [memberName, setMemberName] = useState('All Travelers');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);

  // Consolidated active/accepted trip participants (exclude pending/declined invites)
  const participants = useMemo(() => {
    const list = [];
    if (trip?.participants && trip.participants.length > 0) {
      trip.participants
        .filter((p) => !p.status || p.status === 'accepted' || p.role === 'owner')
        .forEach((p) => {
          list.push({
            userId: p.user?._id || p.user || null,
            name: p.name || 'Traveler',
            email: p.email || '',
          });
        });
    }
    return list;
  }, [trip]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        showToast('File size exceeds 10MB limit', 'error');
        return;
      }
      setFile(selected);
      if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await ApiClient.uploadTripDocument(trip._id, {
            title: title.trim(),
            category,
            memberName,
            notes,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: reader.result,
          });
          if (res.success) {
            showToast('Document uploaded securely!', 'success');
            onUploaded();
            onClose();
          }
        } catch (uploadErr) {
          showToast(uploadErr.message || 'Upload failed', 'error');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast(err.message || 'File read failed', 'error');
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
        className="relative w-full max-w-md rounded-3xl bg-ink-900 border border-white/10 shadow-2xl p-6 space-y-4 m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white font-display">Upload Travel Document</h3>
            <p className="text-[11px] text-slate-400">Securely stored with preview & traveler assignment</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Document Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Arbaz's Passport, Shahbaz's Flight Ticket, Hotel Voucher"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white placeholder-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Document Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              >
                <option value="flight_ticket">Flight Ticket / Pass</option>
                <option value="hotel_confirmation">Hotel Voucher</option>
                <option value="train_ticket">Train Ticket</option>
                <option value="bus_ticket">Bus Ticket</option>
                <option value="travel_insurance">Travel Insurance</option>
                <option value="expense_receipt">Expense Receipt</option>
                <option value="passport_visa">Passport / Visa</option>
                <option value="other">Other Document</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>Whose Document?</span>
              </label>
              <select
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              >
                <option value="All Travelers">Shared / All Travelers</option>
                {participants.map((p, idx) => (
                  <option key={idx} value={p.name}>
                    {p.name}'s Document
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Select File (Max 10MB) *</label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-ink-800 file:text-slate-200 hover:file:bg-ink-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Valid until 2030, Seat 14A"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white placeholder-slate-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
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
              className="px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-glow flex items-center gap-1.5 transition-all"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
};
