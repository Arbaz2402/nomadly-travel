import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Plane,
  Building2,
  Calendar,
  Sparkles,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Clock,
  Loader2,
  Percent,
  Luggage,
  Coffee,
  Car,
  Award,
  ChevronRight,
  Share2,
  Heart,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { useAuthStore } from '../../store/authStore';

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
  const activePhoto = photos[activePhotoIdx] || pkg.heroImage;

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

        {/* Photo Gallery Grid / Carousel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-10">
          {/* Main Large Display Image */}
          <div className="lg:col-span-8 relative aspect-[16/10] rounded-3xl overflow-hidden bg-ink-900 border border-white/10 shadow-2xl group">
            <img
              src={activePhoto}
              alt={pkg.title}
              className="w-full h-full object-cover transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent pointer-events-none" />

            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-teal-500 text-ink-950 text-xs font-black shadow-lg">
              {pkg.discountPercent}% COMBO SAVINGS
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white text-xs pointer-events-none">
              <span className="bg-ink-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 inline-block font-semibold">
                Photo {activePhotoIdx + 1} of {photos.length}
              </span>
            </div>
          </div>

          {/* Thumbnails Column */}
          <div className="lg:col-span-4 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-h-[460px] no-scrollbar">
            {photos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative flex-shrink-0 w-28 lg:w-full aspect-[16/10] rounded-2xl overflow-hidden border-2 transition-all ${
                  activePhotoIdx === idx
                    ? 'border-teal-400 ring-2 ring-teal-400/30'
                    : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                }`}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout: 2 Columns (Main Details + Sticky Checkout Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Main Details Column */}
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

              {/* Highlights List */}
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
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
              <h2 className="text-xl font-bold text-white font-display">
                Included Travel & Accommodations
              </h2>

              {/* Flight Card */}
              <div className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-coral-500/10 text-coral-400 flex items-center justify-center shrink-0">
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-coral-400 tracking-wider">
                        Return Economy Flights
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {pkg.flight?.airline || 'Air India'} • Flight {pkg.flight?.flightNumber || 'AI-842'}
                      </h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold">
                    Roundtrip Included
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Departure Flight</span>
                    <span className="font-bold text-white mt-0.5 block">
                      {pkg.originCity} ({pkg.originAirportCode}) ➔ {pkg.destinationCity}
                    </span>
                    <span className="text-slate-400 text-[11px] mt-0.5 block">
                      Departs {pkg.flight?.departureTime || '08:30 AM'} • {pkg.flight?.durationMinutes || 135} mins
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Return Flight</span>
                    <span className="font-bold text-white mt-0.5 block">
                      {pkg.destinationCity} ➔ {pkg.originCity} ({pkg.originAirportCode})
                    </span>
                    <span className="text-slate-400 text-[11px] mt-0.5 block">
                      Flexible evening return flight
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Baggage Allowance</span>
                    <span className="font-bold text-teal-400 mt-0.5 flex items-center gap-1.5">
                      <Luggage className="w-3.5 h-3.5" />
                      {pkg.flight?.baggageAllowance || '15 kg Check-in + 7 kg Cabin'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resort Card */}
              <div className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                        5★ Luxury Accommodation ({pkg.nights} Nights)
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {pkg.hotel?.name}
                      </h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <span>★ {pkg.hotel?.rating || 4.8}</span>
                    <span className="text-slate-400">({pkg.hotel?.starRating || 5}-Star)</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Award className="w-4 h-4 text-teal-400 shrink-0" />
                    <span><strong>Room Category:</strong> {pkg.roomType || 'Deluxe Luxury Suite'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{pkg.hotel?.address}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {pkg.hotel?.amenities?.map((amenity, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/5 text-[11px] text-slate-300 font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Day-by-Day Itinerary */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white font-display">
                    Day-by-Day Curated Itinerary
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Every detail planned for maximum relaxation and seamless travel.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {pkg.itinerary?.map((item) => (
                    <button
                      key={item.day}
                      onClick={() => setActiveDayTab(item.day)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                        activeDayTab === item.day
                          ? 'bg-teal-500 text-ink-950 shadow-md scale-105'
                          : 'bg-ink-900 text-slate-400 hover:text-white border border-white/10'
                      }`}
                    >
                      D{item.day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Itinerary Timeline */}
              <div className="space-y-4 pt-2">
                {pkg.itinerary?.map((item) => {
                  const isActive = activeDayTab === item.day;
                  return (
                    <div
                      key={item.day}
                      onClick={() => setActiveDayTab(item.day)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-ink-900/90 border-teal-500/40 shadow-lg'
                          : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                            isActive
                              ? 'bg-teal-500 text-ink-950'
                              : 'bg-ink-950 text-slate-400 border border-white/10'
                          }`}
                        >
                          {item.day}
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          Day {item.day}: {item.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 pl-10 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Inclusions */}
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

              {/* Exclusions */}
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

          {/* Right Column: Sticky Booking Card */}
          <div className="lg:col-span-4 sticky top-28 space-y-4">
            <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 line-through">
                    {formatCurrency(pkg.pricing.originalTotal, pkg.pricing.currency)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold">
                    Save {formatCurrency(pkg.pricing.savings, pkg.pricing.currency)} ({pkg.discountPercent}%)
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white font-display">
                    {formatCurrency(pkg.pricing.packagePrice, pkg.pricing.currency)}
                  </span>
                  <span className="text-xs text-slate-400">Total package</span>
                </div>
                <p className="text-xs text-teal-400 font-semibold">
                  Only {formatCurrency(pkg.pricing.perPerson, pkg.pricing.currency)} per person (based on 2 travelers)
                </p>
              </div>

              {/* Quick Summary Specs */}
              <div className="space-y-2.5 border-y border-white/10 py-4 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Destination:</span>
                  <span className="font-bold text-white">{pkg.destinationCity}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-bold text-white">{pkg.nights} Nights / {pkg.days || pkg.nights + 1} Days</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Flights:</span>
                  <span className="font-bold text-white">Return Non-stop Included</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Stay:</span>
                  <span className="font-bold text-white">5★ Verified Resort</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Taxes & Fees:</span>
                  <span className="font-bold text-teal-400">Calculated at Checkout</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBookNow}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-extrabold shadow-glow-teal flex items-center justify-center gap-2 transition-all group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  Instant confirmation • Direct airline & resort confirmation codes generated
                </p>
              </div>
            </div>

            {/* Assistance card */}
            <div className="p-4 rounded-2xl bg-ink-900/60 border border-white/5 text-xs text-slate-400 space-y-1 text-center">
              <span className="font-bold text-white block">Need custom dates or more travelers?</span>
              <p>Our 24/7 Concierge team can tailor any package to your travel dates.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailsPage;

