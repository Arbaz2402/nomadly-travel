import { Coupon } from '../../models/Coupon.js';

export class PricingService {
  /**
   * Server-side calculation of authoritative booking prices.
   * Prevents client tampering.
   */
  static async calculate({
    category,
    baseFare,
    quantity = 1,
    addOns = [],
    couponCode = null,
  }) {
    const rawBaseFare = Math.max(0, Number(baseFare) * quantity);

    // Dynamic tax rate based on transport/hotel industry standard (GST 12% for budget/transport, 18% for luxury)
    let taxRate = 0.12;
    if (category === 'hotel' || category === 'flight') {
      taxRate = 0.18;
    }
    const taxes = Math.round(rawBaseFare * taxRate);

    // Platform standard service fee
    const serviceFee = category === 'bus' ? 40 : 150;

    // Add-ons total (e.g. travel insurance, meals, extra luggage)
    const addOnsAmount = addOns.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

    let subtotal = rawBaseFare + taxes + serviceFee + addOnsAmount;
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim() !== '') {
      const codeUpper = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({
        code: codeUpper,
        isActive: true,
        validUntil: { $gte: new Date() },
      });

      if (coupon) {
        const isApplicable =
          coupon.applicableCategories.includes('all') ||
          coupon.applicableCategories.includes(category);

        if (isApplicable && subtotal >= coupon.minOrderAmount) {
          if (coupon.discountType === 'percentage') {
            const calculatedPercentDiscount = Math.round((subtotal * coupon.discountValue) / 100);
            discount = Math.min(calculatedPercentDiscount, coupon.maxDiscountAmount || 1500);
          } else if (coupon.discountType === 'fixed') {
            discount = Math.min(coupon.discountValue, subtotal);
          }
          appliedCoupon = coupon.code;
        }
      }
    }

    const totalPayable = Math.max(0, subtotal - discount);

    return {
      baseFare: rawBaseFare,
      taxes,
      serviceFee,
      addOnsAmount,
      discount,
      couponCode: appliedCoupon,
      totalPayable,
      currency: 'INR',
    };
  }
}
