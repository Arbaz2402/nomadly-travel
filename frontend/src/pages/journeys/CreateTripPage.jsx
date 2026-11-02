import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Map,
  Calendar,
  DollarSign,
  Users,
  Compass,
  ArrowLeft,
  Sparkles,
  Check,
  Plus,
  X,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const PRESET_COVERS = [
  {
    title: 'Himalayan Peaks & Valley',
    url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Heritage Rajasthan Forts',
    url: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Tropical Coastal Retreat',
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Metropolitan Cityscape',
    url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'European Historic Old Town',
    url: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80',
  },
];

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export const CreateTripPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelersCount: 1,
    currency: 'INR',
    totalBudget: 60000,
    description: '',
    coverImage: PRESET_COVERS[0].url,
    status: 'upcoming',
  });

  const [additionalDestinations, setAdditionalDestinations] = useState([]);
  const [newDestInput, setNewDestInput] = useState('');
  const [customCoverOpen, setCustomCoverOpen] = useState(false);

  const handleAddDestination = () => {
    if (newDestInput.trim() && !additionalDestinations.includes(newDestInput.trim())) {
      setAdditionalDestinations([...additionalDestinations, newDestInput.trim()]);
      setNewDestInput('');
    }
  };

  const handleRemoveDestination = (index) => {
    setAdditionalDestinations(additionalDestinations.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.destination.trim()) {
      showToast('Trip title and primary destination are required', 'error');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      showToast('Start and end dates are required', 'error');
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      showToast('End date cannot be earlier than start date', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        additionalDestinations,
        totalBudget: Number(formData.totalBudget) || 50000,
        travelersCount: Number(formData.travelersCount) || 1,
        budget: {
          totalBudget: Number(formData.totalBudget) || 50000,
          currency: formData.currency,
          allocatedTransport: Math.round((formData.totalBudget || 50000) * 0.35),
          allocatedStay: Math.round((formData.totalBudget || 50000) * 0.45),
          allocatedActivities: Math.round((formData.totalBudget || 50000) * 0.2),
        },
      };

      const res = await ApiClient.createTrip(payload);
      if (res.success && res.data) {
        showToast('Journey created successfully! Welcome to your Trip Workspace.', 'success');
        navigate(`/journeys/${res.data._id}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create journey', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Back button */}
      <Link
        to="/journeys"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Journeys
      </Link>

      <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden bg-ink-900/90">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-white/10 bg-gradient-to-r from-ink-900 via-ink-850 to-ink-900">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-500/10 border border-coral-500/20 text-coral-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            Zero-Booking Required
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
            Plan a New Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Create an independent itinerary to organize external reservations (Booking.com, IRCTC, MakeMyTrip), manual activities, or attach real NOMADLY bookings.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Section 1: Core Details */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold tracking-widest text-coral-400">
              1. General Information
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Journey Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Summer in Manali & Spiti Valley 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-ink-950/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-coral-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Primary Destination *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manali, Himachal Pradesh"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-ink-950/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-coral-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Additional Stops / Cities (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Solang Valley"
                    value={newDestInput}
                    onChange={(e) => setNewDestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDestination();
                      }
                    }}
                    className="flex-1 px-4 py-3 rounded-2xl bg-ink-950/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-coral-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddDestination}
                    className="px-4 py-3 rounded-2xl bg-ink-800 hover:bg-ink-700 text-white font-bold text-xs"
                  >
                    Add
                  </button>
                </div>

                {additionalDestinations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {additionalDestinations.map((dest, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200"
                      >
                        {dest}
                        <button
                          type="button"
                          onClick={() => handleRemoveDestination(i)}
                          className="text-slate-400 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Trip Description & Notes
              </label>
              <textarea
                rows={2}
                placeholder="High-altitude road trip, local cafes, mountaineering gear rental, and stay in boutique cottages."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-ink-950/80 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-coral-500"
              />
            </div>
          </div>

          {/* Section 2: Dates & Travelers */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-xs uppercase font-bold tracking-widest text-coral-400">
              2. Dates & Group
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-ink-950/80 border border-white/10 text-sm text-white focus:outline-none focus:border-coral-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-ink-950/80 border border-white/10 text-sm text-white focus:outline-none focus:border-coral-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Travelers Count
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.travelersCount}
                    onChange={(e) => setFormData({ ...formData, travelersCount: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-ink-950/80 border border-white/10 text-sm text-white focus:outline-none focus:border-coral-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Budget & Multi-Currency */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-xs uppercase font-bold tracking-widest text-coral-400">
              3. Budget & Base Currency
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Base Trip Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-ink-950/80 border border-white/10 text-sm text-white font-semibold focus:outline-none focus:border-coral-500"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) — {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Individual expenses recorded in other currencies will be converted into this base currency.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Total Planned Budget
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  placeholder="50000"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-ink-950/80 border border-white/10 text-sm text-white font-mono focus:outline-none focus:border-coral-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Cover Image */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-bold tracking-widest text-coral-400">
                4. Select Cover Image
              </h3>
              <button
                type="button"
                onClick={() => setCustomCoverOpen(!customCoverOpen)}
                className="text-xs text-teal-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                {customCoverOpen ? 'Pick from Presets' : 'Custom Image URL'}
              </button>
            </div>

            {customCoverOpen ? (
              <div>
                <input
                  type="url"
                  placeholder="Paste direct image URL (https://images.unsplash.com/...)"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-ink-950/80 border border-white/10 text-sm text-white focus:outline-none focus:border-coral-500"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PRESET_COVERS.map((preset, idx) => {
                  const isSelected = formData.coverImage === preset.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => setFormData({ ...formData, coverImage: preset.url })}
                      className={`relative h-20 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group ${
                        isSelected
                          ? 'border-coral-500 ring-2 ring-coral-500/30'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-coral-500/20 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-coral-500 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4">
            <Link
              to="/journeys"
              className="px-5 py-3 rounded-2xl bg-ink-950 hover:bg-ink-800 text-slate-300 font-bold text-xs transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white font-bold text-xs uppercase tracking-wider shadow-glow flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Journey...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Launch Trip Workspace
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
