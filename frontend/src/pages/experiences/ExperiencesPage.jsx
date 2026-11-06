import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  Star,
  Clock,
  MapPin,
  Check,
  ShieldCheck,
  ChevronRight,
  Filter,
  Sparkles,
  Calendar,
  X,
  Plus,
  Loader2,
  Users,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { useAuthStore } from '../../store/authStore';

const CATEGORIES = [
  { id: 'all', label: 'All Experiences' },
  { id: 'water_sports', label: 'Water Sports' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'culture', label: 'Culture & Heritage' },
  { id: 'sightseeing', label: 'Sightseeing' },
];

export const ExperiencesPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuthStore();

  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchCity, setSearchCity] = useState('');
  const [selectedExperience, setSelectedExperience] = useState(null);

  // Add to Journey state
  const [showTripModal, setShowTripModal] = useState(false);
  const [expToAttach, setExpToAttach] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [attachingTripId, setAttachingTripId] = useState(null);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchCity.trim()) params.city = searchCity.trim();
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const res = await ApiClient.searchExperiences(params);
      if (res.success) {
        setExperiences(res.data || []);
      }
    } catch (err) {
      console.warn('Failed to load experiences:', err.message);
      showToast('Could not load experiences catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExperiences();
  };

  const handleBookNow = (exp) => {
    navigate('/checkout', {
      state: {
        category: 'experience',
        title: exp.title,
        experienceId: exp._id,
        pricing: {
          baseFare: exp.pricePerPerson,
          taxesAndFees: Math.round(exp.pricePerPerson * 0.18),
          totalPayable: Math.round(exp.pricePerPerson * 1.18),
          currency: exp.currency || 'INR',
        },
        passengers: [
          {
            title: 'Mr',
            firstName: user?.firstName || 'Lead',
            lastName: user?.lastName || 'Traveler',
            gender: 'male',
          },
        ],
        itinerarySnapshot: {
          destinationCity: exp.destinationCity,
          title: exp.title,
          durationHours: exp.durationHours,
          meetingPoint: exp.meetingPoint,
          featuredPhoto: exp.featuredPhoto,
        },
      },
    });
  };

  const openAddToTrip = async (exp) => {
    setExpToAttach(exp);
    setShowTripModal(true);
    try {
      setLoadingTrips(true);
      const res = await ApiClient.getMyTrips();
      if (res.success) {
        setUserTrips(res.data || []);
      }
    } catch (err) {
      console.warn('Could not load trips:', err.message);
    } finally {
      setLoadingTrips(false);
    }
  };

  const attachExpToTrip = async (tripId) => {
    if (!expToAttach) return;
    try {
      setAttachingTripId(tripId);
      const res = await ApiClient.createItineraryItem(tripId, {
        title: expToAttach.title,
        description: expToAttach.overview,
        category: 'activities',
        sourceType: 'manual_entry',
        location: {
          name: expToAttach.meetingPoint || expToAttach.destinationCity,
          city: expToAttach.destinationCity,
        },
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '13:00',
        estimatedCost: expToAttach.pricePerPerson,
        actualCost: expToAttach.pricePerPerson,
        currency: expToAttach.currency || 'INR',
      });

      if (res.success) {
        showToast(`Added "${expToAttach.title}" to journey!`, 'success');
        setShowTripModal(false);
        navigate(`/journeys/${tripId}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to add to journey', 'error');
    } finally {
      setAttachingTripId(null);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-b from-ink-900 to-ink-950 border-b border-white/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-500/10 border border-coral-500/20 text-coral-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            Curated Experiences & Tours
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Immersive Local Adventures & Tours
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Book certified scuba diving, royal lake cruises, desert safaris, and sunrise balloon flights with instant confirmation.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto flex items-center bg-ink-950/80 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-md"
          >
            <div className="flex-1 flex items-center gap-3 px-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search city (e.g. Goa, Udaipur, Dubai, Jaipur, Srinagar)..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-glow transition-all"
            >
              Search Tours
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-white text-ink-950 shadow-md'
                    : 'bg-ink-900/60 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-coral-500 animate-spin" />
            <span className="text-xs font-semibold">Loading authentic experiences...</span>
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl border border-white/5 p-8 max-w-md mx-auto">
            <Compass className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No experiences found</h3>
            <p className="text-xs text-slate-400 mt-1">Try searching for Goa, Udaipur, Dubai, or Mumbai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp) => (
              <div
                key={exp._id || exp.slug}
                className="glass-panel rounded-3xl border border-white/10 overflow-hidden hover:border-coral-500/40 transition-all group flex flex-col"
              >
                {/* Photo & Duration Badge */}
                <div className="relative aspect-[16/10] overflow-hidden bg-ink-900">
                  <img
                    src={exp.featuredPhoto}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-ink-950/80 backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1 border border-white/10">
                    <Clock className="w-3 h-3 text-teal-400" />
                    <span>{exp.durationHours} Hours</span>
                  </div>

                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/90 text-ink-950 font-bold text-[11px] flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{exp.rating}</span>
                    <span className="text-[9px] opacity-75">({exp.reviewsCount})</span>
                  </div>

                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-ink-950/80 backdrop-blur-md text-[10px] font-bold text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-coral-400" />
                    <span>{exp.destinationCity}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white font-display group-hover:text-coral-400 transition-colors line-clamp-1">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">
                      {exp.overview}
                    </p>

                    {/* Highlights */}
                    <div className="mt-3 space-y-1">
                      {exp.highlights?.slice(0, 2).map((hl, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-teal-300">
                          <Check className="w-3 h-3 text-teal-400 shrink-0" />
                          <span className="line-clamp-1">{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        From Per Person
                      </span>
                      <span className="text-xl font-extrabold text-white font-display">
                        {formatCurrency(exp.pricePerPerson, exp.currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openAddToTrip(exp)}
                        className="p-2.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
                        title="Add to My Journeys"
                      >
                        <Plus className="w-4 h-4 text-coral-400" />
                      </button>
                      <button
                        onClick={() => handleBookNow(exp)}
                        className="px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-glow transition-all"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add To Journey Modal */}
      {showTripModal && expToAttach && (
        <div
          className="fixed inset-0 z-[9999] bg-ink-950/85 backdrop-blur-md p-4 flex items-center justify-center animate-fade-in"
          onClick={() => setShowTripModal(false)}
        >
          <div
            className="w-full max-w-md bg-ink-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-coral-400 tracking-wider">
                  Journey Integration
                </span>
                <h3 className="text-base font-bold text-white">Add Tour to Journey</h3>
              </div>
              <button onClick={() => setShowTripModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select an active journey to add <span className="text-white font-bold">{expToAttach.title}</span> to its itinerary.
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {loadingTrips ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-coral-500" />
                  Loading journeys...
                </div>
              ) : userTrips.length === 0 ? (
                <div className="p-4 rounded-2xl bg-ink-950 border border-white/5 text-center text-xs text-slate-400">
                  No active journeys found. Create a journey first in My Journeys.
                </div>
              ) : (
                userTrips.map((t) => (
                  <div
                    key={t._id}
                    className="p-3 rounded-2xl bg-ink-950 border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{t.title}</p>
                      <p className="text-[10px] text-slate-400">{t.destination}</p>
                    </div>
                    <button
                      onClick={() => attachExpToTrip(t._id)}
                      disabled={attachingTripId === t._id}
                      className="px-3 py-1.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                    >
                      {attachingTripId === t._id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" /> Adding...
                        </>
                      ) : (
                        'Select'
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperiencesPage;
