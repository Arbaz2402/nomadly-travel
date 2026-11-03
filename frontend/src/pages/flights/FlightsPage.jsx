import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Plane,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  Search,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { FlightCard } from '../../components/travel-cards/FlightCard';
import { ApiClient } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const FlightsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search parameters
  const origin = searchParams.get('origin') || 'BOM';
  const destination = searchParams.get('destination') || 'DEL';
  const departureDate = searchParams.get('departureDate') || '2026-11-15';

  const [originInput, setOriginInput] = useState(origin);
  const [destInput, setDestInput] = useState(destination);
  const [dateInput, setDateInput] = useState(departureDate);

  useEffect(() => {
    setOriginInput(origin);
    setDestInput(destination);
    setDateInput(departureDate);
  }, [origin, destination, departureDate]);

  // Filters
  const [directOnly, setDirectOnly] = useState(false);
  const [selectedCabin, setSelectedCabin] = useState(searchParams.get('cabinClass') || 'all');
  const [maxPrice, setMaxPrice] = useState(30000);
  const [sortBy, setSortBy] = useState('price_asc');

  const fetchFlights = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiClient.searchFlights({
        origin,
        destination,
        cabinClass: selectedCabin,
        directOnly: directOnly ? 'true' : 'false',
        maxPrice,
        sortBy,
      });

      if (res.success) {
        setFlights(res.data);
      }
    } catch (err) {
      console.error('Error fetching flights:', err);
      setError(err.message || 'Failed to search flights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [origin, destination, selectedCabin, directOnly, maxPrice, sortBy]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchParams({
      origin: originInput.trim().toUpperCase() || 'BOM',
      destination: destInput.trim().toUpperCase() || 'DEL',
      departureDate: dateInput,
      cabinClass: selectedCabin,
    });
  };

  const handleQuickRoute = (from, to) => {
    setOriginInput(from);
    setDestInput(to);
    setSearchParams({
      origin: from,
      destination: to,
      departureDate: dateInput,
      cabinClass: selectedCabin,
    });
  };

  const handleBookFlight = (flight) => {
    navigate('/checkout', {
      state: {
        category: 'flight',
        inventoryId: flight._id,
        itinerary: {
          flightNumber: flight.legs[0]?.flightNumber,
          airline: flight.legs[0]?.airline,
          originCode: flight.originCode,
          originCity: flight.originCity,
          destinationCode: flight.destinationCode,
          destinationCity: flight.destinationCity,
          departureDate: flight.departureDate,
          departureTime: flight.legs[0]?.departureTime,
          arrivalTime: flight.legs[0]?.arrivalTime,
          cabinClass: flight.cabinClass,
          baseFare: flight.pricing.baseFare,
          totalAmount: flight.pricing.totalAmount,
        },
      },
    });
  };

  const handleToggleSave = async (flight) => {
    try {
      await ApiClient.addToWishlist({
        category: 'flight',
        itemId: flight._id,
        title: `${flight.legs[0]?.airline} (${flight.originCode} → ${flight.destinationCode})`,
        subtitle: `${flight.departureDate} • ${flight.cabinClass}`,
        basePrice: flight.pricing.totalAmount,
      });
      showToast('Flight saved to your watchlist!', 'success');
    } catch (err) {
      showToast('Saved to local favorites', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* 1. Interactive Flight Search Bar */}
      <div className="glass-panel rounded-3xl p-6 mb-8 border border-white/10 shadow-2xl bg-ink-900/90 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-coral-400 rotate-45" />
              From (City / IATA)
            </label>
            <input
              type="text"
              placeholder="e.g. BOM, Mumbai, Delhi"
              value={originInput}
              onChange={(e) => setOriginInput(e.target.value)}
              className="w-full bg-ink-950 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-coral-500 font-bold"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-teal-400 rotate-90" />
              To (City / IATA)
            </label>
            <input
              type="text"
              placeholder="e.g. DEL, Goa, Dubai"
              value={destInput}
              onChange={(e) => setDestInput(e.target.value)}
              className="w-full bg-ink-950 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white uppercase placeholder-slate-500 focus:outline-none focus:border-teal-400 font-bold"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-coral-400" />
              Departure Date
            </label>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full bg-ink-950 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-coral-500 font-mono"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 text-white font-bold text-xs shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Flights</span>
            </button>
          </div>
        </form>

        {/* Popular Route Quick Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-400" />
            Popular Routes:
          </span>
          {[
            { from: 'BOM', to: 'DEL', label: 'Mumbai → Delhi' },
            { from: 'BLR', to: 'DEL', label: 'Bengaluru → Delhi' },
            { from: 'BOM', to: 'GOI', label: 'Mumbai → Goa' },
            { from: 'BLR', to: 'GOI', label: 'Bengaluru → Goa' },
            { from: 'DEL', to: 'DXB', label: 'Delhi → Dubai' },
          ].map((r) => (
            <button
              key={`${r.from}-${r.to}`}
              type="button"
              onClick={() => handleQuickRoute(r.from, r.to)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                origin === r.from && destination === r.to
                  ? 'bg-coral-500/20 text-coral-400 border-coral-500/40 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Route Header Banner */}
      <div className="glass-panel rounded-3xl p-5 mb-8 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-coral-400 uppercase tracking-wider mb-1">
            <Plane className="w-4 h-4" />
            <span>Flight Search Results</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">
            {origin} <span className="text-coral-500 font-sans">→</span> {destination}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Departure: <span className="text-slate-200 font-medium">{departureDate}</span> • One Way
          </p>
        </div>

        {/* Quick Sort Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort By:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-ink-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500 font-medium"
          >
            <option value="price_asc">Price: Lowest First</option>
            <option value="price_desc">Price: Highest First</option>
            <option value="duration_asc">Duration: Fastest First</option>
            <option value="departure_asc">Departure Time: Earliest</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Filters Sidebar */}
        <aside className="lg:col-span-3">
          <div className="glass-panel rounded-3xl p-6 border border-white/10 sticky top-28 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-coral-500" />
                Filter Flights
              </h2>
              <button
                onClick={() => {
                  setDirectOnly(false);
                  setSelectedCabin('all');
                  setMaxPrice(30000);
                }}
                className="text-[11px] text-coral-400 hover:underline font-semibold"
              >
                Reset
              </button>
            </div>

            {/* Direct Flights Only Toggle */}
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-200">Non-Stop Flights Only</span>
                <input
                  type="checkbox"
                  checked={directOnly}
                  onChange={(e) => setDirectOnly(e.target.checked)}
                  className="rounded bg-ink-900 border-white/20 text-coral-500 focus:ring-0 w-4 h-4"
                />
              </label>
            </div>

            {/* Cabin Class */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Cabin Class
              </span>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Cabins' },
                  { id: 'economy', label: 'Economy' },
                  { id: 'business', label: 'Business' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCabin(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      selectedCabin === c.id
                        ? 'bg-coral-500/10 text-coral-400 border border-coral-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-200">Max Price</span>
                <span className="font-extrabold text-coral-400">₹{maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="30000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-coral-500 bg-ink-800"
              />
            </div>
          </div>
        </aside>

        {/* Right Search Results */}
        <main className="lg:col-span-9 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-2xl p-6 h-48 animate-pulse bg-ink-900/40"></div>
              ))}
            </div>
          ) : error ? (
            <div className="glass-panel rounded-3xl p-8 text-center text-rose-400 border border-rose-500/20">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="font-bold text-sm">{error}</p>
              <button
                onClick={fetchFlights}
                className="mt-4 px-4 py-2 rounded-xl bg-ink-900 text-white text-xs font-bold"
              >
                Retry Search
              </button>
            </div>
          ) : flights.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
              <Plane className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No flights matching your criteria</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                Try widening your price range or clearing non-stop filters to discover available departures.
              </p>
              <button
                onClick={() => {
                  setDirectOnly(false);
                  setMaxPrice(30000);
                  setSelectedCabin('all');
                }}
                className="px-5 py-2.5 rounded-xl bg-coral-500 text-white text-xs font-bold"
              >
                Show All Available Flights
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Showing {flights.length} verified flight offers</span>
                <span className="text-teal-400 font-semibold flex items-center gap-1">
                  • Live Fare Revalidated
                </span>
              </div>

              <div className="space-y-4">
                {flights.map((flight) => (
                  <FlightCard
                    key={flight._id}
                    flight={flight}
                    onBook={handleBookFlight}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
