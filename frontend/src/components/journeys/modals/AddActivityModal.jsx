import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

export const AddActivityModal = ({ trip, isOpen, onClose, onCreated }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'activities',
    sourceType: 'manual_entry',
    externalProvider: '',
    externalBookingUrl: '',
    bookingReference: '',
    locationName: '',
    date: trip.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : '',
    startTime: '10:00',
    endTime: '12:00',
    estimatedCost: 0,
    actualCost: 0,
    currency: trip.currency || 'INR',
    status: 'planned',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await ApiClient.addItineraryItem(trip._id, {
        ...formData,
        location: { name: formData.locationName, address: formData.locationName },
      });
      if (res.success) {
        showToast('Activity added to itinerary!', 'success');
        onCreated();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add activity', 'error');
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
        className="relative w-full max-w-xl rounded-3xl bg-ink-900 border border-white/10 shadow-2xl overflow-hidden m-auto flex flex-col max-h-[calc(100vh-3rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-display">Add Itinerary Activity</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Category & Source Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              >
                <option value="flight">Flight</option>
                <option value="hotel">Hotel / Stay</option>
                <option value="train">Train</option>
                <option value="bus">Bus</option>
                <option value="car_rental">Car Rental</option>
                <option value="restaurant">Restaurant</option>
                <option value="sightseeing">Sightseeing</option>
                <option value="activities">Activities</option>
                <option value="shopping">Shopping</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Source Type</label>
              <select
                value={formData.sourceType}
                onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              >
                <option value="manual_entry">Manual Entry</option>
                <option value="external_booking">External Booking (Booking.com, IRCTC, etc.)</option>
                <option value="unbooked_activity">Unbooked Wishlist Activity</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Activity Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Scuba Diving Session or Hotel Check-in"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
            />
          </div>

          {formData.sourceType === 'external_booking' && (
            <div className="grid grid-cols-2 gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">External Provider</label>
                <input
                  type="text"
                  placeholder="e.g. Booking.com, IRCTC"
                  value={formData.externalProvider}
                  onChange={(e) => setFormData({ ...formData, externalProvider: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Confirmation / PNR</label>
                <input
                  type="text"
                  placeholder="e.g. BK-98234"
                  value={formData.bookingReference}
                  onChange={(e) => setFormData({ ...formData, bookingReference: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              >
              </input>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Location / Venue</label>
              <input
                type="text"
                placeholder="e.g. Baga Beach or Old Manali"
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Actual Cost</label>
              <input
                type="number"
                min="0"
                value={formData.actualCost}
                onChange={(e) => setFormData({ ...formData, actualCost: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white font-mono"
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
              {loading ? 'Saving...' : 'Add Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
};
