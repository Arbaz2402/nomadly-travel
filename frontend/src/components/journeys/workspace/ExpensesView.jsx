import React from 'react';
import { Plus, Trash2, PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { CHART_COLORS } from '../helpers';

export const ExpensesView = ({ trip, expenses, analytics, canEdit, onRefresh, onOpenAddExpense }) => {
  const { showToast } = useToast();

  const handleDeleteExpense = async (expId, title) => {
    if (!window.confirm(`Delete expense "${title}"?`)) return;
    try {
      const res = await ApiClient.deleteTripExpense(trip._id, expId);
      if (res.success) {
        showToast('Expense record deleted', 'info');
        onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  const chartData = analytics?.categoryBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-900/60 p-4 rounded-2xl border border-white/5">
        <div>
          <h3 className="text-base font-bold text-white font-display">Expense Management</h3>
          <p className="text-xs text-slate-400">
            Multi-currency conversions, planned vs. actual analytics, and category breakdown.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={onOpenAddExpense}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
          >
            <Plus className="w-4 h-4" /> Record Expense
          </button>
        )}
      </div>

      {/* Visual Analytics Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Category Spending Breakdown
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={4}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b132b', border: '1px solid rgba(255,255,255,0.1)' }}
                    formatter={(val) => formatCurrency(val, trip.currency)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Daily Spending Timeline
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.dailySpending || []}>
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b132b', border: '1px solid rgba(255,255,255,0.1)' }}
                    formatter={(val) => formatCurrency(val, trip.currency)}
                  />
                  <Bar dataKey="amount" fill="#ff5a36" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Expense List */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-4 bg-ink-950/80 border-b border-white/5 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span>Expense Item</span>
          <span>Amount & Converted</span>
        </div>

        <div className="divide-y divide-white/5">
          {expenses.data?.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No expenses recorded yet.</div>
          ) : (
            expenses.data.map((exp) => (
              <div
                key={exp._id}
                className="p-4 hover:bg-white/[0.02] flex items-center justify-between gap-4 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{exp.title}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-300">
                      {exp.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Paid by <span className="font-semibold text-slate-300">{exp.paidBy?.name}</span> on{' '}
                    {formatDate(exp.date)}
                    {exp.currency !== trip.currency && (
                      <span className="text-teal-400 ml-1.5">
                        (Rate: 1 {exp.currency} = {exp.exchangeRate} {trip.currency})
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-white block">
                      {formatCurrency(exp.convertedAmount || exp.amount, trip.currency)}
                    </span>
                    {exp.currency !== trip.currency && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Orig: {exp.amount} {exp.currency}
                      </span>
                    )}
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => handleDeleteExpense(exp._id, exp.title)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: EXPENSE SPLITTING & SETTLEMENT
// =========================================================