import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Bus, SlidersHorizontal, ArrowUpDown, AlertCircle, Search } from 'lucide-react';
import { BusCard } from '../../components/travel-cards/BusCard';
import { ApiClient } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const BusesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [busType, setBusType] = useState('all');
  const [operator, setOperator] = useState('all');
  const [sortBy, setSortBy] = useState('departure_asc');

  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';

  const [originInput, setOriginInput] = useState(origin || 'Mumbai');
  const [destInput, setDestInput] = useState(destination || 'Goa');

  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiClient.searchBuses({
        origin,
        destination,
        busType,
        operator,
        sortBy,
      });

      if (res.success) {
        setBuses(res.data);
      }
    } catch (err) {
      console.error('Error fetching buses:', err);
      setError(err.message || 'Failed to search buses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [origin, destination, busType, operator, sortBy]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchParams({
      origin: originInput.trim(),
      destination: destInput.trim(),
    });
  };

  const handleQuickRoute = (from, to) => {
    setOriginInput(from);
    setDestInput(to);
    setSearchParams({
      origin: from,
      destination: to,
    });
  };

  const handleCheckoutWithSeats = async (bus, selectedSeats) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const seatNumbers = selectedSeats.map((s) => s.seatNumber);

    try {
      // 1. Acquire temporary 10-minute atomic hold on server
      await ApiClient.holdBusSeats(bus._id, {
        seatNumbers,
        sessionId,
      });

      showToast(`${seatNumbers.join(', ')} held for 10 minutes. Proceeding to checkout.`, 'success');

      // 2. Navigate to checkout
      const totalBaseFare = selectedSeats.reduce((sum, s) => sum + s.price, 0);

      navigate('/checkout', {
        state: {
          category: 'bus',
          inventoryId: bus._id,
          sessionId,
          seatNumbers,
          itinerary: {
            operatorName: bus.operatorName,
            busNumber: bus.busNumber,
            busType: bus.busType,
            originCity: bus.originCity,
            destinationCity: bus.destinationCity,
            departureTime: bus.departureTime,
            arrivalTime: bus.arrivalTime,
            boardingPoint: bus.boardingPoints?.[0]?.locationName || 'Main Stop',
            droppingPoint: bus.droppingPoints?.[0]?.locationName || 'Drop Terminal',
            selectedSeats: seatNumbers,
            baseFare: totalBaseFare,
            totalAmount: totalBaseFare,
          },
        },
      });
    } catch (err) {
      showToast(err.message || 'Failed to reserve selected seats. Someone else may have just held them.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* 1. Interactive Bus Search Bar */}
      <div className="glass-panel rounded-3xl p-6 mb-8 border border-white/10 shadow-2xl bg-ink-900/90 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Origin */}
          <div className="md:col-span-4">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              From City
            </label>
            <div className="relative">
              <Bus className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Bengaluru"
                className="w-full bg-ink-950 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-coral-500"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                const temp = originInput;
                setOriginInput(destInput);
                setDestInput(temp);
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
              title="Swap origin and destination"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-4">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              To City
            </label>
            <div className="relative">
              <Bus className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={destInput}
                onChange={(e) => setDestInput(e.target.value)}
                placeholder="e.g. Goa, Manali, Hyderabad"
                className="w-full bg-ink-950 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-coral-500"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-3">
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-coral-500 to-rose-600 text-white font-bold text-xs shadow-lg hover:from-coral-600 hover:to-rose-700 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search Buses
            </button>
          </div>
        </form>

        {/* Quick Route Pills */}
        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Popular Intercity Routes:</span>
          {[
            { from: 'Mumbai', to: 'Goa', label: 'Mumbai → Goa' },
            { from: 'Delhi', to: 'Manali', label: 'Delhi → Manali' },
            { from: 'Bangalore', to: 'Hyderabad', label: 'Bengaluru → Hyderabad' },
            { from: 'Pune', to: 'Goa', label: 'Pune → Goa' },
            { from: 'Delhi', to: 'Jaipur', label: 'Delhi → Jaipur' },
          ].map((rt) => (
            <button
              key={rt.label}
              type="button"
              onClick={() => handleQuickRoute(rt.from, rt.to)}
              className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 hover:bg-coral-500/20 text-slate-300 hover:text-coral-300 border border-white/10 transition-all font-medium"
            >
              {rt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Route Header Banner */}
      <div className="glass-panel rounded-3xl p-6 mb-8 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-coral-400 uppercase tracking-wider mb-1">
            <Bus className="w-4 h-4" />
            <span>Intercity Sleeper & AC Buses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            {origin && destination ? `${origin} → ${destination}` : 'All Luxury Intercity Coaches'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Live seat maps with instant atomic hold protection</p>
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
            className="bg-ink-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500"
          >
            <option value="departure_asc">Departure Time: Earliest</option>
            <option value="price_asc">Price: Lowest First</option>
            <option value="rating_desc">Highest Rated Operator</option>
            <option value="duration_asc">Travel Time: Fastest</option>
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
                Filter Buses
              </h2>
              <button
                onClick={() => {
                  setBusType('all');
                  setOperator('all');
                }}
                className="text-[11px] text-coral-400 hover:underline font-semibold"
              >
                Reset
              </button>
            </div>

            {/* Bus Type */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Coach Type
              </span>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Bus Types' },
                  { id: 'Sleeper', label: 'AC Sleeper' },
                  { id: 'Seater', label: 'AC Seater Pushback' },
                  { id: 'Volvo', label: 'Volvo Multi-Axle' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBusType(b.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      busType === b.id
                        ? 'bg-coral-500/10 text-coral-400 border border-coral-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Operator */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Operator Brand
              </span>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Operators' },
                  { id: 'Zingbus', label: 'Zingbus Electric' },
                  { id: 'IntrCity', label: 'IntrCity SmartBus' },
                ].map((op) => (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setOperator(op.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      operator === op.id
                        ? 'bg-coral-500/10 text-coral-400 border border-coral-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Search Results */}
        <main className="lg:col-span-9 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="glass-card rounded-2xl p-6 h-60 animate-pulse bg-ink-900/40"></div>
              ))}
            </div>
          ) : error ? (
            <div className="glass-panel rounded-3xl p-8 text-center text-rose-400 border border-rose-500/20">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="font-bold text-sm">{error}</p>
              <button
                onClick={fetchBuses}
                className="mt-4 px-4 py-2 rounded-xl bg-ink-900 text-white text-xs font-bold"
              >
                Retry Search
              </button>
            </div>
          ) : buses.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
              <Bus className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No buses matching query</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                Try searching between Mumbai and Goa, or Delhi and Jaipur.
              </p>
              <button
                onClick={() => {
                  setBusType('all');
                  setOperator('all');
                }}
                className="px-5 py-2.5 rounded-xl bg-coral-500 text-white text-xs font-bold"
              >
                Show All Available Buses
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Showing {buses.length} intercity luxury coach services</span>
                <span className="text-teal-400 font-semibold flex items-center gap-1">
                  • Click 'Select Seats' to open interactive deck map
                </span>
              </div>

              <div className="space-y-6">
                {buses.map((bus) => (
                  <BusCard
                    key={bus._id}
                    bus={bus}
                    onCheckoutWithSeats={handleCheckoutWithSeats}
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
