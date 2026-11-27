import { BASE_RATES_TO_INR } from '../utils/currencyRates.js';

// Short-TTL in-memory cache for live FX rates
let cachedRates = null;
let lastFetchTime = 0;
const RATES_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Pair quote + chart cache (60 seconds for real-time market accuracy)
const pairCache = new Map();
const PAIR_CACHE_TTL_MS = 60 * 1000;

const RANGE_INTERVAL_MAP = {
  '1d': '15m',
  '5d': '1h',
  '1mo': '1d',
  '1y': '1wk',
};

export const fetchLiveCurrencyRates = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && cachedRates && now - lastFetchTime < RATES_CACHE_TTL_MS) {
    return cachedRates;
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      headers: { 'User-Agent': 'NomadlyTravel/1.0' },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && data.rates.INR) {
        cachedRates = {
          base: 'USD',
          rates: data.rates,
          provider: 'Live Market FX Feed',
          lastUpdated: new Date(data.time_last_update_utc || Date.now()),
        };
        lastFetchTime = now;
        return cachedRates;
      }
    }
  } catch (err) {
    console.warn('[Currency Rates Service]: Failed to fetch live rates, using fallback matrix:', err.message);
  }

  const fallbackRates = {};
  const usdToInr = BASE_RATES_TO_INR.USD || 84.4;
  Object.keys(BASE_RATES_TO_INR).forEach((code) => {
    fallbackRates[code] = Number((usdToInr / BASE_RATES_TO_INR[code]).toFixed(4));
  });

  cachedRates = {
    base: 'USD',
    rates: fallbackRates,
    provider: 'Standard Fallback Matrix',
    lastUpdated: new Date(),
  };
  lastFetchTime = now;
  return cachedRates;
};

export const fetchLivePairWithHistory = async (fromCurr, toCurr, range = '1mo', forceRefresh = false) => {
  const from = (fromCurr || 'EUR').toUpperCase();
  const to = (toCurr || 'INR').toUpperCase();
  const cleanRange = RANGE_INTERVAL_MAP[range] ? range : '1mo';
  const interval = RANGE_INTERVAL_MAP[cleanRange];

  if (from === to) {
    return {
      from,
      to,
      rate: 1,
      inverseRate: 1,
      previousClose: 1,
      change: 0,
      changePercent: 0,
      provider: 'Identity Rate',
      lastUpdated: new Date(),
      history: [],
    };
  }

  const cacheKey = `${from}_${to}_${cleanRange}`;
  const cached = pairCache.get(cacheKey);
  if (!forceRefresh && cached && Date.now() - cached.timestamp < PAIR_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const symbol = `${from}${to}=X`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${cleanRange}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(4500),
    });

    if (res.ok) {
      const json = await res.json();
      const result = json?.chart?.result?.[0];
      const meta = result?.meta;
      const rate = Number(meta?.regularMarketPrice);

      if (rate && !isNaN(rate)) {
        const timestamps = result?.timestamp || [];
        const closes = result?.indicators?.quote?.[0]?.close || [];
        const history = [];

        for (let i = 0; i < timestamps.length; i++) {
          const val = closes[i];
          if (val !== null && val !== undefined && !isNaN(val)) {
            const d = new Date(timestamps[i] * 1000);
            history.push({
              timestamp: timestamps[i] * 1000,
              label:
                cleanRange === '1d'
                  ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                  : cleanRange === '1y'
                  ? d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                  : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
              rate: Number(val.toFixed(4)),
            });
          }
        }

        const prevClose = Number(meta?.chartPreviousClose || meta?.previousClose || history[0]?.rate || rate);
        const change = Number((rate - prevClose).toFixed(4));
        const changePercent = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;

        const payload = {
          from,
          to,
          rate: Number(rate.toFixed(4)),
          inverseRate: Number((1 / rate).toFixed(4)),
          previousClose: Number(prevClose.toFixed(4)),
          change,
          changePercent,
          provider: 'Real-Time Intraday Market FX',
          lastUpdated: new Date((meta?.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now())),
          history,
        };

        pairCache.set(cacheKey, { timestamp: Date.now(), data: payload });
        return payload;
      }
    }
  } catch (err) {
    console.warn(`[Live Pair FX ${from}->${to}]:`, err.message);
  }

  // Fallback to base rates matrix
  const allRates = await fetchLiveCurrencyRates(forceRefresh);
  const fromInUSD = allRates.rates[from] || 1.0;
  const toInUSD = allRates.rates[to] || 84.4;
  const rate = Number((toInUSD / fromInUSD).toFixed(4));

  return {
    from,
    to,
    rate,
    inverseRate: Number((1 / rate).toFixed(4)),
    previousClose: rate,
    change: 0,
    changePercent: 0,
    provider: allRates.provider,
    lastUpdated: allRates.lastUpdated,
    history: [],
  };
};

export const getCurrencyRates = async (req, res) => {
  try {
    const base = (req.query.base || 'USD').toUpperCase();
    const forceRefresh = req.query.refresh === 'true';
    const data = await fetchLiveCurrencyRates(forceRefresh);

    const baseRateInUSD = data.rates[base] || 1.0;
    const normalizedRates = {};

    const supportedCurrencies = [
      'INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'THB', 'JPY',
      'AUD', 'CAD', 'CHF', 'MYR', 'VND', 'IDR', 'SAR', 'QAR'
    ];

    supportedCurrencies.forEach((c) => {
      const rateInUSD = data.rates[c] || BASE_RATES_TO_INR[c] || 1.0;
      normalizedRates[c] = Number((rateInUSD / baseRateInUSD).toFixed(4));
    });

    return res.status(200).json({
      success: true,
      base,
      provider: data.provider,
      lastUpdated: data.lastUpdated,
      rates: normalizedRates,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLivePairQuote = async (req, res) => {
  try {
    const from = (req.query.from || 'EUR').toUpperCase();
    const to = (req.query.to || 'INR').toUpperCase();
    const range = (req.query.range || '1mo').toLowerCase();
    const forceRefresh = req.query.refresh === 'true';

    const data = await fetchLivePairWithHistory(from, to, range, forceRefresh);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const convertCurrencyAmount = async (req, res) => {
  try {
    const { amount, from, to } = req.method === 'POST' ? req.body : req.query;

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({ success: false, message: 'Valid positive amount is required.' });
    }

    const fromCurr = (from || 'USD').toUpperCase();
    const toCurr = (to || 'INR').toUpperCase();

    const quote = await fetchLivePairWithHistory(fromCurr, toCurr, '1d');
    const result = Number((numAmount * quote.rate).toFixed(2));

    return res.status(200).json({
      success: true,
      data: {
        amount: numAmount,
        from: fromCurr,
        to: toCurr,
        rate: quote.rate,
        inverseRate: quote.inverseRate,
        result,
        lastUpdated: quote.lastUpdated,
        provider: quote.provider,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
