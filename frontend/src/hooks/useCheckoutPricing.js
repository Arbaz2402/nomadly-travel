import { useMemo } from 'react';
import { TAX_RATES, SERVICE_FEES } from '../constants/travel';

/**
 * Custom hook to calculate client-side preview pricing during checkout.
 * Authoritative financial validation is enforced on the backend server.
 */
export const useCheckoutPricing = ({
  category = 'flight',
  pricing = {},
  itinerary = {},
  passengerCount = 1,
  selectedAddOns = [],
  appliedCoupon = null,
}) => {
  return useMemo(() => {
    const baseFare = pricing?.baseFare || itinerary?.baseFare || 3000;
    const quantity = Math.max(1, passengerCount);
    const rawBase = baseFare * quantity;
    const taxRate = TAX_RATES[category] || TAX_RATES.default;
    const taxes = Math.round(rawBase * taxRate);
    const serviceFee = SERVICE_FEES[category] || SERVICE_FEES.default;
    const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + (item.price || 0), 0);
    const discountAmount = appliedCoupon?.calculatedDiscount || 0;
    const estimatedPayable = Math.max(0, rawBase + taxes + serviceFee + addOnsTotal - discountAmount);

    return {
      baseFare,
      rawBase,
      taxes,
      serviceFee,
      addOnsTotal,
      discountAmount,
      estimatedPayable,
    };
  }, [category, pricing, itinerary, passengerCount, selectedAddOns, appliedCoupon]);
};
