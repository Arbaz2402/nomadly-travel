import { createPortal } from 'react-dom';
import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader2, Users, Check, AlertCircle, Percent, Hash, DollarSign, Split } from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../utils/formatters';

export const AddExpenseModal = ({ trip, isOpen, onClose, onCreated, expenseToEdit = null }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Consolidated list of trip participants
  const participants = useMemo(() => {
    const list = [];
    if (trip?.participants && trip.participants.length > 0) {
      trip.participants.forEach((p) => {
        list.push({
          userId: p.user?._id || p.user || null,
          name: p.name || 'Traveler',
          email: p.email || '',
        });
      });
    }
    return list;
  }, [trip]);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('food');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(trip?.currency || 'INR');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [paidByEmail, setPaidByEmail] = useState('');

  // Split State
  const [splitType, setSplitType] = useState('equal'); // 'equal', 'custom', 'percentage', 'shares'
  const [includedMembers, setIncludedMembers] = useState({}); // email/name -> boolean
  const [customAmounts, setCustomAmounts] = useState({}); // email/name -> number
  const [percentages, setPercentages] = useState({}); // email/name -> number
  const [shares, setShares] = useState({}); // email/name -> number

  // Initialize form when opening
  useEffect(() => {
    if (!isOpen) return;

    if (expenseToEdit) {
      setTitle(expenseToEdit.title || '');
      setCategory(expenseToEdit.category || 'food');
      setAmount(expenseToEdit.amount !== undefined ? String(expenseToEdit.amount) : '');
      setCurrency(expenseToEdit.currency || trip?.currency || 'INR');
      setDate(
        expenseToEdit.date
          ? new Date(expenseToEdit.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setDescription(expenseToEdit.description || '');
      setPaidByEmail(expenseToEdit.paidBy?.email || expenseToEdit.paidBy?.name || '');
      setSplitType(expenseToEdit.splitType || 'equal');

      // Populate splits
      const inc = {};
      const ams = {};
      const pers = {};
      const shs = {};

      participants.forEach((p) => {
        const key = (p.email || p.name).toLowerCase();
        inc[key] = false;
        ams[key] = '';
        pers[key] = '';
        shs[key] = 1;
      });

      if (expenseToEdit.splits && expenseToEdit.splits.length > 0) {
        expenseToEdit.splits.forEach((s) => {
          const key = (s.email || s.name).toLowerCase();
          inc[key] = true;
          ams[key] = s.shareAmount || '';
          pers[key] = s.sharePercentage || '';
          shs[key] = 1;
        });
      } else {
        // default all included
        participants.forEach((p) => {
          const key = (p.email || p.name).toLowerCase();
          inc[key] = true;
        });
      }

      setIncludedMembers(inc);
      setCustomAmounts(ams);
      setPercentages(pers);
      setShares(shs);
    } else {
      // Default blank new expense
      setTitle('');
      setCategory('food');
      setAmount('');
      setCurrency(trip?.currency || 'INR');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setPaidByEmail(participants[0]?.email || participants[0]?.name || '');
      setSplitType('equal');

      const inc = {};
      const ams = {};
      const pers = {};
      const shs = {};

      participants.forEach((p) => {
        const key = (p.email || p.name).toLowerCase();
        inc[key] = true; // All included by default
        ams[key] = '';
        pers[key] = '';
        shs[key] = 1;
      });

      setIncludedMembers(inc);
      setCustomAmounts(ams);
      setPercentages(pers);
      setShares(shs);
    }
  }, [isOpen, expenseToEdit, trip, participants]);

  if (!isOpen) return null;

  // Helpers for included participants
  const includedCount = participants.filter((p) => {
    const key = (p.email || p.name).toLowerCase();
    return includedMembers[key];
  }).length;

  const toggleIncludeMember = (key) => {
    setIncludedMembers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const selectAll = () => {
    const next = {};
    participants.forEach((p) => {
      next[(p.email || p.name).toLowerCase()] = true;
    });
    setIncludedMembers(next);
  };

  const deselectAll = () => {
    const next = {};
    participants.forEach((p) => {
      next[(p.email || p.name).toLowerCase()] = false;
    });
    setIncludedMembers(next);
  };

  // Computations for validation & preview
  const numAmount = Number(amount) || 0;

  // Equal split per person
  const equalSharePerPerson = includedCount > 0 ? Number((numAmount / includedCount).toFixed(2)) : 0;

  // Custom amounts sum & remaining
  const customSum = participants.reduce((sum, p) => {
    const key = (p.email || p.name).toLowerCase();
    if (!includedMembers[key]) return sum;
    return sum + (Number(customAmounts[key]) || 0);
  }, 0);
  const customRemaining = Number((numAmount - customSum).toFixed(2));

  // Percentages sum & remaining
  const percentageSum = participants.reduce((sum, p) => {
    const key = (p.email || p.name).toLowerCase();
    if (!includedMembers[key]) return sum;
    return sum + (Number(percentages[key]) || 0);
  }, 0);
  const percentageRemaining = Number((100 - percentageSum).toFixed(1));

  // Shares sum
  const totalShares = participants.reduce((sum, p) => {
    const key = (p.email || p.name).toLowerCase();
    if (!includedMembers[key]) return sum;
    return sum + (Number(shares[key]) || 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Please enter an expense title', 'error');
      return;
    }
    if (!amount || numAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    if (includedCount === 0) {
      showToast('Please include at least one person in the split', 'error');
      return;
    }

    // Validate custom / percentage splits
    if (splitType === 'custom' && Math.abs(customRemaining) > 0.05) {
      showToast(`Exact split amounts must sum to ${formatCurrency(numAmount, currency)} (Remaining: ${formatCurrency(customRemaining, currency)})`, 'error');
      return;
    }
    if (splitType === 'percentage' && Math.abs(percentageRemaining) > 0.1) {
      showToast(`Percentages must sum to 100% (Current: ${percentageSum}%)`, 'error');
      return;
    }

    // Determine payer object
    const payerParticipant =
      participants.find((p) => (p.email || p.name).toLowerCase() === paidByEmail.toLowerCase()) ||
      participants[0] || {
        name: 'You',
        email: '',
      };

    // Build splits array
    let splits = [];
    if (splitType === 'equal') {
      const pct = Number((100 / includedCount).toFixed(1));
      splits = participants
        .filter((p) => includedMembers[(p.email || p.name).toLowerCase()])
        .map((p) => ({
          user: p.userId || null,
          name: p.name,
          email: p.email || '',
          shareAmount: equalSharePerPerson,
          sharePercentage: pct,
          isSettled: false,
        }));
    } else if (splitType === 'custom') {
      splits = participants
        .filter((p) => includedMembers[(p.email || p.name).toLowerCase()])
        .map((p) => {
          const key = (p.email || p.name).toLowerCase();
          const shAmount = Number(customAmounts[key]) || 0;
          return {
            user: p.userId || null,
            name: p.name,
            email: p.email || '',
            shareAmount: shAmount,
            sharePercentage: numAmount > 0 ? Number(((shAmount / numAmount) * 100).toFixed(1)) : 0,
            isSettled: false,
          };
        });
    } else if (splitType === 'percentage') {
      splits = participants
        .filter((p) => includedMembers[(p.email || p.name).toLowerCase()])
        .map((p) => {
          const key = (p.email || p.name).toLowerCase();
          const pct = Number(percentages[key]) || 0;
          const shAmount = Number(((pct / 100) * numAmount).toFixed(2));
          return {
            user: p.userId || null,
            name: p.name,
            email: p.email || '',
            shareAmount: shAmount,
            sharePercentage: pct,
            isSettled: false,
          };
        });
    } else if (splitType === 'shares') {
      splits = participants
        .filter((p) => includedMembers[(p.email || p.name).toLowerCase()])
        .map((p) => {
          const key = (p.email || p.name).toLowerCase();
          const sh = Number(shares[key]) || 1;
          const pct = totalShares > 0 ? Number(((sh / totalShares) * 100).toFixed(1)) : 0;
          const shAmount = totalShares > 0 ? Number(((sh / totalShares) * numAmount).toFixed(2)) : 0;
          return {
            user: p.userId || null,
            name: p.name,
            email: p.email || '',
            shareAmount: shAmount,
            sharePercentage: pct,
            isSettled: false,
          };
        });
    }

    const payload = {
      title: title.trim(),
      category,
      amount: numAmount,
      currency,
      date,
      description,
      paidBy: {
        userId: payerParticipant.userId || null,
        name: payerParticipant.name,
        email: payerParticipant.email,
      },
      splitType,
      splits,
    };

    try {
      setLoading(true);
      if (expenseToEdit) {
        const res = await ApiClient.updateTripExpense(trip._id, expenseToEdit._id, payload);
        if (res.success) {
          showToast('Expense updated successfully!', 'success');
          onCreated();
          onClose();
        }
      } else {
        const res = await ApiClient.createTripExpense(trip._id, payload);
        if (res.success) {
          showToast('Expense recorded successfully!', 'success');
          onCreated();
          onClose();
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-ink-950/85 backdrop-blur-md p-4 flex justify-center py-6 sm:py-12 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-ink-900 border border-white/10 shadow-2xl overflow-hidden m-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              {expenseToEdit ? 'Edit Trip Expense' : 'Record Trip Expense'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Splitwise-style splitting, participant inclusion, and custom debt division.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Expense Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Group Dinner, Taj Hotel, Snowboarding"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Total Amount *</label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                placeholder="25000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white font-semibold"
              >
                {['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'THB', 'JPY'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              >
                <option value="food">Food & Dining</option>
                <option value="flights">Flights</option>
                <option value="hotels">Hotels / Stays</option>
                <option value="trains">Trains</option>
                <option value="buses">Buses</option>
                <option value="local_transportation">Local Transit / Cabs</option>
                <option value="activities">Activities & Sightseeing</option>
                <option value="shopping">Shopping</option>
                <option value="insurance">Insurance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          {/* Paid By Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Paid By (Who Paid the Bill?)</span>
              <span className="text-[10px] text-coral-400 font-normal">Select the payer</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {participants.map((p, idx) => {
                const key = (p.email || p.name).toLowerCase();
                const isSelected = paidByEmail.toLowerCase() === key;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setPaidByEmail(key)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-coral-500/20 border-coral-500/50 text-white'
                        : 'bg-ink-950/80 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? 'bg-coral-500 text-white' : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {p.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold leading-tight truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{isSelected ? 'Payer' : 'Member'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Splitwise-Style Split Options */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Split className="w-4 h-4 text-coral-400" />
                  Split Options & Inclusion
                </label>
                <p className="text-[11px] text-slate-400">
                  Uncheck anyone you want to exclude from paying for this expense.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[10px] font-bold text-coral-400 hover:text-coral-300"
                >
                  Select All
                </button>
                <span className="text-slate-600 text-xs">•</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-300"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Split Mode Selector Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-ink-950 rounded-xl border border-white/5 mb-4">
              <button
                type="button"
                onClick={() => setSplitType('equal')}
                className={`py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  splitType === 'equal'
                    ? 'bg-ink-800 text-coral-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>=</span> Equally
              </button>
              <button
                type="button"
                onClick={() => setSplitType('custom')}
                className={`py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  splitType === 'custom'
                    ? 'bg-ink-800 text-coral-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>123</span> Exact (₹)
              </button>
              <button
                type="button"
                onClick={() => setSplitType('percentage')}
                className={`py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  splitType === 'percentage'
                    ? 'bg-ink-800 text-coral-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Percent className="w-3 h-3" /> Percentage
              </button>
              <button
                type="button"
                onClick={() => setSplitType('shares')}
                className={`py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                  splitType === 'shares'
                    ? 'bg-ink-800 text-coral-400 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Hash className="w-3 h-3" /> Shares
              </button>
            </div>

            {/* Status / Balance Bar for Split Methods */}
            {splitType === 'equal' && (
              <div className="p-3 rounded-xl bg-ink-950 border border-white/5 flex items-center justify-between text-xs text-slate-300 mb-3">
                <span>
                  Split among <strong className="text-white">{includedCount}</strong> included traveler(s)
                </span>
                <span className="font-mono font-bold text-coral-400">
                  {formatCurrency(equalSharePerPerson, currency)} / person
                </span>
              </div>
            )}

            {splitType === 'custom' && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs mb-3 ${
                  Math.abs(customRemaining) <= 0.05
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <span>
                  Sum: <strong>{formatCurrency(customSum, currency)}</strong> of {formatCurrency(numAmount, currency)}
                </span>
                <span className="font-bold">
                  {Math.abs(customRemaining) <= 0.05
                    ? '✓ Matches Total'
                    : `${formatCurrency(Math.abs(customRemaining), currency)} ${customRemaining > 0 ? 'left' : 'over'}`}
                </span>
              </div>
            )}

            {splitType === 'percentage' && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs mb-3 ${
                  Math.abs(percentageRemaining) <= 0.1
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <span>
                  Total: <strong>{percentageSum}%</strong> of 100%
                </span>
                <span className="font-bold">
                  {Math.abs(percentageRemaining) <= 0.1
                    ? '✓ 100% Reached'
                    : `${Math.abs(percentageRemaining)}% ${percentageRemaining > 0 ? 'left' : 'over'}`}
                </span>
              </div>
            )}

            {splitType === 'shares' && (
              <div className="p-3 rounded-xl bg-ink-950 border border-white/5 flex items-center justify-between text-xs text-slate-300 mb-3">
                <span>Total Shares: <strong>{totalShares}</strong></span>
                <span className="font-mono text-coral-400 font-bold">
                  {totalShares > 0 ? formatCurrency(numAmount / totalShares, currency) : 0} / share
                </span>
              </div>
            )}

            {/* Participant Breakdown List with Checkboxes and Custom Inputs */}
            <div className="space-y-2">
              {participants.map((p, idx) => {
                const key = (p.email || p.name).toLowerCase();
                const isIncluded = Boolean(includedMembers[key]);

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isIncluded
                        ? 'bg-ink-950 border-white/10'
                        : 'bg-ink-950/40 border-white/5 opacity-50'
                    }`}
                  >
                    {/* Checkbox & Member Info */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleIncludeMember(key)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isIncluded
                            ? 'bg-coral-500 border-coral-500 text-white'
                            : 'border-slate-600 bg-transparent'
                        }`}
                      >
                        {isIncluded && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="w-7 h-7 rounded-full bg-white/10 text-slate-200 font-bold text-xs flex items-center justify-center">
                        {p.name.charAt(0)}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
                          {p.email || 'Participant'}
                        </p>
                      </div>
                    </div>

                    {/* Split Input / Share Preview based on splitType */}
                    <div className="text-right">
                      {!isIncluded ? (
                        <span className="text-[10px] font-semibold text-slate-500 uppercase px-2 py-0.5 rounded-md bg-white/5">
                          Excluded
                        </span>
                      ) : splitType === 'equal' ? (
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {formatCurrency(equalSharePerPerson, currency)}
                        </span>
                      ) : splitType === 'custom' ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">{currency}</span>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="0"
                            value={customAmounts[key] ?? ''}
                            onChange={(e) =>
                              setCustomAmounts({
                                ...customAmounts,
                                [key]: e.target.value,
                              })
                            }
                            className="w-24 px-2 py-1 rounded-lg bg-ink-900 border border-white/15 text-xs text-white font-mono text-right font-bold"
                          />
                        </div>
                      ) : splitType === 'percentage' ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="any"
                            placeholder="0"
                            value={percentages[key] ?? ''}
                            onChange={(e) =>
                              setPercentages({
                                ...percentages,
                                [key]: e.target.value,
                              })
                            }
                            className="w-16 px-2 py-1 rounded-lg bg-ink-900 border border-white/15 text-xs text-white font-mono text-right font-bold"
                          />
                          <span className="text-xs text-slate-400">%</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-1">
                            ({formatCurrency((Number(percentages[key] || 0) / 100) * numAmount, currency)})
                          </span>
                        </div>
                      ) : splitType === 'shares' ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={shares[key] ?? 1}
                            onChange={(e) =>
                              setShares({
                                ...shares,
                                [key]: Math.max(1, parseInt(e.target.value) || 1),
                              })
                            }
                            className="w-16 px-2 py-1 rounded-lg bg-ink-900 border border-white/15 text-xs text-white font-mono text-right font-bold"
                          />
                          <span className="text-xs text-slate-400">share(s)</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-1">
                            (
                            {formatCurrency(
                              totalShares > 0
                                ? ((Number(shares[key] || 1)) / totalShares) * numAmount
                                : 0,
                              currency
                            )}
                            )
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Notes / Description (Optional)</label>
            <textarea
              rows="2"
              placeholder="e.g. Split food equally, excluded Shahbaz since he left early"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink-950 border border-white/10 text-xs text-white placeholder-slate-500"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-ink-800 text-slate-300 text-xs font-semibold hover:bg-ink-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-glow transition-all flex items-center gap-1.5"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Saving...' : expenseToEdit ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modal, document.body) : modal;
};
