import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Plus,
  Share2,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Receipt,
  UserCheck,
  Split,
  Copy,
  Check,
  Mail
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { useToast } from '../../../context/ToastContext';
import { ApiClient } from '../../../services/api';

export const SplittingView = ({
  trip,
  settlement,
  expenses = { data: [] },
  onRefresh,
  onOpenAddExpense,
  onOpenEditExpense,
  onOpenSettleUp,
  onOpenNotifySettlement,
  canEdit = true,
}) => {
  const { showToast } = useToast();
  const [expandedMember, setExpandedMember] = useState(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const toggleExpandMember = (key) => {
    setExpandedMember(expandedMember === key ? null : key);
  };

  const handleCopySummary = () => {
    const lines = [
      `✈️ ${trip.title || 'Journey'} - Expense Splitting Summary`,
      `Total Group Spending: ${formatCurrency(settlement.totalSpent, trip.currency)}`,
      '',
      '📋 SUGGESTED SETTLEMENTS (Who Owes Whom):',
    ];

    if (settlement.settlementPlan?.length === 0) {
      lines.push('✓ All group debts are settled! No payments owed.');
    } else {
      settlement.settlementPlan?.forEach((s) => {
        lines.push(`• ${s.from} owes ${s.to}: ${formatCurrency(s.amount, trip.currency)}`);
      });
    }

    lines.push('', '💳 INDIVIDUAL BALANCES:');
    settlement.memberBalances?.forEach((m) => {
      const netStr =
        m.netBalance > 0
          ? `+${formatCurrency(m.netBalance, trip.currency)} (Gets back)`
          : m.netBalance < 0
          ? `${formatCurrency(m.netBalance, trip.currency)} (Owes)`
          : `Settled up`;
      lines.push(`• ${m.name}: Paid ${formatCurrency(m.totalPaid, trip.currency)} | Share ${formatCurrency(m.totalOwed, trip.currency)} | Net: ${netStr}`);
    });

    lines.push('', 'Shared via Nomadly Travel Platform');

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSummary(true);
    showToast('Settlement summary copied to clipboard! Ready to share on WhatsApp or Email.', 'success');
    setTimeout(() => setCopiedSummary(false), 3000);
  };

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

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-ink-900/60 p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white font-display">Who Owes Whom</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-coral-500/10 text-coral-400 border border-coral-500/20">
              Splitwise Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated debt minimization algorithm simplifies group payments into the fewest possible transactions.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleCopySummary}
            className="px-3.5 py-2 rounded-xl bg-ink-950 hover:bg-ink-800 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Copy settlement summary to share on WhatsApp"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
            {copiedSummary ? 'Copied!' : 'Share Summary'}
          </button>

          {canEdit && (
            <>
              <button
                onClick={() => onOpenSettleUp && onOpenSettleUp(null)}
                className="px-3.5 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-glow"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Settle Up
              </button>

              <button
                onClick={onOpenAddExpense}
                className="px-4 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Expense
              </button>
            </>
          )}
        </div>
      </div>

      {/* Suggested Settlement Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-coral-400">
            Suggested Settlement Transactions
          </h4>
          <span className="text-[11px] text-slate-400">
            {settlement.settlementPlan?.length || 0} transaction(s) to settle all debts
          </span>
        </div>

        {settlement.settlementPlan?.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-3xl border border-white/10 text-xs text-slate-400 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-teal-400" />
            <span className="text-slate-300 font-semibold">All expenses are fully settled!</span>
            <span>No one owes anyone money for this journey.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settlement.settlementPlan?.map((s, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-ink-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-white/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {s.from.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{s.from}</p>
                    <p className="text-[10px] text-rose-400 font-semibold">owes</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-coral-400 shrink-0" />
                  <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {s.to.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{s.to}</p>
                    <p className="text-[10px] text-teal-400 font-semibold">creditor</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <span className="text-base font-bold font-mono text-emerald-400 mr-1">
                    {formatCurrency(s.amount, trip.currency)}
                  </span>

                  {canEdit && s.fromEmail && (
                    <button
                      onClick={() =>
                        onOpenNotifySettlement &&
                        onOpenNotifySettlement({
                          from: s.from,
                          fromEmail: s.fromEmail,
                          to: s.to,
                          toEmail: s.toEmail,
                          amount: s.amount,
                        })
                      }
                      className="px-2.5 py-1.5 rounded-lg bg-coral-500/15 hover:bg-coral-500/25 text-coral-300 text-xs font-bold border border-coral-500/30 transition-all flex items-center gap-1"
                      title={`Send settlement reminder email to ${s.fromEmail}`}
                    >
                      <Mail className="w-3 h-3" /> Notify
                    </button>
                  )}

                  {canEdit && (
                    <button
                      onClick={() =>
                        onOpenSettleUp &&
                        onOpenSettleUp({
                          from: s.from,
                          fromEmail: s.fromEmail,
                          to: s.to,
                          toEmail: s.toEmail,
                          amount: s.amount,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-bold border border-teal-500/40 transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Settle
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Balances Table with Expandable Drilldown */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="p-4 bg-ink-950/80 border-b border-white/5 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
          <span>Individual Balances & Itemized Shares</span>
          <span className="text-[11px] font-normal text-slate-500 lowercase">Click row to view expense details</span>
        </div>

        <div className="divide-y divide-white/5">
          {settlement.memberBalances?.map((m, i) => {
            const key = (m.email || m.name).toLowerCase();
            const isExpanded = expandedMember === key;

            return (
              <div key={i} className="transition-colors">
                <div
                  onClick={() => toggleExpandMember(key)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs cursor-pointer hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        m.netBalance > 0
                          ? 'bg-teal-500/20 text-teal-300'
                          : m.netBalance < 0
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{m.name}</span>
                        {m.role && (
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-white/5 text-slate-400">
                            {m.role}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block">{m.email || 'Participant'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 font-mono">
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Paid</span>
                      <span className="text-slate-200 font-semibold">{formatCurrency(m.totalPaid, trip.currency)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Share</span>
                      <span className="text-slate-200 font-semibold">{formatCurrency(m.totalOwed, trip.currency)}</span>
                    </div>
                    <div className="text-right min-w-[90px]">
                      <span className="text-slate-400 text-[10px] block">Net</span>
                      <span
                        className={`font-bold block ${
                          m.netBalance > 0.01
                            ? 'text-teal-400'
                            : m.netBalance < -0.01
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {m.netBalance > 0.01 ? '+' : ''}
                        {formatCurrency(m.netBalance, trip.currency)}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Itemized Detail Accordion */}
                {isExpanded && (
                  <div className="px-6 py-4 bg-ink-950/60 border-t border-white/5 text-xs space-y-3 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Expenses Paid By This Member */}
                      <div className="p-3 rounded-2xl bg-ink-900 border border-white/5">
                        <h5 className="text-[11px] font-bold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5" /> Expenses Paid ({m.paidExpenses?.length || 0})
                        </h5>
                        {m.paidExpenses?.length === 0 ? (
                          <p className="text-[11px] text-slate-500 italic">No expenses paid by this member yet.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {m.paidExpenses?.map((pe, pIdx) => (
                              <div key={pIdx} className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-300 truncate">{pe.title}</span>
                                <span className="font-mono font-bold text-slate-200">
                                  {formatCurrency(pe.amount, trip.currency)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Expenses Shared By This Member */}
                      <div className="p-3 rounded-2xl bg-ink-900 border border-white/5">
                        <h5 className="text-[11px] font-bold text-coral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Split className="w-3.5 h-3.5" /> Shared / Consumed ({m.sharedExpenses?.length || 0})
                        </h5>
                        {m.sharedExpenses?.length === 0 ? (
                          <p className="text-[11px] text-slate-500 italic">No shared expense entries.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {m.sharedExpenses?.map((se, sIdx) => (
                              <div key={sIdx} className="flex items-center justify-between text-[11px]">
                                <div>
                                  <span className="text-slate-300 block leading-tight">{se.title}</span>
                                  <span className="text-[10px] text-slate-500">Paid by {se.paidByName}</span>
                                </div>
                                <span className="font-mono font-bold text-rose-400">
                                  {formatCurrency(se.shareAmount, trip.currency)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Group Expenses & Custom Splits Breakdown Table */}
      {expenses?.data?.length > 0 && (
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
          <div className="p-4 bg-ink-950/80 border-b border-white/5 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Expenses & Split Participants</span>
            <span className="text-[11px] font-normal text-slate-500">Edit any expense splits or participants</span>
          </div>

          <div className="divide-y divide-white/5">
            {expenses.data.map((exp) => {
              const isSettlement = exp.category === 'settlement';
              const includedCount = exp.splits?.filter((s) => Number(s.shareAmount) > 0).length || 0;

              return (
                <div
                  key={exp._id}
                  className="p-4 hover:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{exp.title}</span>
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                          isSettlement
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : 'bg-white/5 text-slate-300'
                        }`}
                      >
                        {isSettlement ? '🤝 Debt Settlement' : exp.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(exp.date)}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                      <span>
                        Paid by <strong className="text-slate-200">{exp.paidBy?.name}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        {isSettlement ? (
                          <span className="text-teal-400">Paid to {exp.splits?.[0]?.name}</span>
                        ) : (
                          <span>
                            Split: <strong className="text-slate-300">{exp.splitType || 'equal'}</strong> ({includedCount} traveler(s))
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Member split pills */}
                    {!isSettlement && exp.splits?.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {exp.splits.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-ink-950 border border-white/5 text-slate-300 font-mono"
                          >
                            {s.name}: {formatCurrency(s.shareAmount, trip.currency)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
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
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenEditExpense && onOpenEditExpense(exp)}
                          className="p-2 rounded-xl bg-ink-950 hover:bg-ink-800 border border-white/5 text-slate-400 hover:text-white transition-colors"
                          title="Edit expense & splits"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(exp._id, exp.title)}
                          className="p-2 rounded-xl bg-ink-950 hover:bg-rose-500/20 border border-white/5 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
