import React, { useState, useEffect } from 'react';
import { Bookmark, Bell, Trash2, ArrowRight, TrendingDown, Plus, ShieldCheck } from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

export const WishlistPage = () => {
  const { showToast } = useToast();

  const [wishlist, setWishlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New alert form
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertForm, setAlertForm] = useState({
    category: 'flight',
    origin: 'BOM',
    destination: 'DEL',
    travelDate: '2026-11-15',
    targetPrice: 4500,
    currentPrice: 5973,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wishRes, alertRes] = await Promise.all([
        ApiClient.getWishlist(),
        ApiClient.getPriceAlerts(),
      ]);

      if (wishRes.success) setWishlist(wishRes.data);
      if (alertRes.success) setAlerts(alertRes.data);
    } catch (err) {
      console.error('Error fetching wishlist/alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemoveWishlist = async (id) => {
    try {
      await ApiClient.removeFromWishlist(id);
      showToast('Removed from saved items', 'info');
      setWishlist(wishlist.filter((w) => w._id !== id));
    } catch (err) {
      showToast(err.message || 'Failed to remove', 'error');
    }
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const res = await ApiClient.createPriceAlert(alertForm);
      if (res.success) {
        showToast('Fare price watch monitor active!', 'success');
        setShowAlertModal(false);
        setAlerts([res.data, ...alerts]);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create price alert', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 mb-8 border border-white/10 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-coral-400 uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Saved Stays & Smart Price Watch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Watchlist & Fare Monitors
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track price drops across routes and manage your saved hotels and destinations.
          </p>
        </div>

        <button
          onClick={() => setShowAlertModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs tracking-wide shadow-glow transition-all flex items-center gap-1.5"
        >
          <Bell className="w-4 h-4" />
          <span>Create Fare Watch</span>
        </button>
      </div>

      {/* Active Price Alerts Section */}
      <div className="mb-10">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-teal-400" />
          Active Price Drop Monitors ({alerts.length})
        </h2>

        {alerts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-ink-900/40 border border-white/5 text-center text-xs text-slate-400">
            No active price alerts set. Track a route to receive automated alerts when fares drop below your target price!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <div key={alert._id} className="glass-card rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                    {alert.category.toUpperCase()} ALERT
                  </span>
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                </div>

                <h3 className="font-bold text-white text-base">
                  {alert.origin} → {alert.destination}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Date: {alert.travelDate || 'Flexible'}</p>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Target Price</span>
                    <span className="font-extrabold text-coral-400">{formatCurrency(alert.targetPrice)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Current Lowest</span>
                    <span className="font-medium text-slate-300">{formatCurrency(alert.currentPrice || 5973)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Hotels & Favorites Section */}
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mb-4">
          <Bookmark className="w-5 h-5 text-coral-500" />
          Saved Stays & Favorites ({wishlist.length})
        </h2>

        {wishlist.length === 0 ? (
          <div className="p-8 rounded-2xl bg-ink-900/40 border border-white/5 text-center text-xs text-slate-400">
            No saved stays yet. Click the heart icon on any hotel or flight card to save it for later review.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item._id} className="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between">
                <div>
                  {item.image && (
                    <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-5">
                    <span className="text-[10px] uppercase font-bold text-coral-400 block mb-1">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-white text-base font-display">{item.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{item.subtitle}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-white/5 mt-auto">
                  <div className="pt-3 flex items-center justify-between">
                    <span className="font-extrabold text-white text-lg">
                      {formatCurrency(item.basePrice)}
                    </span>
                    <button
                      onClick={() => handleRemoveWishlist(item._id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Creator Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md">
          <form onSubmit={handleCreateAlert} className="glass-panel max-w-md w-full rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Create Price Watch Alert</h3>
            <p className="text-xs text-slate-400">
              We monitor fares across partner GDS systems and notify you the moment rates fall below your budget.
            </p>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Category</label>
              <select
                value={alertForm.category}
                onChange={(e) => setAlertForm({ ...alertForm, category: e.target.value })}
                className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="flight">Flight Route</option>
                <option value="hotel">Hotel Stay</option>
                <option value="train">Train</option>
                <option value="bus">Bus</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Origin</label>
                <input
                  type="text"
                  value={alertForm.origin}
                  onChange={(e) => setAlertForm({ ...alertForm, origin: e.target.value })}
                  className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Destination</label>
                <input
                  type="text"
                  value={alertForm.destination}
                  onChange={(e) => setAlertForm({ ...alertForm, destination: e.target.value })}
                  className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Price (₹)</label>
              <input
                type="number"
                value={alertForm.targetPrice}
                onChange={(e) => setAlertForm({ ...alertForm, targetPrice: Number(e.target.value) })}
                className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAlertModal(false)}
                className="px-4 py-2 rounded-xl bg-ink-900 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-coral-500 text-white text-xs font-bold"
              >
                Start Watching
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
