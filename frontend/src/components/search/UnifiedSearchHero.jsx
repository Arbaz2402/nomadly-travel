import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane,
  Building2,
  Search,
  Calendar,
  Users,
  MapPin,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react';

export const UnifiedSearchHero = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('flights');

  // Flight states
  const [flightOrigin, setFlightOrigin] = useState('Mumbai (BOM)');
  const [flightDest, setFlightDest] = useState('Delhi (DEL)');
  const [flightDate, setFlightDate] = useState('2026-11-15');
  const [flightCabin, setFlightCabin] = useState('economy');

  // Hotel states
  const [hotelCity, setHotelCity] = useState('Mumbai');
  const [checkIn, setCheckIn] = useState('2026-11-15');
  const [checkOut, setCheckOut] = useState('2026-11-18');
  const [hotelGuests, setHotelGuests] = useState('2');

  const handleFlightSearch = (e) => {
    e.preventDefault();
    const originCode = flightOrigin.includes('(') ? flightOrigin.split('(')[1].replace(')', '') : flightOrigin;
    const destCode = flightDest.includes('(') ? flightDest.split('(')[1].replace(')', '') : flightDest;
    navigate(`/flights?origin=${originCode}&destination=${destCode}&departureDate=${flightDate}&cabinClass=${flightCabin}`);
  };

  const handleHotelSearch = (e) => {
    e.preventDefault();
    navigate(`/hotels?city=${hotelCity}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${hotelGuests}`);
  };

  const swapFlightAirports = () => {
    const temp = flightOrigin;
    setFlightOrigin(flightDest);
    setFlightDest(temp);
  };

  return (
    <section className="relative pt-12 pb-24 md:pt-20 md:pb-36 overflow-hidden">
      {/* Editorial Background Image with Midnight Gradient Overlay */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=85"
          alt="Cinematic Alpine & Coastal Horizon"
          className="w-full h-full object-cover object-center opacity-30 scale-105 transform filter saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-950/80 to-ink-950"></div>
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-coral-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Tagline & Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral-500/10 border border-coral-500/20 text-coral-400 text-xs font-semibold uppercase tracking-wider mb-5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Live Global Flights & Verified Boutique Stays
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1] mb-5 font-display">
            Your entire journey, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-400 via-coral-500 to-amber-300">
              intelligently organized.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Search real-time airline flights and verified boutique stays from one unified interface.
          </p>
        </div>

        {/* Floating Glass Search Panel */}
        <div className="glass-panel rounded-3xl p-3 sm:p-5 shadow-2xl max-w-5xl mx-auto border border-white/10 relative z-20">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('flights')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 ${
                activeTab === 'flights'
                  ? 'bg-coral-500 text-white shadow-glow'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Plane className="w-4 h-4 stroke-[2.2]" />
              Flights
            </button>

            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 ${
                activeTab === 'hotels'
                  ? 'bg-coral-500 text-white shadow-glow'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4 stroke-[2.2]" />
              Hotels & Stays
            </button>
          </div>

          {/* Tab 1: Flights Form */}
          {activeTab === 'flights' && (
            <form onSubmit={handleFlightSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-3 bg-ink-900/80 border border-white/5 rounded-2xl p-3 focus-within:border-coral-500 transition-colors">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  From (Airport)
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-coral-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={flightOrigin}
                    onChange={(e) => setFlightOrigin(e.target.value)}
                    placeholder="e.g. Mumbai (BOM)"
                    className="bg-transparent text-sm text-white font-medium focus:outline-none w-full"
                  />
                </div>
              </div>

              <div className="md:col-span-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={swapFlightAirports}
                  className="w-10 h-10 rounded-full bg-ink-800 border border-white/10 hover:border-coral-500 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-md"
                  title="Swap Origin & Destination"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="md:col-span-3 bg-ink-900/80 border border-white/5 rounded-2xl p-3 focus-within:border-coral-500 transition-colors">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  To (Airport)
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={flightDest}
                    onChange={(e) => setFlightDest(e.target.value)}
                    placeholder="e.g. Delhi (DEL)"
                    className="bg-transparent text-sm text-white font-medium focus:outline-none w-full"
                  />
                </div>
              </div>

              <div className="md:col-span-3 bg-ink-900/80 border border-white/5 rounded-2xl p-3 focus-within:border-coral-500 transition-colors">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Departure Date
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type="date"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                    className="bg-transparent text-sm text-white font-medium focus:outline-none w-full [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full py-4 px-6 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-sm tracking-wide shadow-glow transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Search Flights</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Hotels Form */}
          {activeTab === 'hotels' && (
            <form onSubmit={handleHotelSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-4 bg-ink-900/80 border border-white/5 rounded-2xl p-3 focus-within:border-coral-500 transition-colors">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Destination City
                </label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-coral-500 flex-shrink-0" />
                  <input
                    type="text"
                    value={hotelCity}
                    onChange={(e) => setHotelCity(e.target.value)}
                    placeholder="e.g. Mumbai, Goa, Udaipur"
                    className="bg-transparent text-sm text-white font-medium focus:outline-none w-full"
                  />
                </div>
              </div>

              <div className="md:col-span-3 bg-ink-900/80 border border-white/5 rounded-2xl p-3 focus-within:border-coral-500 transition-colors">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Check-In
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="bg-transparent text-sm text-white font-medium focus:outline-none w-full [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="md:col-span-3 bg-ink-900/80 border border-white/5 rounded-2xl p-3 focus-within:border-coral-500 transition-colors">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Check-Out
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="bg-transparent text-sm text-white font-medium focus:outline-none w-full [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full py-4 px-6 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-sm tracking-wide shadow-glow transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Find Stays</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
