import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { X, Loader2, UploadCloud } from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

export const UploadDocModal = ({ trip, isOpen, onClose, onUploaded }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [file, setFile] = useState(null);

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
      // Read as Data URL
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await ApiClient.uploadTripDocument(trip._id, {
            title,
            category,
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
        className="relative w-full max-w-sm rounded-3xl bg-ink-900 border border-white/10 shadow-2xl p-6 space-y-4 m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-display">Upload Travel Document</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Document Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Hotel Voucher or Boarding Pass"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Document Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
            >
              <option value="flight_ticket">Flight Ticket / Boarding Pass</option>
              <option value="hotel_confirmation">Hotel Voucher</option>
              <option value="train_ticket">Train Ticket</option>
              <option value="bus_ticket">Bus Ticket</option>
              <option value="travel_insurance">Travel Insurance</option>
              <option value="expense_receipt">Expense Receipt</option>
              <option value="passport_visa">Passport / Visa Copy</option>
              <option value="other">Other Travel Document</option>
            </select>
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

          <div className="pt-2 flex justify-end gap-2">
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
              className="px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-glow"
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
};

// =========================================================
// MODAL: AI MODIFY / SWAP ACTIVITY ("I don't want this, give this")
// =========================================================
