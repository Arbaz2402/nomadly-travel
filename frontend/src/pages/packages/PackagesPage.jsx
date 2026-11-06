import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PackageCheck,
  Plane,
  Building2,
  Calendar,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Loader2,
  Plus,
  Percent,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { useAuthStore } from '../../store/authStore';

export const PackagesPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuthStore();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState('all');

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const res = await ApiClient.getVacationPackages();
        if (res.success) {
          setPackages(res.data || []);
        }
      } catch (err) {
        console.warn('Failed to load packages:', err.message);
        showToast('Could not load vacation packages', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleBookPackage = (pkg) => {
    navigate('/checkout', {
      state: {
        category: 'package',
        title: pkg.title,
        pricing: {
          baseFare: pkg.pricing.packagePrice,
          taxesAndFees: Math.round(pkg.pricing.packagePrice * 0.12),
          totalPayable: Math.round(pkg.pricing.packagePrice * 1.12),
          currency: pkg.pricing.currency || 'INR',
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
          title: pkg.title,
          destinationCity: pkg.destinationCity,
          originCity: pkg.originCity,
          nights: pkg.nights,
          flight: pkg.flight,
          hotel: pkg.hotel,
          perks: pkg.perks,
        },
      },
    });
  };

  const filteredPackages = selectedDuration === 'all'
    ? packages
    : packages.filter((p) => p.nights === Number(selectedDuration));

  return (
    <div className="min-h-screen pb-20">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-b from-ink-900 to-ink-950 border-b border-white/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Percent className="w-3.5 h-3.5" />
            Flight + Hotel Bundled Savings
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Curated Vacation Packages
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Save up to 20% by booking return flights and verified luxury hotels together in one seamless combo ticket.
          </p>

          {/* Duration Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setSelectedDuration('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDuration === 'all'
                  ? 'bg-white text-ink-950 shadow-md'
                  : 'bg-ink-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              All Durations
            </button>
            <button
              onClick={() => setSelectedDuration('2')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDuration === '2'
                  ? 'bg-white text-ink-950 shadow-md'
                  : 'bg-ink-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Weekend Getaways (2 Nights)
            </button>
            <button
              onClick={() => setSelectedDuration('3')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDuration === '3'
                  ? 'bg-white text-ink-950 shadow-md'
                  : 'bg-ink-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Short Stays (3 Nights)
            </button>
            <button
              onClick={() => setSelectedDuration('4')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedDuration === '4'
                  ? 'bg-white text-ink-950 shadow-md'
                  : 'bg-ink-900/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Extended Retreats (4 Nights)
            </button>
          </div>
        </div>
      </div>

      {/* Package Cards List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
            <span className="text-xs font-semibold">Bundling verified flights & boutique hotels...</span>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl border border-white/5 p-8 max-w-md mx-auto">
            <PackageCheck className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No packages available</h3>
            <p className="text-xs text-slate-400 mt-1">Please try choosing a different duration filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="glass-panel rounded-3xl border border-white/10 overflow-hidden hover:border-teal-500/40 transition-all flex flex-col group"
              >
                {/* Hero Destination Banner */}
                <div className="relative aspect-[16/8] sm:aspect-[16/7] overflow-hidden bg-ink-900">
                  <img
                    src={pkg.heroImage}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />

                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-teal-500/90 text-ink-950 text-xs font-black shadow-lg">
                    {pkg.discountPercent}% COMBO SAVINGS
                  </div>

                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-ink-950/80 backdrop-blur-md text-xs font-bold text-white border border-white/10 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>{pkg.nights} Nights / {pkg.nights + 1} Days</span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                      {pkg.destinationCity} Holiday Combo
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white font-display">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">{pkg.tagline}</p>
                  </div>
                </div>

                {/* Package Combo Components */}
                <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Flight & Hotel Dual Pills */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Paired Flight */}
                      <div className="p-3.5 rounded-2xl bg-ink-900/70 border border-white/5 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-coral-500/10 text-coral-400 flex items-center justify-center shrink-0">
                          <Plane className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Included Flight
                          </span>
                          <p className="text-xs font-bold text-white mt-0.5">
                            {pkg.flight?.airline || 'Air India'} • {pkg.originCity} to {pkg.destinationCity}
                          </p>
                          <p className="text-[11px] text-teal-400">Return Flights Included</p>
                        </div>
                      </div>

                      {/* Paired Hotel */}
                      <div className="p-3.5 rounded-2xl bg-ink-900/70 border border-white/5 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Included Stay
                          </span>
                          <p className="text-xs font-bold text-white mt-0.5 truncate">
                            {pkg.hotel?.name || `${pkg.destinationCity} Luxury Boutique Resort`}
                          </p>
                          <p className="text-[11px] text-amber-400 font-semibold">
                            {pkg.nights} Nights • Verified Luxury
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Curated Package Perks */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Complimentary Inclusions
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {pkg.perks?.map((perk, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                            <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            <span className="truncate">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Checkout Footer */}
                  <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 line-through">
                          {formatCurrency(pkg.pricing.originalTotal, pkg.pricing.currency)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-[10px] font-bold">
                          Save {formatCurrency(pkg.pricing.savings, pkg.pricing.currency)}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl font-extrabold text-white font-display">
                          {formatCurrency(pkg.pricing.packagePrice, pkg.pricing.currency)}
                        </span>
                        <span className="text-[11px] text-slate-400">Total for 2 travelers</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookPackage(pkg)}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-xs font-bold shadow-glow-teal flex items-center gap-2 transition-all"
                    >
                      <span>Book Complete Package</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackagesPage;
