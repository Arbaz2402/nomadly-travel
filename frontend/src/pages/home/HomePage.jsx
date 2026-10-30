import React from 'react';
import { Link } from 'react-router-dom';
import {
  Plane,
  Building2,
  Train,
  Bus,
  Compass,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Star,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { UnifiedSearchHero } from '../../components/search/UnifiedSearchHero';
import { formatCurrency } from '../../utils/formatters';

export const HomePage = () => {
  const curatedCollections = [
    {
      title: 'Udaipur Royal Heritage',
      tagline: 'Lakeside Palaces & Romance',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      price: 'From ₹18,500',
      link: '/hotels?city=Udaipur',
      badge: 'Heritage',
    },
    {
      title: 'Coastal Goa Escapes',
      tagline: 'Serene Infinity Pools & Sands',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
      price: 'From ₹8,999',
      link: '/hotels?city=Goa',
      badge: 'Trending',
    },
    {
      title: 'Vande Bharat High Speed',
      tagline: 'Western Corridor Rail Express',
      image: 'https://images.unsplash.com/photo-1532105956626-9569c03602f6?w=800&q=80',
      price: 'From ₹1,420',
      link: '/trains?origin=Mumbai&destination=Ahmedabad',
      badge: 'Rail Express',
    },
    {
      title: 'Dubai Skyline & Sands',
      tagline: 'Ultra-Luxury Emirates Getaways',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
      price: 'From ₹21,900',
      link: '/flights?origin=DEL&destination=DXB',
      badge: 'International',
    },
  ];

  const popularRoutes = [
    { from: 'Mumbai (BOM)', to: 'Delhi (DEL)', mode: 'Flight', icon: Plane, time: '2h 10m', fare: '₹4,850', link: '/flights?origin=BOM&destination=DEL' },
    { from: 'Mumbai', to: 'Goa', mode: 'AC Sleeper Bus', icon: Bus, time: '10h 30m', fare: '₹1,450', link: '/buses?origin=Mumbai&destination=Goa' },
    { from: 'Mumbai Central', to: 'Gandhinagar', mode: 'Vande Bharat', icon: Train, time: '5h 25m', fare: '₹1,420', link: '/trains?origin=Mumbai&destination=Ahmedabad' },
    { from: 'Delhi', to: 'Jaipur', mode: 'SmartBus', icon: Bus, time: '5h 00m', fare: '₹750', link: '/buses?origin=Delhi&destination=Jaipur' },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Full-Width Editorial Hero with Floating 4-Tab Search */}
      <UnifiedSearchHero />

      {/* 2. Curated Seasonal Travel Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-coral-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Curated Handpicked Journeys</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Seasonal Travel Collections
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {curatedCollections.map((col, idx) => (
            <Link
              key={idx}
              to={col.link}
              className="group glass-card rounded-3xl overflow-hidden border border-white/5 hover:border-coral-500/40 transition-all flex flex-col justify-between"
            >
              <div className="relative h-60 w-full overflow-hidden">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"></div>
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-ink-950/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-coral-400 uppercase tracking-wider">
                  {col.badge}
                </span>
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[11px] text-coral-300 font-semibold block">{col.tagline}</span>
                  <h3 className="text-lg font-bold text-white font-display leading-tight">{col.title}</h3>
                </div>
              </div>

              <div className="p-4 bg-ink-900/60 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="font-extrabold text-white">{col.price}</span>
                <span className="text-coral-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Book <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Trending Routes Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Instant Travel Discovery</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">
                Trending Passenger Routes
              </h2>
            </div>
            <p className="text-xs text-slate-400">One-click live availability checking</p>
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

      {/* 4. Smart Multi-Modal Bundles Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 border border-coral-500/30 bg-gradient-to-r from-ink-900 via-ink-850 to-ink-900 shadow-2xl">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="px-3 py-1 rounded-full bg-coral-500/20 text-coral-400 border border-coral-500/30 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Unified Trip Builder
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
              Orchestrate Train + Flight + Luxury Stay into one single itinerary.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Experience the future of multi-modal travel. Build multi-leg journeys, monitor connection gap warnings, track your dynamic budget, and checkout seamlessly.
            </p>
            <div className="pt-2">
              <Link
                to="/trip-builder"
                className="px-6 py-3.5 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs tracking-wide shadow-glow inline-flex items-center gap-2 transition-all"
              >
                <span>Launch Interactive Trip Builder</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
