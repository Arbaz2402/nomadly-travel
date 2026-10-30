import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Building2, Star, SlidersHorizontal, ArrowUpDown, AlertCircle } from 'lucide-react';
import { HotelCard } from '../../components/travel-cards/HotelCard';
import { HotelRoomModal } from '../../components/booking/HotelRoomModal';
import { ApiClient } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const HotelsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected hotel for room modal
  const [activeModalHotel, setActiveModalHotel] = useState(null);

  // Filters
  const [starRating, setStarRating] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const [freeCancellation, setFreeCancellation] = useState(false);
  const [breakfastIncluded, setBreakfastIncluded] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');

  const city = searchParams.get('city') || '';
  const checkIn = searchParams.get('checkIn') || '2026-11-15';
  const checkOut = searchParams.get('checkOut') || '2026-11-18';

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiClient.searchHotels({
        city,
        starRating,
        propertyType,
        freeCancellation: freeCancellation ? 'true' : 'false',
        breakfastIncluded: breakfastIncluded ? 'true' : 'false',
        sortBy,
      });

      if (res.success) {
        setHotels(res.data);
      }
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError(err.message || 'Failed to search hotels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [city, starRating, propertyType, freeCancellation, breakfastIncluded, sortBy]);

  const handleOpenRoomModal = (hotel) => {
    setActiveModalHotel(hotel);
  };

  const handleSelectRoom = (hotel, room) => {
    setActiveModalHotel(null);
    navigate('/checkout', {
      state: {
        category: 'hotel',
        inventoryId: hotel._id,
        itinerary: {
          hotelName: hotel.name,
          city: hotel.location?.city,
          address: hotel.location?.address,
          roomName: room.name,
          checkIn,
          checkOut,
          mealPlan: room.mealPlan,
          baseFare: room.pricePerNight,
          taxesPerNight: room.taxesPerNight,
          totalAmount: room.pricePerNight + (room.taxesPerNight || 0),
        },
      },
    });
  };

  const handleToggleSave = async (hotel) => {
    try {
      await ApiClient.addToWishlist({
        category: 'hotel',
        itemId: hotel._id,
        title: hotel.name,
        subtitle: `${hotel.location?.city} • ${hotel.starRating} Star`,
        image: hotel.featuredPhoto,
        basePrice: hotel.rooms?.[0]?.pricePerNight || 5000,
      });
      showToast('Hotel saved to your wishlist!', 'success');
    } catch (err) {
      showToast('Saved to local favorites', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Route Header Banner */}
      <div className="glass-panel rounded-3xl p-6 mb-8 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-coral-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Hotels & Luxury Stays</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            {city ? `Stays in ${city}` : 'All Verified Stays & Resorts'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dates: <span className="text-slate-200 font-medium">{checkIn} to {checkOut}</span>
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
            className="bg-ink-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500"
          >
            <option value="recommended">Featured & Recommended</option>
            <option value="rating_desc">Highest Guest Rating</option>
            <option value="price_asc">Price: Lowest First</option>
            <option value="price_desc">Price: Highest First</option>
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
                Filter Stays
              </h2>
              <button
                onClick={() => {
                  setStarRating('all');
                  setPropertyType('all');
                  setFreeCancellation(false);
                  setBreakfastIncluded(false);
                }}
                className="text-[11px] text-coral-400 hover:underline font-semibold"
              >
                Reset
              </button>
            </div>

            {/* Star Rating */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Star Rating
              </span>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Ratings' },
                  { id: '5', label: '5 Star Luxury' },
                  { id: '4', label: '4 Star Premium' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStarRating(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      starRating === s.id
                        ? 'bg-coral-500/10 text-coral-400 border border-coral-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                Property Type
              </span>
              <div className="space-y-1.5">
                {[
                  { id: 'all', label: 'All Types' },
                  { id: 'hotel', label: 'Hotels' },
                  { id: 'resort', label: 'Resorts' },
                  { id: 'heritage', label: 'Heritage Palaces' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPropertyType(p.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      propertyType === p.id
                        ? 'bg-coral-500/10 text-coral-400 border border-coral-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-200">Free Cancellation</span>
                <input
                  type="checkbox"
                  checked={freeCancellation}
                  onChange={(e) => setFreeCancellation(e.target.checked)}
                  className="rounded bg-ink-900 border-white/20 text-coral-500 focus:ring-0 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-200">Breakfast Included</span>
                <input
                  type="checkbox"
                  checked={breakfastIncluded}
                  onChange={(e) => setBreakfastIncluded(e.target.checked)}
                  className="rounded bg-ink-900 border-white/20 text-coral-500 focus:ring-0 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </aside>

        {/* Right Search Results */}
        <main className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card rounded-2xl h-80 animate-pulse bg-ink-900/40"></div>
              ))}
            </div>
          ) : error ? (
            <div className="glass-panel rounded-3xl p-8 text-center text-rose-400 border border-rose-500/20">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="font-bold text-sm">{error}</p>
              <button
                onClick={fetchHotels}
                className="mt-4 px-4 py-2 rounded-xl bg-ink-900 text-white text-xs font-bold"
              >
                Retry Search
              </button>
            </div>
          ) : hotels.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No hotels matching your criteria</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                Try removing filter criteria or searching without destination restriction.
              </p>
              <button
                onClick={() => {
                  setStarRating('all');
                  setPropertyType('all');
                }}
                className="px-5 py-2.5 rounded-xl bg-coral-500 text-white text-xs font-bold"
              >
                Show All Available Stays
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-2">
                <span>Showing {hotels.length} verified boutique hotels & resorts</span>
                <span className="text-teal-400 font-semibold flex items-center gap-1">
                  • Instant Confirmation Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hotels.map((hotel) => (
                  <HotelCard
                    key={hotel._id}
                    hotel={hotel}
                    onSelectRoom={handleOpenRoomModal}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Room Selection Modal */}
      <HotelRoomModal
        hotel={activeModalHotel}
        isOpen={Boolean(activeModalHotel)}
        onClose={() => setActiveModalHotel(null)}
        onSelectRoom={handleSelectRoom}
      />
    </div>
  );
};
