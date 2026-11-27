import { BASE_RATES_TO_INR, getExchangeRate, convertCurrency } from '../utils/currencyRates.js';

// In-memory cache for live central bank rates
let cachedRates = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export const fetchLiveCurrencyRates = async () => {
  const now = Date.now();
  if (cachedRates && now - lastFetchTime < CACHE_TTL_MS) {
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
          provider: 'Open Exchange Rates (Central Banks)',
          lastUpdated: new Date(data.time_last_update_utc || Date.now()),
        };
        lastFetchTime = now;
        return cachedRates;
      }
    }
  } catch (err) {
    console.warn('[Currency Rates Service]: Failed to fetch live rates, using fallback matrix:', err.message);
  }

  // Fallback matrix derived from BASE_RATES_TO_INR
  const fallbackRates = {};
  const usdToInr = BASE_RATES_TO_INR.USD || 83.5;
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

export const getCurrencyRates = async (req, res) => {
  try {
    const base = (req.query.base || 'USD').toUpperCase();
    const data = await fetchLiveCurrencyRates();

    const baseRateInUSD = data.rates[base] || 1.0;
    const normalizedRates = {};

    // Major travel currencies
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

export const convertCurrencyAmount = async (req, res) => {
  try {
    const { amount, from, to } = req.method === 'POST' ? req.body : req.query;

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount < 0) {
      return res.status(400).json({ success: false, message: 'Valid positive amount is required.' });
    }

    const fromCurr = (from || 'USD').toUpperCase();
    const toCurr = (to || 'INR').toUpperCase();

    const data = await fetchLiveCurrencyRates();
    const fromInUSD = data.rates[fromCurr] || 1.0;
    const toInUSD = data.rates[toCurr] || 83.5;

    // Rate from A to B = (to in USD) / (from in USD)
    const rate = Number((toInUSD / fromInUSD).toFixed(4));
    const inverseRate = Number((1 / rate).toFixed(4));
    const result = Number((numAmount * rate).toFixed(2));

    return res.status(200).json({
      success: true,
      data: {
        amount: numAmount,
        from: fromCurr,
        to: toCurr,
        rate,
        inverseRate,
        result,
        lastUpdated: data.lastUpdated,
        provider: data.provider,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
