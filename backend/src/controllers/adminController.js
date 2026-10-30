import { User } from '../models/User.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Refund } from '../models/Refund.js';
import { Coupon } from '../models/Coupon.js';
import { AuditLog } from '../models/AuditLog.js';
import { FlightOffer } from '../models/FlightOffer.js';
import { Hotel } from '../models/Hotel.js';
import { Train } from '../models/Train.js';
import { Bus } from '../models/Bus.js';

export const getAdminOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ bookingStatus: 'pending_payment' });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: 'cancelled' });

    // Financial calculations
    const payments = await Payment.find({ status: 'captured' });
    const grossBookingValue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    // Platform fee revenue (approx 8% of GBV)
    const platformRevenue = Math.round(grossBookingValue * 0.08);

    const refunds = await Refund.find({ status: 'processed' });
    const refundVolume = refunds.reduce((acc, r) => acc + (r.amount || 0), 0);

    const cancellationRate = totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : 0;

    // Category distribution
    const categoryCounts = await Booking.aggregate([
      { $group: { _id: '$travelCategory', count: { $sum: 1 }, totalRevenue: { $sum: '$pricing.totalPayable' } } },
    ]);

    // Monthly booking trend simulation/aggregate
    const monthlyTrends = [
      { month: 'Jan', bookings: 120, revenue: 450000 },
      { month: 'Feb', bookings: 154, revenue: 580000 },
      { month: 'Mar', bookings: 210, revenue: 840000 },
      { month: 'Apr', bookings: 275, revenue: 1120000 },
      { month: 'May', bookings: 340, revenue: 1450000 },
      { month: 'Jun', bookings: 390, revenue: 1680000 },
    ];

    // Recent 10 bookings
    const recentBookings = await Booking.find()
      .populate('user', 'displayName email')
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          totalBookings,
          confirmedBookings,
          pendingBookings,
          cancelledBookings,
          grossBookingValue,
          platformRevenue,
          refundVolume,
          cancellationRate,
        },
        categoryDistribution: categoryCounts,
        monthlyTrends,
        recentBookings,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { displayName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      total,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserSuspension = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isSuspended = !user.isSuspended;
    await user.save();

    await AuditLog.create({
      performedBy: req.user._id,
      action: user.isSuspended ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      targetEntity: 'User',
      targetId: user._id.toString(),
      details: { email: user.email },
    });

    return res.status(200).json({
      success: true,
      message: `User account ${user.isSuspended ? 'suspended' : 'reactivated'}.`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'admin', 'supplier'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = role;
    await user.save();

    await AuditLog.create({
      performedBy: req.user._id,
      action: 'USER_ROLE_CHANGED',
      targetEntity: 'User',
      targetId: user._id.toString(),
      details: { email: user.email, newRole: role },
    });

    return res.status(200).json({
      success: true,
      message: `Role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminBookings = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const query = {};

    if (search) {
      query.bookingReference = new RegExp(search, 'i');
    }

    if (category && category !== 'all') {
      query.travelCategory = category;
    }

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'displayName email')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('performedBy', 'displayName email')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAdminCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);

    await AuditLog.create({
      performedBy: req.user._id,
      action: 'COUPON_CREATED',
      targetEntity: 'Coupon',
      targetId: coupon._id.toString(),
      details: { code: coupon.code, discountValue: coupon.discountValue },
    });

    return res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminInventoryStats = async (req, res) => {
  try {
    const flightCount = await FlightOffer.countDocuments();
    const hotelCount = await Hotel.countDocuments();
    const trainCount = await Train.countDocuments();
    const busCount = await Bus.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        flights: { count: flightCount, provider: 'Simulated Amadeus / Indigo API', status: 'Healthy' },
        hotels: { count: hotelCount, provider: 'Boutique CRS / Direct Inventory', status: 'Healthy' },
        trains: { count: trainCount, provider: 'Indian Railways IRCTC Timetable', status: 'Healthy' },
        buses: { count: busCount, provider: 'InterCity Bus Direct GDS', status: 'Healthy' },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
