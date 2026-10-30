import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Train, SlidersHorizontal, ArrowUpDown, AlertCircle } from 'lucide-react';
import { TrainCard } from '../../components/travel-cards/TrainCard';
import { ApiClient } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const TrainsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [trainType, setTrainType] = useState('all');
  const [travelClass, setTravelClass] = useState(searchParams.get('travelClass') || 'all');
  const [sortBy, setSortBy] = useState('departure_asc');

  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';

  const fetchTrains = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiClient.searchTrains({
        origin,
        destination,
        trainType,
        travelClass,
        sortBy,
      });

      if (res.success) {
        setTrains(res.data);
      }
    } catch (err) {
      console.error('Error fetching trains:', err);
      setError(err.message || 'Failed to search trains');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, [origin, destination, trainType, travelClass, sortBy]);

  const handleBookTrain = (train, selectedClass) => {
    navigate('/checkout', {
      state: {
        category: 'train',
        inventoryId: train._id,
        itinerary: {
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          trainType: train.trainType,
          originStation: `${train.originStationName} (${train.originStationCode})`,
          destinationStation: `${train.destinationStationName} (${train.destinationStationCode})`,
          departureTime: train.departureTime,
          arrivalTime: train.arrivalTime,
          classCode: selectedClass.classCode,
          className: selectedClass.className,
          baseFare: selectedClass.fare,
          totalAmount: selectedClass.fare,
        },
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Route Header Banner */}
      <div className="glass-panel rounded-3xl p-6 mb-8 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
            <Train className="w-4 h-4" />
            <span>Express Railways & Vande Bharat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            {origin && destination ? `${origin} → ${destination}` : 'All Express & High-Speed Routes'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Official IRCTC timetable simulated catalog</p>
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
            <option value="duration_asc">Travel Time: Fastest</option>
            <option value="arrival_asc">Arrival Time: Earliest</option>
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
                Filter Trains
              </h2>
              <button
                onClick={() => {
                  setTrainType('all');
                  setTravelClass('all');
                }}
                className="text-[11px] text-coral-400 hover:underline font-semibold"
              >
                Reset
              </button>
            </div>

            {/* Train Category */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Train Type
              </span>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Express Trains' },
                  { id: 'Vande Bharat', label: 'Vande Bharat Express' },
                  { id: 'Rajdhani', label: 'Rajdhani Express' },
                  { id: 'Shatabdi', label: 'Shatabdi Express' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrainType(t.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      trainType === t.id
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Class */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Class Code
              </span>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Classes' },
                  { id: 'EC', label: 'Executive Chair Car (EC)' },
                  { id: 'CC', label: 'AC Chair Car (CC)' },
                  { id: '1A', label: 'First AC (1A)' },
                  { id: '2A', label: 'AC 2 Tier (2A)' },
                  { id: '3A', label: 'AC 3 Tier (3A)' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setTravelClass(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      travelClass === c.id
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
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
                onClick={fetchTrains}
                className="mt-4 px-4 py-2 rounded-xl bg-ink-900 text-white text-xs font-bold"
              >
                Retry Search
              </button>
            </div>
          ) : trains.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
              <Train className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No trains found for this query</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                Search between Mumbai, Delhi, Ahmedabad, Gandhinagar or view all express trains.
              </p>
              <button
                onClick={() => {
                  setTrainType('all');
                  setTravelClass('all');
                }}
                className="px-5 py-2.5 rounded-xl bg-coral-500 text-white text-xs font-bold"
              >
                Show All Express Trains
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Showing {trains.length} scheduled express trains</span>
                <span className="text-teal-400 font-semibold flex items-center gap-1">
                  • Confirmed Berth Allocation
                </span>
              </div>

              <div className="space-y-4">
                {trains.map((train) => (
                  <TrainCard
                    key={train._id}
                    train={train}
                    onBook={handleBookTrain}
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
