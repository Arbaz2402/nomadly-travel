import React, { useState } from 'react';
import { X, Loader2, ExternalLink } from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

export const EditActivityModal = ({ trip, item, isOpen, onClose, onUpdated }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: item?.title || '',
    category: item?.category || 'sightseeing',
    startTime: item?.startTime || '10:00',
    endTime: item?.endTime || '12:00',
    locationName: item?.location?.name || '',
    locationAddress: item?.location?.address || '',
    estimatedCost: item?.estimatedCost || 0,
    description: item?.description || '',
    notes: item?.notes || '',
  });

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || '',
        category: item.category || 'sightseeing',
        startTime: item.startTime || '10:00',
        endTime: item.endTime || '12:00',
        locationName: item.location?.name || '',
        locationAddress: item.location?.address || '',
        estimatedCost: item.estimatedCost || 0,
        description: item.description || '',
        notes: item.notes || '',
      });
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Activity title is required', 'error');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        title: form.title.trim(),
        category: form.category,
        startTime: form.startTime,
        endTime: form.endTime,
        location: {
          name: form.locationName.trim() || trip.destination,
          address: form.locationAddress.trim() || form.locationName.trim() || trip.destination,
        },
        estimatedCost: Number(form.estimatedCost) || 0,
        description: form.description.trim(),
        notes: form.notes.trim(),
      };

      const res = await ApiClient.updateItineraryItem(trip._id, item._id, payload);
      if (res.success) {
        showToast('Activity updated successfully', 'success');
        onUpdated();
        onClose();
      } else {
        showToast(res.message || 'Failed to update activity', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update activity', 'error');
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-ink-900 border border-white/10 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl my-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
              <Edit3 className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-white font-display">Edit Activity</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Activity Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-white focus:outline-none focus:border-teal-500/50"
              >
                <option value="sightseeing">Sightseeing</option>
                <option value="restaurant">Dining / Food</option>
                <option value="activities">Adventure / Activity</option>
                <option value="culture">Culture / Heritage</option>
                <option value="shopping">Shopping</option>
                <option value="hotel">Stay / Resort</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Estimated Cost (INR)</label>
              <input
                type="number"
                min="0"
                value={form.estimatedCost}
                onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-white focus:outline-none focus:border-teal-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Location / Venue Name</label>
            <input
              type="text"
              value={form.locationName}
              onChange={(e) => setForm({ ...form, locationName: e.target.value })}
              placeholder="e.g. Raintree Restaurant, Madikeri"
              className="w-full px-4 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Description / Tips</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold shadow-glow"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
};
