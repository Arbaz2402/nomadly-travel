import React from 'react';
import {
  ArrowRight,
  Sparkles,
  DollarSign,
  PieChart as PieIcon,
  Activity as ActivityIcon,
  MapPin,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { CHART_COLORS } from '../helpers';

export const OverviewView = ({ trip, analytics, expenses, activityLogs, onSwitchTab }) => {
  const budget = trip.budget?.totalBudget || 50000;
  const spent = trip.actualSpend || 0;
  const remaining = Math.max(0, budget - spent);
  const utilization = trip.budgetUtilization || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Financials & Highlights */}
      <div className="lg:col-span-2 space-y-6">
        {/* Budget Progress Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display">Budget Telemetry</h3>
            <button
              onClick={() => onSwitchTab('expenses')}
              className="text-xs text-coral-400 hover:underline font-semibold flex items-center gap-1"
            >
              View Full Tracker <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3.5 rounded-2xl bg-ink-950 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Budget</span>
              <span className="text-base sm:text-lg font-black font-mono text-white mt-0.5 block">
                {formatCurrency(budget, trip.currency)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-ink-950 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Spent</span>
              <span className="text-base sm:text-lg font-black font-mono text-teal-400 mt-0.5 block">
                {formatCurrency(spent, trip.currency)}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-ink-950 border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Remaining</span>
              <span className="text-base sm:text-lg font-black font-mono text-coral-400 mt-0.5 block">
                {formatCurrency(remaining, trip.currency)}
              </span>
            </div>
          </div>

          {/* Progress Gauge */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-slate-400 font-semibold">
              <span>Utilization ({utilization}%)</span>
              <span>
                {spent > budget ? 'Budget exceeded!' : `${Math.round(100 - utilization)}% available`}
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-ink-950 overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  utilization > 100
                    ? 'bg-rose-500'
                    : utilization > 80
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-teal-400 to-coral-500'
                }`}
                style={{ width: `${Math.min(100, utilization)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Route Highlights */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-3">
          <h3 className="text-base font-bold text-white font-display">Destinations & Route</h3>
          <div className="flex flex-wrap gap-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-coral-500/10 border border-coral-500/30 text-coral-400 font-bold text-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Primary: {trip.destination}
            </span>
            {trip.additionalDestinations?.map((dest, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold"
              >
                {dest}
              </span>
            ))}
          </div>
          {trip.description && (
            <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/5">
              {trip.description}
            </p>
          )}
        </div>
      </div>

      {/* Right Col: Activity Log Stream */}
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
            <Clock className="w-4 h-4" />
            Recent Activity & Collaboration
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No activity logged yet.</p>
            ) : (
              activityLogs.map((log) => (
                <div key={log._id} className="text-xs pb-3 border-b border-white/5 space-y-0.5">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-bold text-slate-200">{log.userName}</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-300">{log.details}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: CALENDAR VIEW
// =========================================================