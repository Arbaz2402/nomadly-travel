import { Coupon } from '../models/Coupon.js';

export const validateCoupon = async (req, res) => {
  try {
    const { code, category, amount = 0 } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code required.' });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
      validUntil: { $gte: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const isApplicable =
      coupon.applicableCategories.includes('all') ||
      coupon.applicableCategories.includes(category);

    if (!isApplicable) {
      return res.status(400).json({
        success: false,
        message: `Coupon is not valid for ${category} reservations.`,
      });
    }

    if (amount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.`,
      });
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === 'percentage') {
      calculatedDiscount = Math.min(
        Math.round((amount * coupon.discountValue) / 100),
        coupon.maxDiscountAmount || 1500
      );
    } else {
      calculatedDiscount = Math.min(coupon.discountValue, amount);
    }

    return res.status(200).json({
      success: true,
      message: 'Coupon applied successfully!',
      data: {
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true, validUntil: { $gte: new Date() } }).limit(10);
    return res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
