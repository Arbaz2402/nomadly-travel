import React, { useState, useEffect, useRef } from 'react';
import {
  Coins,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Wallet,
  Clock,
  Info,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { ApiClient } from '../../services/api';
import { useToast } from '../../context/ToastContext';

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
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('INR');
  const [amount, setAmount] = useState('1');
  const [chartRange, setChartRange] = useState('1mo');
  const [pairQuote, setPairQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const disclaimerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (disclaimerRef.current && !disclaimerRef.current.contains(e.target)) {
        setShowDisclaimer(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowDisclaimer(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Cash planner state (independent from top converter)
  const [tripDays, setTripDays] = useState(5);
  const [dailyCashBudget, setDailyCashBudget] = useState(60);
  const [cashCurrency, setCashCurrency] = useState('USD');
  const [cashTargetCurrency, setCashTargetCurrency] = useState('INR');
  const [allRates, setAllRates] = useState(null);

  useEffect(() => {
    ApiClient.getCurrencyRates('USD')
      .then((res) => {
        if (res.success && res.rates) setAllRates(res.rates);
      })
      .catch(() => {});
  }, []);

  const loadLivePair = async (from = fromCurrency, to = toCurrency, range = chartRange, forceRefresh = false) => {
    try {
      setLoading(true);
      const res = await ApiClient.getLiveCurrencyPair(from, to, range, forceRefresh);
      if (res.success && res.data) {
        setPairQuote(res.data);
        if (forceRefresh) {
          showToast(`Synced live ${from}/${to} market rate: ${res.data.rate}`, 'success');
        }
      }
    } catch (err) {
      console.warn('Currency pair fetch notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLivePair(fromCurrency, toCurrency, chartRange, false);
  }, [fromCurrency, toCurrency, chartRange]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // Live conversion numbers
  const numAmount = parseFloat(amount) || 0;
  const exchangeRate = pairQuote?.rate || (fromCurrency === toCurrency ? 1 : fromCurrency === 'EUR' && toCurrency === 'INR' ? 101.9 : 84.4);
  const convertedResult = (numAmount * exchangeRate).toFixed(2);
  const inverseRate = pairQuote?.inverseRate || (exchangeRate > 0 ? (1 / exchangeRate).toFixed(4) : 1);
  const change = pairQuote?.change || 0;
  const changePercent = pairQuote?.changePercent || 0;
  const isPositive = change >= 0;
  const history = pairQuote?.history || [];

  // Pocket money computation (independent currency pair)
  const cashRate =
    cashCurrency === cashTargetCurrency
      ? 1
      : cashCurrency === fromCurrency && cashTargetCurrency === toCurrency
      ? exchangeRate
      : allRates
      ? (allRates[cashTargetCurrency] || 1) / (allRates[cashCurrency] || 1)
      : 84.4;
  const totalCashNeeded = tripDays * dailyCashBudget;
  const totalCashInDest = (totalCashNeeded * cashRate).toFixed(0);

  const fromName = POPULAR_CURRENCIES.find((c) => c.code === fromCurrency)?.name || fromCurrency;
  const toName = POPULAR_CURRENCIES.find((c) => c.code === toCurrency)?.name || toCurrency;

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-fade-in">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral-500/10 border border-coral-500/20 text-coral-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Coins className="w-4 h-4" />
          Real-Time Intraday Market FX Rates
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-display mb-3">
          Live Multi-Currency & Cash Calculator
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Synced with live intraday market feeds matching Google Finance, complete with interactive historical charts and travel cash planning.
        </p>
      </div>

      {/* Main Converter + Live Chart Card */}
      <div className="max-w-5xl mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/5">
          <div>
            <p className="text-xs text-slate-400 font-medium">
              1 {fromName} equals
            </p>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                {exchangeRate.toFixed(2)} {toName}
              </span>
              {pairQuote && change !== 0 && (
                <span
                  className={`text-xs font-bold flex items-center gap-1 px-2 py-0.5 rounded-full ${
                    isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}
                >
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}
                  {changePercent}% ({chartRange.toUpperCase()})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>
                {pairQuote?.provider || 'Live Market FX'} • Updated{' '}
                {pairQuote?.lastUpdated
                  ? new Date(pairQuote.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'just now'}
              </span>

              <div
                ref={disclaimerRef}
                className="relative inline-flex items-center"
                onMouseEnter={() => setShowDisclaimer(true)}
                onMouseLeave={() => setShowDisclaimer(false)}
              >
                <button
                  type="button"
                  onClick={() => setShowDisclaimer((prev) => !prev)}
                  aria-label="Currency Rate Disclaimer"
                  aria-expanded={showDisclaimer}
                  className="w-4 h-4 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                >
                  <Info className="w-2.5 h-2.5" />
                </button>

                {showDisclaimer && (
                  <div
                    role="dialog"
                    aria-label="Currency Rate Disclaimer"
                    className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 z-50 w-[min(86vw,26rem)] p-4 rounded-2xl bg-ink-950/95 backdrop-blur-xl border border-white/15 shadow-2xl text-left space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        Currency Rate Disclaimer
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowDisclaimer(false)}
                        aria-label="Close disclaimer"
                        className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      Exchange rates displayed on this website are provided for informational purposes only and are indicative market rates. Rates are sourced from third-party financial data providers and may be delayed or differ from the actual rates offered by banks, financial institutions, credit card networks, or money-transfer services.
                    </p>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      While we strive to provide accurate and up-to-date information, we do not guarantee the accuracy, completeness, or real-time availability of the displayed rates. Actual transaction rates may vary due to market fluctuations, provider fees, spreads, and applicable charges.
                    </p>
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      This website does not provide financial or investment advice. Please verify the applicable exchange rate with your financial institution before making any currency exchange or financial transaction.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => loadLivePair(fromCurrency, toCurrency, chartRange, true)}
            disabled={loading}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ink-950 border border-white/10 hover:border-coral-500/50 text-xs text-coral-400 hover:text-coral-300 font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Live Rate
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Inputs */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-2">
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
                  placeholder="1"
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

            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                className="w-10 h-10 rounded-full bg-ink-800 hover:bg-coral-500 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-all shadow-md group"
                title="Swap currencies"
              >
                <ArrowRightLeft className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>

            <div className="space-y-2">
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

            <div className="p-3.5 rounded-2xl bg-ink-950/80 border border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                1 {fromCurrency} = <strong className="text-white font-mono">{exchangeRate.toFixed(4)} {toCurrency}</strong>
              </span>
              <span className="text-slate-400">
                1 {toCurrency} = <strong className="text-slate-300 font-mono">{inverseRate} {fromCurrency}</strong>
              </span>
            </div>
          </div>

          {/* Right: Live Market Trend Chart */}
          <div className="lg:col-span-6 p-4 rounded-2xl bg-ink-950/70 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                {fromCurrency}/{toCurrency} Market Trend
              </span>
              <div className="flex items-center gap-1 bg-ink-900 p-1 rounded-xl border border-white/5">
                {[
                  { id: '1d', label: '1D' },
                  { id: '5d', label: '5D' },
                  { id: '1mo', label: '1M' },
                  { id: '1y', label: '1Y' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setChartRange(r.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      chartRange === r.id
                        ? 'bg-coral-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-52 w-full">
              {history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fxGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ff5a36'} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ff5a36'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      stroke="#64748b"
                      tick={{ fontSize: 10 }}
                      minTickGap={24}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      stroke="#64748b"
                      tick={{ fontSize: 10 }}
                      width={48}
                      tickFormatter={(v) => v.toFixed(1)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0b132b',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      formatter={(val) => [`${Number(val).toFixed(4)} ${toCurrency}`, `1 ${fromCurrency}`]}
                    />
                    <Area
                      type="monotone"
                      dataKey="rate"
                      stroke={isPositive ? '#10b981' : '#ff5a36'}
                      strokeWidth={2}
                      fill="url(#fxGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  {loading ? 'Loading live market chart...' : 'Chart available when currencies differ'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Travel Presets */}
        <div className="pt-5 border-t border-white/5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Quick Travel Pairs
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { from: 'EUR', to: 'INR', label: '🇪🇺 EUR ➔ 🇮🇳 INR' },
              { from: 'USD', to: 'INR', label: '🇺🇸 USD ➔ 🇮🇳 INR' },
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                Daily Cash ({cashCurrency})
              </label>
              <input
                type="number"
                min="1"
                value={dailyCashBudget}
                onChange={(e) => setDailyCashBudget(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs font-mono font-bold text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1 block">Cash Currency</label>
              <div className="flex items-center gap-1.5">
                <select
                  value={cashCurrency}
                  onChange={(e) => setCashCurrency(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs font-bold text-white cursor-pointer"
                >
                  {POPULAR_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <span className="text-slate-500 text-xs">➔</span>
                <select
                  value={cashTargetCurrency}
                  onChange={(e) => setCashTargetCurrency(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs font-bold text-white cursor-pointer"
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

          {/* Breakdown Pills */}
          <div className="p-4 rounded-2xl bg-ink-950/80 border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Recommended Cash:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {totalCashNeeded} {cashCurrency}
                {cashCurrency !== cashTargetCurrency && ` (${totalCashInDest} ${cashTargetCurrency})`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
              <div className="p-2 rounded-lg bg-ink-900 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Taxis & Transit (35%)</span>
                <span className="font-mono text-slate-200 font-bold">
                  {(totalCashNeeded * 0.35).toFixed(0)} {cashCurrency}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-ink-900 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Street Food & Cafes (40%)</span>
                <span className="font-mono text-slate-200 font-bold">
                  {(totalCashNeeded * 0.4).toFixed(0)} {cashCurrency}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-ink-900 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Tips & Incidentals (15%)</span>
                <span className="font-mono text-slate-200 font-bold">
                  {(totalCashNeeded * 0.15).toFixed(0)} {cashCurrency}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-ink-900 border border-white/5">
                <span className="text-slate-400 block text-[10px]">Emergency Reserve (10%)</span>
                <span className="font-mono text-slate-200 font-bold">
                  {(totalCashNeeded * 0.1).toFixed(0)} {cashCurrency}
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
