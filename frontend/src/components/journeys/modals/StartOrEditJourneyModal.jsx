import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Play, Save, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/formatters';

export const StartOrEditJourneyModal = ({
  trip,
  isOpen,
  mode = 'edit', // 'expired-start' | 'edit'
  onClose,
  onUpdated,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [travelersCount, setTravelersCount] = useState(1);
  const [shiftItineraryDates, setShiftItineraryDates] = useState(true);

  useEffect(() => {
    if (!isOpen || !trip) return;

    setTitle(trip.title || '');
    setDestination(trip.destination || '');
    setTotalBudget(String(trip.budget?.totalBudget ?? 50000));
    setTravelersCount(trip.travelersCount || 1);

    const origStart = new Date(trip.startDate);
    const origEnd = new Date(trip.endDate);
    const durationMs = Math.max(0, origEnd.getTime() - origStart.getTime());

    if (mode === 'expired-start') {
      // Suggest starting today with the same trip duration
      const today = new Date();
      const suggestedEnd = new Date(today.getTime() + durationMs);
      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(suggestedEnd.toISOString().split('T')[0]);
      setShiftItineraryDates(true);
    } else {
      setStartDate(origStart.toISOString().split('T')[0]);
      setEndDate(origEnd.toISOString().split('T')[0]);
      setShiftItineraryDates(true);
    }
  }, [isOpen, trip, mode]);

  if (!isOpen || !trip) return null;

  const isExpiredStart = mode === 'expired-start';

  const handleSave = async (e, startNow = false, keepOldDates = false) => {
    if (e) e.preventDefault();

    if (!keepOldDates && new Date(endDate) < new Date(startDate)) {
      showToast('End date cannot be before start date', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = keepOldDates
        ? { status: 'ongoing' }
        : {
            title: title.trim(),
            destination: destination.trim(),
            startDate,
            endDate,
            totalBudget: Number(totalBudget) || 50000,
            travelersCount: Number(travelersCount) || 1,
            shiftItineraryDates,
            ...(startNow ? { status: 'ongoing' } : {}),
          };

      const res = await ApiClient.updateTrip(trip._id, payload);
      if (res.success) {
        showToast(
          startNow
            ? keepOldDates
              ? 'Journey started with original dates!'
              : 'Journey dates updated & Live Mode started!'
            : 'Journey details updated!',
          'success'
        );
        onUpdated();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update journey', 'error');
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
        className="relative w-full max-w-lg rounded-3xl bg-ink-900 border border-white/10 shadow-2xl overflow-hidden m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isExpiredStart ? 'bg-amber-500/15 text-amber-400' : 'bg-coral-500/15 text-coral-400'
              }`}
            >
              {isExpiredStart ? <AlertTriangle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                {isExpiredStart ? 'Journey Dates Have Passed' : 'Edit Journey Details & Dates'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isExpiredStart
                  ? `Scheduled for ${formatDate(trip.startDate)} — ${formatDate(trip.endDate)}`
                  : 'Update trip title, destination, dates, budget, or travelers'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => handleSave(e, isExpiredStart, false)} className="p-6 space-y-4">
          {isExpiredStart && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 leading-relaxed">
              Your scheduled dates (<strong>{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</strong>) are in the past. Would you like to update the dates to start fresh today?
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Journey Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Destination</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Budget ({trip.currency})</label>
              <input
                type="number"
                min="0"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Travelers</label>
              <input
                type="number"
                min="1"
                value={travelersCount}
                onChange={(e) => setTravelersCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white font-mono"
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-ink-950/80 border border-white/5 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={shiftItineraryDates}
              onChange={(e) => setShiftItineraryDates(e.target.checked)}
              className="rounded border-slate-600 text-coral-500 focus:ring-0"
            />
            <span>
              Automatically shift all itinerary activity dates to match the new start date
            </span>
          </label>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-end gap-2.5">
            {isExpiredStart && (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSave(null, true, true)}
                className="px-3.5 py-2 rounded-xl bg-ink-800 hover:bg-ink-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Keep Old Dates & Start
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-ink-950 border border-white/10 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all ${
                isExpiredStart ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-coral-500 hover:bg-coral-600'
              }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isExpiredStart ? (
                <Play className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {loading ? 'Saving...' : isExpiredStart ? 'Update Dates & Start' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
};
