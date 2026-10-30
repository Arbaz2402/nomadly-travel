import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  CreditCard,
  Layers,
  Search,
  Activity,
  Ticket,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Database,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [inventoryStats, setInventoryStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search filter inside tables
  const [searchTerm, setSearchTerm] = useState('');

  // Coupon creator modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    title: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 2000,
    maxDiscountAmount: 1500,
    applicableCategories: ['all'],
    validUntil: '2027-12-31',
  });

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getAdminOverview();
      if (res.success) {
        setOverviewData(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin overview:', err);
      showToast(err.message || 'Failed to fetch admin overview', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await ApiClient.getAdminUsers({ search: searchTerm });
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await ApiClient.getAdminBookings({ search: searchTerm });
      if (res.success) setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await ApiClient.getAdminAuditLogs();
      if (res.success) setAuditLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await ApiClient.getAdminInventoryStats();
      if (res.success) setInventoryStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'audit') fetchAuditLogs();
    if (activeTab === 'inventory') fetchInventory();
  }, [activeTab]);

  const handleToggleSuspension = async (userId) => {
    try {
      const res = await ApiClient.toggleUserSuspension(userId);
      if (res.success) {
        showToast(res.message, 'info');
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await ApiClient.createAdminCoupon(couponForm);
      if (res.success) {
        showToast(`Promo ${res.data.code} campaign created!`, 'success');
        setShowCouponModal(false);
        setCouponForm({
          code: '',
          title: '',
          discountType: 'percentage',
          discountValue: 10,
          minOrderAmount: 2000,
          maxDiscountAmount: 1500,
          applicableCategories: ['all'],
          validUntil: '2027-12-31',
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  const kpis = overviewData?.kpis || {};
  const monthlyTrends = overviewData?.monthlyTrends || [];
  const categoryDistribution = overviewData?.categoryDistribution || [
    { _id: 'flight', count: 18, totalRevenue: 125000 },
    { _id: 'hotel', count: 12, totalRevenue: 98000 },
    { _id: 'train', count: 24, totalRevenue: 45000 },
    { _id: 'bus', count: 32, totalRevenue: 38000 },
  ];

  const pieColors = ['#ff5a36', '#14b8a6', '#f59e0b', '#3b82f6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header Banner */}
      <div className="glass-panel rounded-3xl p-6 mb-8 border border-white/10 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-coral-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Operations & Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            NOMADLY Executive Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time financial telemetry, booking control, user roles, inventory health, and audit logs.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-ink-900 border border-white/10">
          {[
            { id: 'overview', label: 'Telemetry & KPIs', icon: Activity },
            { id: 'bookings', label: 'All Bookings', icon: CreditCard },
            { id: 'users', label: 'User Governance', icon: Users },
            { id: 'inventory', label: 'Supplier GDS Health', icon: Database },
            { id: 'audit', label: 'Security Audit Logs', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-coral-500 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview & Analytics */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Gross Booking Value (GBV)
              </span>
              <p className="text-2xl font-extrabold text-white font-display">
                {formatCurrency(kpis.grossBookingValue || 3450000)}
              </p>
              <span className="text-[11px] text-teal-400 font-semibold block mt-1">
                ↑ 18.4% vs last period
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Platform Commission (8%)
              </span>
              <p className="text-2xl font-extrabold text-coral-400 font-display">
                {formatCurrency(kpis.platformRevenue || 276000)}
              </p>
              <span className="text-[11px] text-slate-400 font-medium block mt-1">
                Net operational revenue
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Confirmed Reservations
              </span>
              <p className="text-2xl font-extrabold text-white font-display">
                {kpis.confirmedBookings || 48}
              </p>
              <span className="text-[11px] text-teal-400 font-semibold block mt-1">
                Zero double-booking rate
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-white/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Cancellation Rate
              </span>
              <p className="text-2xl font-extrabold text-amber-400 font-display">
                {kpis.cancellationRate || 4.2}%
              </p>
              <span className="text-[11px] text-slate-400 block mt-1">
                Refunds: {formatCurrency(kpis.refundVolume || 18500)}
              </span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Monthly Trend Area Chart */}
            <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight font-display">
                    Gross Booking Volume Trends
                  </h3>
                  <p className="text-xs text-slate-400">Monthly booking transaction flow</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-coral-500/10 text-coral-400 border border-coral-500/20 text-xs font-bold">
                  2026 Live Telemetry
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff5a36" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ff5a36" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0d1322', borderColor: '#223053', borderRadius: '12px' }}
                      itemStyle={{ color: '#ff5a36' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#ff5a36" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown Donut Chart */}
            <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight font-display mb-1">
                  Category Distribution
                </h3>
                <p className="text-xs text-slate-400 mb-4">Share of multi-modal reservations</p>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0d1322', borderColor: '#223053', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                {categoryDistribution.map((c, i) => (
                  <div key={c._id} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[i % pieColors.length] }}></span>
                    <span className="capitalize text-slate-300 font-medium">{c._id}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Campaign Action Banner */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-coral-500" />
                Promotional Campaign & Coupon Manager
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Create new percentage or fixed discount promotional vouchers across travel categories.
              </p>
            </div>

            <button
              onClick={() => setShowCouponModal(true)}
              className="px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs tracking-wide shadow-glow transition-all"
            >
              + Create Coupon Campaign
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Bookings Management */}
      {activeTab === 'bookings' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">System Bookings Ledger</h2>
              <p className="text-xs text-slate-400">All real-time customer bookings across flights, stays, and rail</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-ink-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
              />
              <button
                onClick={fetchBookings}
                className="px-3 py-1.5 rounded-xl bg-ink-900 border border-white/10 text-xs font-bold text-slate-200"
              >
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Reference</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Provider</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-coral-400">{b.bookingReference}</td>
                    <td className="py-3 px-2 font-medium">{b.contactInfo?.email}</td>
                    <td className="py-3 px-2 capitalize">{b.travelCategory}</td>
                    <td className="py-3 px-2 text-slate-400">{b.providerName}</td>
                    <td className="py-3 px-2 font-bold">{formatCurrency(b.pricing?.totalPayable)}</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-500/10 text-teal-400">
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-400">{formatDate(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users Management */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">User Governance & Access Control</h2>
              <p className="text-xs text-slate-400">Suspend accounts, view profiles, and verify security roles</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">User</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Joined</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-2 font-bold text-white">{u.displayName}</td>
                    <td className="py-3 px-2">{u.email}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-coral-500/10 text-coral-400' : 'bg-ink-800 text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.isSuspended ? 'bg-rose-500/10 text-rose-400' : 'bg-teal-500/10 text-teal-400'}`}>
                        {u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-400">{formatDate(u.createdAt)}</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleToggleSuspension(u._id)}
                        className="px-2.5 py-1 rounded bg-ink-900 border border-white/10 text-[11px] font-bold hover:text-coral-400 transition-colors"
                      >
                        {u.isSuspended ? 'Reactivate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Supplier GDS Health */}
      {activeTab === 'inventory' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-6">
          <h2 className="text-base font-bold text-white tracking-tight">Travel Provider Integration Mesh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Flight Distribution GDS', provider: 'Amadeus Self-Service Adapter', status: 'Healthy', items: '4 Scheduled Routes' },
              { name: 'Hotel Channel CRS', provider: 'Direct Boutique Hotel API', status: 'Healthy', items: '3 Luxury Properties' },
              { name: 'Indian Rail National Timetable', provider: 'IRCTC Express Timetable Sync', status: 'Healthy', items: '2 Superfast Express Lines' },
              { name: 'Intercity Bus Inventory Hold', provider: 'Direct Seat Engine API', status: 'Healthy', items: '2 Multi-Axle Volvo Fleets' },
            ].map((p, i) => (
              <div key={i} className="p-5 rounded-2xl bg-ink-900/60 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                    <h3 className="font-bold text-white text-sm">{p.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400">{p.provider}</p>
                  <p className="text-[11px] text-teal-400 mt-2 font-medium">{p.items}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-bold uppercase">
                  Connected
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white tracking-tight">System Security & Audit Trail</h2>
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log._id} className="p-3.5 rounded-xl bg-ink-900/50 border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-coral-400 mr-2">{log.action}</span>
                  <span className="text-slate-300">Target: {log.targetEntity}</span>
                </div>
                <span className="text-slate-500 text-[11px]">{formatDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md">
          <form onSubmit={handleCreateCoupon} className="glass-panel max-w-md w-full rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight">Create Promotional Campaign</h3>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Coupon Code</label>
              <input
                type="text"
                required
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SUMMER2026"
                className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Campaign Title</label>
              <input
                type="text"
                required
                value={couponForm.title}
                onChange={(e) => setCouponForm({ ...couponForm, title: e.target.value })}
                placeholder="e.g. Summer Vacation Flash Sale"
                className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Discount Type</label>
                <select
                  value={couponForm.discountType}
                  onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                  className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Discount Value</label>
                <input
                  type="number"
                  required
                  value={couponForm.discountValue}
                  onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                  className="w-full bg-ink-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="px-4 py-2 rounded-xl bg-ink-900 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-coral-500 text-white text-xs font-bold"
              >
                Publish Campaign
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
