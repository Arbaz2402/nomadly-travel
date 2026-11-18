import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Activity,
  Ticket,
  Database,
  RefreshCw,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { AdminKpiCards } from '../../components/admin/AdminKpiCards';
import { AdminAnalyticsCharts } from '../../components/admin/AdminAnalyticsCharts';
import { AdminBookingsTable } from '../../components/admin/AdminBookingsTable';
import { AdminUsersTable } from '../../components/admin/AdminUsersTable';
import { CreateCouponModal } from '../../components/admin/CreateCouponModal';

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
  }, [user?._id]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'audit') fetchAuditLogs();
    if (activeTab === 'inventory') fetchInventory();
  }, [activeTab, user?._id]);

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
  const categoryDistribution = overviewData?.categoryDistribution || [];

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
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-ink-900 border border-white/10 overflow-x-auto scrollbar-none max-w-full">
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
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-coral-500 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview & Analytics */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <AdminKpiCards kpis={kpis} />
          <AdminAnalyticsCharts
            monthlyTrends={monthlyTrends}
            categoryDistribution={categoryDistribution}
            pieColors={pieColors}
          />

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
        <AdminBookingsTable
          bookings={bookings}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onFilter={fetchBookings}
        />
      )}

      {/* Tab 3: Users Management */}
      {activeTab === 'users' && (
        <AdminUsersTable
          users={users}
          onToggleSuspension={handleToggleSuspension}
        />
      )}

      {/* Tab 4: Supplier GDS Health */}
      {activeTab === 'inventory' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Travel Provider Integration Mesh</h2>
              <p className="text-xs text-slate-400">Live operational status of connected reservation channels</p>
            </div>
            <button
              onClick={fetchInventory}
              className="px-3 py-1.5 rounded-xl bg-ink-900 hover:bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
              <span>Refresh Status</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inventoryStats && Object.keys(inventoryStats).length > 0 ? (
              Object.entries(inventoryStats).map(([key, item]) => {
                const displayName =
                  key === 'flights'
                    ? 'Global Flight Distribution'
                    : key === 'hotels'
                    ? 'Luxury Hotel Channel CRS'
                    : key === 'experiences'
                    ? 'Local Guides & Curated Tours'
                    : key === 'packages'
                    ? 'Dynamic Vacation Combos Engine'
                    : key.toUpperCase();

                return (
                  <div key={key} className="p-5 rounded-2xl bg-ink-900/60 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                        <h3 className="font-bold text-white text-sm">{displayName}</h3>
                      </div>
                      <p className="text-xs text-slate-400">{item.provider}</p>
                      <p className="text-[11px] text-teal-400 mt-2 font-medium">{item.items || `${item.count} items active`}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-bold uppercase">
                      {item.status || 'Connected'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-8 text-center text-xs text-slate-400">
                Loading live supplier telemetry...
              </div>
            )}
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
      <CreateCouponModal
        isOpen={showCouponModal}
        couponForm={couponForm}
        setCouponForm={setCouponForm}
        onClose={() => setShowCouponModal(false)}
        onSubmit={handleCreateCoupon}
      />
    </div>
  );
};
