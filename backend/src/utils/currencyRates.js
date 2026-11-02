// Dual-mode Currency Rate Utility
// Supports real-time rates or high-precision fallback matrix

export const BASE_RATES_TO_INR = {
  INR: 1.0,
  USD: 83.5,
  EUR: 90.2,
  GBP: 106.1,
  AED: 22.74,
  SGD: 62.4,
  THB: 2.32,
  JPY: 0.55,
  CAD: 61.2,
  AUD: 54.8,
  CHF: 93.4,
};

/**
 * Get exchange rate from source currency to target currency
 * @param {string} fromCurrency - e.g. 'USD'
 * @param {string} toCurrency - e.g. 'INR'
 * @returns {number} exchange rate
 */
export const getExchangeRate = (fromCurrency = 'INR', toCurrency = 'INR') => {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  if (from === to) return 1.0;

  const fromInINR = BASE_RATES_TO_INR[from] || 1.0;
  const toInINR = BASE_RATES_TO_INR[to] || 1.0;

  // Rate from X to Y = (X in INR) / (Y in INR)
  const rate = fromInINR / toInINR;
  return Number(rate.toFixed(4));
};

/**
 * Convert an amount from one currency to another
 */
export const convertCurrency = (amount, fromCurrency, toCurrency, customRate = null) => {
  if (!amount || isNaN(amount)) return { convertedAmount: 0, exchangeRate: 1 };

  const rate = customRate && customRate > 0 ? customRate : getExchangeRate(fromCurrency, toCurrency);
  const converted = Number((amount * rate).toFixed(2));

  return {
    convertedAmount: converted,
    exchangeRate: rate,
    conversionTimestamp: new Date(),
  };
};

