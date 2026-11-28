import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Activity,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { AdminKpiCards } from '../../components/admin/AdminKpiCards';
import { AdminAnalyticsCharts } from '../../components/admin/AdminAnalyticsCharts';
import { AdminUsersTable } from '../../components/admin/AdminUsersTable';

export const AdminDashboard = () => {
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [overviewData, setOverviewData] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchOverview = async () => {
    try {
      const res = await ApiClient.getAdminOverview();
      if (res.success) {
        setOverviewData(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin overview:', err);
      showToast(err.message || 'Failed to fetch admin overview', 'error');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await ApiClient.getAdminUsers({});
      if (res.success) setUsers(res.data);
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

  useEffect(() => {
    fetchOverview();
  }, [user?._id]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'audit') fetchAuditLogs();
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

  const kpis = overviewData?.kpis || {};
  const monthlyTrends = overviewData?.monthlyTrends || [];
  const expenseDistribution = overviewData?.expenseDistribution || [];

  const pieColors = ['#ff5a36', '#14b8a6', '#f59e0b', '#3b82f6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="glass-panel rounded-3xl p-6 mb-8 border border-white/10 flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-coral-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Operations &amp; Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            NOMADLY Admin Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            User governance, journey metrics, expense breakdown, and security audit logs.
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-ink-900 border border-white/10 overflow-x-auto scrollbar-none max-w-full">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: Activity },
            { id: 'users', label: 'User Governance', icon: Users },
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

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <AdminKpiCards kpis={kpis} />
          <AdminAnalyticsCharts
            monthlyTrends={monthlyTrends}
            expenseDistribution={expenseDistribution}
            pieColors={pieColors}
          />
        </div>
      )}

      {activeTab === 'users' && (
        <AdminUsersTable
          users={users}
          onToggleSuspension={handleToggleSuspension}
        />
      )}

      {activeTab === 'audit' && (
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white tracking-tight">System Security &amp; Audit Trail</h2>
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
    </div>
  );
};
