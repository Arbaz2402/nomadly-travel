import { User } from '../models/User.js';
import { Trip } from '../models/Trip.js';
import { TripExpense } from '../models/TripExpense.js';
import { TripDocument } from '../models/TripDocument.js';
import { AuditLog } from '../models/AuditLog.js';

export const getAdminOverview = async (req, res) => {
  try {
    const [totalUsers, totalTrips, activeTrips, completedTrips, totalDocuments] = await Promise.all([
      User.countDocuments(),
      Trip.countDocuments(),
      Trip.countDocuments({ status: { $in: ['upcoming', 'ongoing'] } }),
      Trip.countDocuments({ status: 'completed' }),
      TripDocument.countDocuments(),
    ]);

    const expenseAgg = await TripExpense.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: { $ifNull: ['$convertedAmount', { $ifNull: ['$amount', 0] }] } },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const totalTrackedExpenses = expenseAgg.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const last6MonthsBuckets = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6MonthsBuckets.push({
        year: d.getFullYear(),
        monthNumber: d.getMonth() + 1,
        month: monthNames[d.getMonth()],
      });
    }

    const windowStart = new Date(last6MonthsBuckets[0].year, last6MonthsBuckets[0].monthNumber - 1, 1);
    const monthlyAgg = await Trip.aggregate([
      { $match: { createdAt: { $gte: windowStart } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          trips: { $sum: 1 },
        },
      },
    ]);

    const monthlyTrends = last6MonthsBuckets.map((bucket) => {
      const match = monthlyAgg.find(
        (agg) => agg._id.year === bucket.year && agg._id.month === bucket.monthNumber
      );
      return {
        month: bucket.month,
        trips: match ? match.trips : 0,
      };
    });

    const recentTrips = await Trip.find()
      .populate('user', 'displayName email')
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          totalTrips,
          activeTrips,
          completedTrips,
          totalDocuments,
          totalTrackedExpenses: Math.round(totalTrackedExpenses),
        },
        expenseDistribution: expenseAgg,
        monthlyTrends,
        recentTrips,
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
      count: users.length,
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
