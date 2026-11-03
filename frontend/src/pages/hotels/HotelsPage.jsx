import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Star,
  SlidersHorizontal,
  ArrowUpDown,
  AlertCircle,
  Search,
  MapPin,
  Calendar,
  X,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { HotelCard } from '../../components/travel-cards/HotelCard';
import { HotelRoomModal } from '../../components/booking/HotelRoomModal';
import { ApiClient } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const HotelsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected hotel for room modal
  const [activeModalHotel, setActiveModalHotel] = useState(null);

  // Search Inputs
  const city = searchParams.get('city') || '';
  const checkIn = searchParams.get('checkIn') || '2026-11-15';
  const checkOut = searchParams.get('checkOut') || '2026-11-18';

  const [searchCityInput, setSearchCityInput] = useState(city);
  const [hotelNameFilter, setHotelNameFilter] = useState('');
  const [checkInInput, setCheckInInput] = useState(checkIn);
  const [checkOutInput, setCheckOutInput] = useState(checkOut);

  // Keep search city input in sync when URL changes
  useEffect(() => {
    setSearchCityInput(city);
  }, [city]);

  // Filters
  const [starRating, setStarRating] = useState('all');
  const [propertyType, setPropertyType] = useState('all');
  const [freeCancellation, setFreeCancellation] = useState(false);
  const [breakfastIncluded, setBreakfastIncluded] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');

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

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const params = {};
    if (searchCityInput.trim()) params.city = searchCityInput.trim();
    if (checkInInput) params.checkIn = checkInInput;
    if (checkOutInput) params.checkOut = checkOutInput;
    setSearchParams(params);
  };

  const handleQuickCity = (targetCity) => {
    setSearchCityInput(targetCity);
    setSearchParams({ city: targetCity, checkIn: checkInInput, checkOut: checkOutInput });
  };

  const handleClearCity = () => {
    setSearchCityInput('');
    setHotelNameFilter('');
    setSearchParams({});
  };

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

  // Instant hotel name filter
  const displayedHotels = hotels.filter((hotel) => {
    if (!hotelNameFilter.trim()) return true;
    const q = hotelNameFilter.toLowerCase();
    return (
      hotel.name?.toLowerCase().includes(q) ||
      hotel.brand?.toLowerCase().includes(q) ||
      hotel.location?.address?.toLowerCase().includes(q) ||
      hotel.location?.neighborhood?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* 1. Interactive Hotel Search Bar */}
      <div className="glass-panel rounded-3xl p-6 mb-8 border border-white/10 shadow-2xl bg-ink-900/90 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Location / City Input */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-coral-400" />
              City or Location
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Goa, Manali, Mumbai, Dubai..."
                value={searchCityInput}
                onChange={(e) => setSearchCityInput(e.target.value)}
                className="w-full bg-ink-950 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-coral-500 transition-all pr-8"
              />
              {searchCityInput && (
                <button
                  type="button"
                  onClick={() => setSearchCityInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  title="Clear City"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Hotel Name / Keyword Filter */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-teal-400" />
              Hotel Name / Keyword
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Hyatt, Taj, Zostel, Carnival..."
                value={hotelNameFilter}
                onChange={(e) => setHotelNameFilter(e.target.value)}
                className="w-full bg-ink-950 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition-all pr-8"
              />
              {hotelNameFilter && (
                <button
                  type="button"
                  onClick={() => setHotelNameFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  title="Clear Hotel Name"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Check-In & Check-Out Dates */}
          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-coral-400" /> Check-in
              </label>
              <input
                type="date"
                value={checkInInput}
                onChange={(e) => setCheckInInput(e.target.value)}
                className="w-full bg-ink-950 border border-white/10 rounded-2xl px-3 py-3 text-xs text-white focus:outline-none focus:border-coral-500 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-coral-400" /> Check-out
              </label>
              <input
                type="date"
                value={checkOutInput}
                onChange={(e) => setCheckOutInput(e.target.value)}
                className="w-full bg-ink-950 border border-white/10 rounded-2xl px-3 py-3 text-xs text-white focus:outline-none focus:border-coral-500 font-mono"
              />
            </div>
          </div>

          {/* Search Action Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 text-white font-bold text-xs shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Hotels</span>
            </button>
          </div>
        </form>

        {/* Quick Location Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-400" />
            Quick Cities:
          </span>
          {['Goa', 'Manali', 'Mumbai', 'Jaipur', 'Bengaluru', 'Delhi', 'Dubai'].map((popCity) => (
            <button
              key={popCity}
              type="button"
              onClick={() => handleQuickCity(popCity)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                city.toLowerCase() === popCity.toLowerCase()
                  ? 'bg-coral-500/20 text-coral-400 border-coral-500/40 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              {popCity}
            </button>
          ))}
          {city && (
            <button
              type="button"
              onClick={handleClearCity}
              className="ml-auto text-xs text-coral-400 hover:underline font-semibold"
            >
              Reset to All Cities
            </button>
          )}
        </div>
      </div>

      {/* Header Info & Sort Banner */}
      <div className="glass-panel rounded-3xl p-5 mb-8 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-coral-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Verified Travel Stays</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-display">
            {city ? `Stays in ${city}` : 'All Verified Stays & Resorts'}
            {hotelNameFilter && (
              <span className="text-teal-400 font-normal text-base ml-2">
                matching "{hotelNameFilter}"
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
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
            className="bg-ink-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-coral-500 font-medium"
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
                  setHotelNameFilter('');
                }}
                className="text-[11px] text-coral-400 hover:underline font-semibold"
              >
                Reset All
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
                  { id: '3', label: '3 Star Comfort' },
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
                  className="rounded bg-ink-900 border-white/20 text-coral-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-slate-200">Breakfast Included</span>
                <input
                  type="checkbox"
                  checked={breakfastIncluded}
                  onChange={(e) => setBreakfastIncluded(e.target.checked)}
                  className="rounded bg-ink-900 border-white/20 text-coral-500 focus:ring-0 w-4 h-4 cursor-pointer"
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
          ) : displayedHotels.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center border border-white/10">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                {hotelNameFilter
                  ? `No hotels matching "${hotelNameFilter}"`
                  : 'No hotels matching your criteria'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
                {hotelNameFilter
                  ? 'Try searching with a broader keyword or clear the hotel name filter.'
                  : 'Try searching for another destination city or removing filter criteria.'}
              </p>
              <div className="flex items-center justify-center gap-3">
                {hotelNameFilter && (
                  <button
                    onClick={() => setHotelNameFilter('')}
                    className="px-4 py-2 rounded-xl bg-ink-900 border border-white/10 text-white text-xs font-bold"
                  >
                    Clear Name Filter
                  </button>
                )}
                <button
                  onClick={handleClearCity}
                  className="px-5 py-2.5 rounded-xl bg-coral-500 text-white text-xs font-bold shadow-glow"
                >
                  Show All Available Stays
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-2">
                <span>
                  Showing {displayedHotels.length} verified stays & resorts
                  {hotelNameFilter && ` (filtered from ${hotels.length})`}
                </span>
                <span className="text-teal-400 font-semibold flex items-center gap-1">
                  • Instant Confirmation Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedHotels.map((hotel) => (
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

