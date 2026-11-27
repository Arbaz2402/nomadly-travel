import React, { useState, useEffect } from 'react';
import {
  Coins,
  ArrowRightLeft,
  TrendingUp,
  RefreshCw,
  Wallet,
  Sparkles,
  Info,
  DollarSign,
  CheckCircle2,
  Share2,
  Clock
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

const POPULAR_CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', symbol: 'د.إ' },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', symbol: '฿' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', symbol: 'S$' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', symbol: 'CHF' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', symbol: 'RM' },
  { code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳', symbol: '₫' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', symbol: '﷼' },
];

export const CurrencyConverterPage = () => {
  const { showToast } = useToast();
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [amount, setAmount] = useState('100');
  const [ratesData, setRatesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Cash planner state
  const [tripDays, setTripDays] = useState(5);
  const [dailyCashBudget, setDailyCashBudget] = useState(60);

  const loadRates = async (base = 'USD') => {
    try {
      setLoading(true);
      const res = await ApiClient.getCurrencyRates(base);
      if (res.success) {
        setRatesData(res.rates);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.warn('Currency rates fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates('USD');
  }, []);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Compute live conversion
  const numAmount = parseFloat(amount) || 0;
  const fromRateInUSD = ratesData?.[fromCurrency] || 1;
  const toRateInUSD = ratesData?.[toCurrency] || (toCurrency === 'INR' ? 84.4 : 1);
  const exchangeRate = fromRateInUSD > 0 ? toRateInUSD / fromRateInUSD : 1;
  const convertedResult = (numAmount * exchangeRate).toFixed(2);
  const inverseRate = exchangeRate > 0 ? (1 / exchangeRate).toFixed(4) : 1;

  // Pocket money computation
  const totalCashNeeded = tripDays * dailyCashBudget;
  const totalCashInDest = (totalCashNeeded * exchangeRate).toFixed(0);

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-fade-in">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral-500/10 border border-coral-500/20 text-coral-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Coins className="w-4 h-4" />
          Real-Time Central Bank FX Rates
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-display mb-3">
          Live Multi-Currency & Cash Calculator
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Convert foreign travel currencies with live institutional exchange rates and calculate exact pocket cash needed for your journey.
        </p>
      </div>

      {/* Main Converter Card */}
      <div className="max-w-3xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-teal-400" />
            <span>Updated with institutional market rates</span>
          </div>
          <button
            onClick={() => loadRates('USD')}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-coral-400 hover:text-coral-300 font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center pt-6">
          {/* Amount & From Currency */}
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              You Spend / Convert
            </label>
            <div className="p-3.5 rounded-2xl bg-ink-950 border border-white/10 focus-within:border-coral-500 transition-all flex items-center gap-3">
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-xl font-bold font-mono text-white focus:outline-none w-full"
                placeholder="100"
              />
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="bg-ink-900 border border-white/10 text-xs font-bold text-white rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                {POPULAR_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center py-2 md:py-0">
            <button
              onClick={handleSwap}
              className="w-10 h-10 rounded-full bg-ink-800 hover:bg-coral-500 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-all shadow-md group"
              title="Swap currencies"
            >
              <ArrowRightLeft className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* Converted Result & To Currency */}
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              You Receive
            </label>
            <div className="p-3.5 rounded-2xl bg-ink-950 border border-white/10 flex items-center justify-between gap-3">
              <div className="text-xl font-bold font-mono text-emerald-400 truncate">
                {convertedResult}
              </div>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="bg-ink-900 border border-white/10 text-xs font-bold text-white rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                {POPULAR_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Rate Summary Bar */}
        <div className="mt-6 p-4 rounded-2xl bg-ink-950/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400">Exchange Rate: </span>
            <span className="font-mono font-bold text-white">
              1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Inverse: </span>
            <span className="font-mono text-slate-300">
              1 {toCurrency} = {inverseRate} {fromCurrency}
            </span>
          </div>
        </div>

        {/* Quick Travel Presets */}
        <div className="mt-6 pt-6 border-t border-white/5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Quick Travel Pairs
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { from: 'USD', to: 'INR', label: '🇺🇸 USD ➔ 🇮🇳 INR' },
              { from: 'EUR', to: 'INR', label: '🇪🇺 EUR ➔ 🇮🇳 INR' },
              { from: 'AED', to: 'INR', label: '🇦🇪 AED ➔ 🇮🇳 INR' },
              { from: 'THB', to: 'INR', label: '🇹🇭 THB ➔ 🇮🇳 INR' },
              { from: 'GBP', to: 'INR', label: '🇬🇧 GBP ➔ 🇮🇳 INR' },
              { from: 'INR', to: 'AED', label: '🇮🇳 INR ➔ 🇦🇪 AED' },
              { from: 'INR', to: 'THB', label: '🇮🇳 INR ➔ 🇹🇭 THB' },
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setFromCurrency(p.from);
                  setToCurrency(p.to);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  fromCurrency === p.from && toCurrency === p.to
                    ? 'bg-coral-500/20 text-coral-300 border-coral-500/40'
                    : 'bg-ink-950 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Section: Traveler Cash Planner & Cheat Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Card 1: Traveler Cash & Pocket Money Planner */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Traveler Cash & Pocket Money Estimator
              </h3>
              <p className="text-xs text-slate-400">
                Estimate how much physical cash notes you should carry for taxis, tips, and street food.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1 block">Trip Duration (Days)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={tripDays}
                onChange={(e) => setTripDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs font-mono font-bold text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1 block">
                Daily Cash ({fromCurrency})
              </label>
              <input
                type="number"
                min="5"
                value={dailyCashBudget}
                onChange={(e) => setDailyCashBudget(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs font-mono font-bold text-white"
              />
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="p-4 rounded-2xl bg-ink-950/80 border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Recommended Cash:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {totalCashNeeded} {fromCurrency} ({totalCashInDest} {toCurrency})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
              <div className="p-2 rounded-lg bg-ink-900 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Taxis & Transit (35%)</span>
                <span className="font-mono text-slate-200 font-bold">
                  {(totalCashNeeded * 0.35).toFixed(0)} {fromCurrency}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-ink-900 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Street Food & Cafes (40%)</span>
                <span className="font-mono text-slate-200 font-bold">
                  {(totalCashNeeded * 0.4).toFixed(0)} {fromCurrency}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-ink-900 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Tips & Incidentals (15%)</span>
                <span className="font-mono text-slate-200 font-bold">
                  {(totalCashNeeded * 0.15).toFixed(0)} {fromCurrency}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-ink-900 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Emergency Reserve (10%)</span>
                <span className="font-mono text-slate-200 font-bold">
                  {(totalCashNeeded * 0.1).toFixed(0)} {fromCurrency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Pocket Cheat Sheet Table */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral-500/10 text-coral-400 flex items-center justify-center border border-coral-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Street Price Reference Card
              </h3>
              <p className="text-xs text-slate-400">
                Instantly recognize prices when shopping or ordering street food abroad.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/5">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-950 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="py-2.5 px-3">{fromCurrency}</th>
                  <th className="py-2.5 px-3 text-right">{toCurrency}</th>
                  <th className="py-2.5 px-3 text-right">{toCurrency}</th>
                  <th className="py-2.5 px-3 text-right">{fromCurrency}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {[1, 5, 10, 20, 50, 100, 500].map((val) => (
                  <tr key={val} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3 text-white font-bold">{val}</td>
                    <td className="py-2 px-3 text-right text-emerald-400">
                      {(val * exchangeRate).toFixed(val > 10 ? 0 : 2)}
                    </td>
                    <td className="py-2 px-3 text-right text-white font-bold">{val * 10}</td>
                    <td className="py-2 px-3 text-right text-coral-400">
                      {(val * 10 * inverseRate).toFixed(val > 10 ? 0 : 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
