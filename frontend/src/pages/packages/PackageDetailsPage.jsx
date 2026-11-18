import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Sparkles,
  Check,
  X,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Clock,
  Loader2,
  Percent,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuthStore } from '../../store/authStore';
import { PackageGallery } from '../../components/packages/PackageGallery';
import { PackageInclusionsCard } from '../../components/packages/PackageInclusionsCard';
import { PackageItineraryTimeline } from '../../components/packages/PackageItineraryTimeline';
import { PackageBookingCard } from '../../components/packages/PackageBookingCard';

export const PackageDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuthStore();

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activeDayTab, setActiveDayTab] = useState(1);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        setLoading(true);
        const res = await ApiClient.getPackageById(id);
        if (res.success && res.data) {
          setPkg(res.data);
        } else {
          showToast('Vacation package not found', 'error');
        }
      } catch (err) {
        console.warn('Failed to fetch package:', err.message);
        showToast('Could not load package details', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPackageDetails();
    }
  }, [id]);

  const handleBookNow = () => {
    if (!pkg) return;
    const pkgPrice = pkg?.pricing?.packagePrice || 25000;

    navigate('/checkout', {
      state: {
        category: 'package',
        inventoryId: pkg.id,
        title: pkg.title,
        pricing: {
          baseFare: pkgPrice,
          taxesAndFees: Math.round(pkgPrice * 0.12),
          totalPayable: Math.round(pkgPrice * 1.12),
          currency: pkg?.pricing?.currency || 'INR',
        },
        passengers: [
          {
            title: 'Mr',
            firstName: user?.firstName || 'Lead',
            lastName: user?.lastName || 'Traveler',
            gender: 'male',
          },
        ],
        itinerary: {
          title: pkg.title,
          destinationCity: pkg.destinationCity,
          originCity: pkg.originCity,
          nights: pkg.nights,
          flight: pkg.flight,
          hotel: pkg.hotel,
          perks: pkg.perks,
          baseFare: pkgPrice,
          totalAmount: pkgPrice,
        },
        itinerarySnapshot: {
          title: pkg.title,
          destinationCity: pkg.destinationCity,
          originCity: pkg.originCity,
          nights: pkg.nights,
          flight: pkg.flight,
          hotel: pkg.hotel,
          perks: pkg.perks,
          baseFare: pkgPrice,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-32 flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
        <p className="text-sm font-semibold">Loading luxury package itinerary & verified flights...</p>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen py-32 max-w-xl mx-auto px-4 text-center">
        <div className="glass-panel rounded-3xl p-8 border border-white/10 space-y-4">
          <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Package Not Found</h2>
          <p className="text-sm text-slate-400">
            The vacation package you are looking for may have expired or is unavailable.
          </p>
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-500 text-ink-950 font-bold text-xs hover:bg-teal-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse All Packages</span>
          </Link>
        </div>
      </div>
    );
  }

  const photos = pkg.gallery && pkg.gallery.length > 0 ? pkg.gallery : [pkg.heroImage];

  return (
    <div className="min-h-screen pb-28">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="border-b border-white/10 bg-ink-950/60 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link
            to="/packages"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Packages</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold">
              <Percent className="w-3.5 h-3.5" />
              {pkg.discountPercent}% Package Savings
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Main Title Section */}
        <div className="space-y-2 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-xs font-black uppercase tracking-wider">
              {pkg.destinationCity} All-Inclusive
            </span>
            <span className="px-3 py-1 rounded-full bg-ink-900 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              {pkg.nights} Nights / {pkg.days || pkg.nights + 1} Days
            </span>
            <span className="px-3 py-1 rounded-full bg-ink-900 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-coral-400" />
              Roundtrip from {pkg.originCity} ({pkg.originAirportCode})
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
            {pkg.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl">
            {pkg.tagline}
          </p>
        </div>

        {/* Photo Gallery Grid */}
        <PackageGallery
          photos={photos}
          activePhotoIdx={activePhotoIdx}
          setActivePhotoIdx={setActivePhotoIdx}
          title={pkg.title}
          discountPercent={pkg.discountPercent}
        />

        {/* Content Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-10">
            {/* Overview & Highlights */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
              <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                Package Overview
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {pkg.overview}
              </p>

              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Trip Highlights & Special Perks
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pkg.highlights?.map((hl, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <Check className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Included Flight & Hotel Breakdown */}
            <PackageInclusionsCard pkg={pkg} />

            {/* Day-by-Day Itinerary */}
            <PackageItineraryTimeline
              itinerary={pkg.itinerary}
              activeDayTab={activeDayTab}
              setActiveDayTab={setActiveDayTab}
            />

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-400" />
                  What's Included in This Package
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {pkg.inclusions?.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <X className="w-4 h-4 text-slate-400" />
                  Exclusions & Extra Add-ons
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-400">
                  {pkg.exclusions?.map((exc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <X className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Cancellation Policy Guarantee */}
            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Nomadly Booking Guarantee & Cancellation Policy</h4>
                <p className="text-xs text-slate-300 mt-0.5">{pkg.cancellationPolicy}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Card & Mobile Bar */}
          <PackageBookingCard pkg={pkg} onBookNow={handleBookNow} />
        </div>
      </div>
    </div>
  );
};

export default PackageDetailsPage;
