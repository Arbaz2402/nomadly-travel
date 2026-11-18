import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

export const SplittingView = ({ trip, settlement, onRefresh }) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-ink-900/60 p-5 rounded-2xl border border-white/5">
        <h3 className="text-base font-bold text-white font-display">Who Owes Whom</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Automated debt minimization algorithm simplifies group payments into the fewest possible transactions.
        </p>
      </div>

      {/* Simplified Debt Settlement Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-coral-400">
          Suggested Settlement Transactions
        </h4>

        {settlement.settlementPlan?.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-3xl border border-white/10 text-xs text-slate-400">
            All expenses are fully settled! No payments are owed.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settlement.settlementPlan.map((s, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center">
                    {s.from.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{s.from}</p>
                    <p className="text-[10px] text-slate-400">owes</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-coral-400" />
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center">
                    {s.to.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{s.to}</p>
                    <p className="text-[10px] text-slate-400">creditor</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {formatCurrency(s.amount, trip.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Balances Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-4 bg-ink-950/80 border-b border-white/5 text-xs text-slate-400 font-bold uppercase tracking-wider">
          Individual Balances
        </div>
        <div className="divide-y divide-white/5">
          {settlement.memberBalances?.map((m, i) => (
            <div key={i} className="p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white">{m.name}</span>
                <span className="text-[11px] text-slate-400 block">{m.email || 'Participant'}</span>
              </div>
              <div className="flex items-center gap-6 text-right font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] block">Paid</span>
                  <span className="text-slate-200">{formatCurrency(m.totalPaid, trip.currency)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Share</span>
                  <span className="text-slate-200">{formatCurrency(m.totalOwed, trip.currency)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Net</span>
                  <span
                    className={`font-bold ${
                      m.netBalance > 0
                        ? 'text-teal-400'
                        : m.netBalance < 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {m.netBalance > 0 ? '+' : ''}
                    {formatCurrency(m.netBalance, trip.currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =========================================================
// SUB-COMPONENT: TRIP MAP VIEW
// =========================================================