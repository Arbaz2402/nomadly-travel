import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plane,
  Building2,
  Compass,
  ArrowRight,
  Sparkles,
  Star,
  MapPin,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { UnifiedSearchHero } from '../../components/search/UnifiedSearchHero';
import { ApiClient } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export const HomePage = () => {
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [featuredExperiences, setFeaturedExperiences] = useState([]);
  const [loadingExp, setLoadingExp] = useState(true);

  // Fallback verified boutique collections if database is starting up
  const fallbackCollections = [
    {
      _id: 'fallback-1',
      name: 'The Oberoi Udaivilas, Udaipur',
      propertyType: 'resort',
      featuredPhoto: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      location: { city: 'Udaipur', state: 'Rajasthan' },
      starRating: 5,
      guestRating: 9.8,
      rooms: [{ pricePerNight: 36000 }],
    },
    {
      _id: 'fallback-2',
      name: 'Alila Diwa Goa - Hyatt Unbound',
      propertyType: 'resort',
      featuredPhoto: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
      location: { city: 'Goa', state: 'Goa' },
      starRating: 5,
      guestRating: 9.2,
      rooms: [{ pricePerNight: 18500 }],
    },
    {
      _id: 'fallback-3',
      name: 'The Taj Mahal Palace, Mumbai',
      propertyType: 'hotel',
      featuredPhoto: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      location: { city: 'Mumbai', state: 'Maharashtra' },
      starRating: 5,
      guestRating: 9.6,
      rooms: [{ pricePerNight: 24500 }],
    },
    {
      _id: 'fallback-4',
      name: 'The Leela Palace, New Delhi',
      propertyType: 'hotel',
      featuredPhoto: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
      location: { city: 'New Delhi', state: 'Delhi' },
      starRating: 5,
      guestRating: 9.4,
      rooms: [{ pricePerNight: 22000 }],
    },
  ];

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoadingHotels(true);
        const res = await ApiClient.getFeaturedHotels();
        if (res.success && res.data && res.data.length > 0) {
          setFeaturedHotels(res.data);
        } else {
          setFeaturedHotels(fallbackCollections);
        }
      } catch (err) {
        console.warn('Loading fallback curated stays:', err.message);
        setFeaturedHotels(fallbackCollections);
      } finally {
        setLoadingHotels(false);
      }
    };

    const fetchExp = async () => {
      try {
        setLoadingExp(true);
        const res = await ApiClient.getFeaturedExperiences();
        if (res.success && res.data) {
          setFeaturedExperiences(res.data);
        }
      } catch (err) {
        console.warn('Could not load experiences for home:', err.message);
      } finally {
        setLoadingExp(false);
      }
    };

    fetchHotels();
    fetchExp();
  }, []);

  const popularRoutes = [
    {
      from: 'Mumbai (BOM)',
      to: 'Delhi (DEL)',
      mode: 'Non-stop Flight',
      icon: Plane,
      time: '2h 10m',
      fare: '₹4,850',
      link: '/flights?origin=BOM&destination=DEL',
    },
    {
      from: 'Delhi (DEL)',
      to: 'Goa (GOI)',
      mode: 'Non-stop Flight',
      icon: Plane,
      time: '2h 35m',
      fare: '₹5,450',
      link: '/flights?origin=DEL&destination=GOI',
    },
    {
      from: 'Bengaluru (BLR)',
      to: 'Mumbai (BOM)',
      mode: 'Non-stop Flight',
      icon: Plane,
      time: '1h 45m',
      fare: '₹3,200',
      link: '/flights?origin=BLR&destination=BOM',
    },
    {
      from: 'Delhi (DEL)',
      to: 'Dubai (DXB)',
      mode: 'International Flight',
      icon: Plane,
      time: '3h 50m',
      fare: '₹18,900',
      link: '/flights?origin=DEL&destination=DXB',
    },
  ];

  const displayHotels = featuredHotels.length > 0 ? featuredHotels : fallbackCollections;

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Full-Width Editorial Hero with Live Flight & Stay Search */}
      <UnifiedSearchHero />

      {/* 2. Live Curated Boutique Stays & Luxury Escapes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-coral-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Curated Handpicked Stays</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Featured Luxury Resorts & Boutique Stays
            </h2>
          </div>
          <Link
            to="/hotels"
            className="text-xs font-bold text-coral-400 hover:text-coral-300 flex items-center gap-1 transition-colors"
          >
            <span>Explore All Stays</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingHotels ? (
          <div className="py-16 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-coral-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayHotels.slice(0, 4).map((hotel) => {
              const lowestPrice = hotel.rooms?.[0]?.pricePerNight || 8500;
              const cityName = hotel.location?.city || 'India';
              const targetLink = `/hotels?city=${encodeURIComponent(cityName)}`;

              return (
                <Link
                  key={hotel._id || hotel.name}
                  to={targetLink}
                  className="group glass-card rounded-3xl overflow-hidden border border-white/5 hover:border-coral-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="relative h-60 w-full overflow-hidden">
                    <img
                      src={hotel.featuredPhoto || hotel.gallery?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"></div>
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-ink-950/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-coral-400 uppercase tracking-wider">
                      {hotel.propertyType === 'resort' ? 'Luxury Resort' : 'Boutique Stay'}
                    </span>
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink-950/80 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-white/10">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{hotel.guestRating || 9.5}</span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-1 text-[11px] text-coral-300 font-semibold mb-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{cityName}</span>
                      </div>
                      <h3 className="text-base font-bold text-white font-display leading-tight line-clamp-1">
                        {hotel.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 bg-ink-900/60 border-t border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block -mb-0.5">Starting from</span>
                      <span className="font-extrabold text-white">
                        {formatCurrency(lowestPrice, 'INR')} <span className="text-[10px] font-normal text-slate-400">/ night</span>
                      </span>
                    </div>
                    <span className="text-coral-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      View Stay <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Destination Experiences & Tours */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-coral-400 uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4" />
              <span>Verified Destination Activities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Unforgettable Tours & Local Adventures
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Scuba diving, royal lake cruises, desert safaris, and sunrise balloon flights with certified local guides.
            </p>
          </div>
          <Link
            to="/experiences"
            className="text-xs font-bold text-coral-400 hover:text-coral-300 flex items-center gap-1 group transition-colors"
          >
            Explore all tours <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loadingExp ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-coral-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredExperiences.slice(0, 4).map((exp) => (
              <Link
                key={exp._id || exp.slug}
                to={`/experiences?city=${encodeURIComponent(exp.destinationCity)}`}
                className="group glass-card rounded-3xl overflow-hidden border border-white/5 hover:border-coral-500/40 transition-all flex flex-col justify-between"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={exp.featuredPhoto}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"></div>
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-ink-950/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                    {exp.durationHours} Hours
                  </span>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink-950/80 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-white/10">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{exp.rating}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-1 text-[11px] text-coral-300 font-semibold mb-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{exp.destinationCity}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white font-display leading-tight line-clamp-1">
                      {exp.title}
                    </h3>
                  </div>
                </div>

                <div className="p-4 bg-ink-900/60 border-t border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block -mb-0.5">Per Person</span>
                    <span className="font-extrabold text-white">
                      {formatCurrency(exp.pricePerPerson, exp.currency)}
                    </span>
                  </div>
                  <span className="text-coral-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Book Tour <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* AI Smart Planner & Vacation Packages Dual Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: AI Planner */}
          <div className="relative rounded-3xl overflow-hidden p-8 border border-coral-500/30 bg-gradient-to-br from-ink-900 via-ink-850 to-ink-900 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-coral-500/20 text-coral-400 border border-coral-500/30 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Smart Planner
              </span>
              <h3 className="text-2xl font-extrabold text-white font-display">
                Create tailored multi-day itineraries in seconds.
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Powered by travel intelligence: automatic route sequencing, verified local hot spots, realistic timings, and 1-click export to your Journey Workspace.
              </p>
            </div>
            <div>
              <Link
                to="/ai-planner"
                className="px-5 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs tracking-wide shadow-glow inline-flex items-center gap-2 transition-all"
              >
                <span>Launch AI Trip Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Flight + Hotel Combos */}
          <div className="relative rounded-3xl overflow-hidden p-8 border border-teal-500/30 bg-gradient-to-br from-ink-900 via-ink-850 to-ink-900 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Curated Combos
              </span>
              <h3 className="text-2xl font-extrabold text-white font-display">
                Bundle Return Flights + Luxury Stays and save up to 20%.
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Explore handpicked combos for Goa, Udaipur, Dubai, Jaipur, and Kashmir featuring complimentary airport transfers and daily champagne breakfasts.
              </p>
            </div>
            <div>
              <Link
                to="/packages"
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs tracking-wide shadow-glow-teal inline-flex items-center gap-2 transition-all"
              >
                <span>View Vacation Packages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trending Flight Routes Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Instant Flight Discovery</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">
                Trending Airline Routes
              </h2>
            </div>
            <p className="text-xs text-slate-400">Live seat inventory & real-time pricing</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularRoutes.map((route, i) => {
              const Icon = route.icon;
              return (
                <Link
                  key={i}
                  to={route.link}
                  className="p-4 rounded-2xl bg-ink-900/60 border border-white/5 hover:border-coral-500/30 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-md bg-ink-800 text-[10px] font-bold text-slate-300 flex items-center gap-1">
                      <Icon className="w-3 h-3 text-coral-500" />
                      {route.mode}
                    </span>
                    <span className="text-[11px] text-slate-400">{route.time}</span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white group-hover:text-coral-400 transition-colors">
                      {route.from}
                    </p>
                    <div className="flex items-center gap-2 my-1">
                      <div className="w-3 h-[1px] bg-slate-600"></div>
                      <ArrowRight className="w-3 h-3 text-coral-500" />
                    </div>
                    <p className="text-sm font-bold text-white group-hover:text-coral-400 transition-colors">
                      {route.to}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[10px]">From</span>
                    <span className="font-extrabold text-coral-400 font-display">{route.fare}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Smart Journey Builder Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-coral-500/30 bg-gradient-to-r from-ink-900 via-ink-850 to-ink-900 shadow-2xl">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="px-3 py-1 rounded-full bg-coral-500/20 text-coral-400 border border-coral-500/30 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Unified Travel Workspaces
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              Orchestrate Flights + Boutique Stays into one intelligent itinerary.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Plan your travel smoothly. Build multi-city journeys, split expenses with companions, track your budget utilization, and organize booking vouchers in one secure workspace.
            </p>
            <div className="pt-2">
              <Link
                to="/journeys"
                className="px-6 py-3.5 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs tracking-wide shadow-glow inline-flex items-center gap-2 transition-all"
              >
                <span>Explore My Journeys</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
