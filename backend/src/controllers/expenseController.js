import { Trip } from '../models/Trip.js';
import { TripExpense } from '../models/TripExpense.js';
import { convertCurrency } from '../utils/currencyRates.js';
import { calculateTripSettlement } from '../utils/settlementCalculator.js';
import { logTripActivity as logActivity } from '../services/trip/tripService.js';

export const getTripExpenses = async (req, res) => {
  try {
    const trip = req.trip;
    const expenses = await TripExpense.find({ trip: trip._id }).sort({ date: -1, createdAt: -1 });

    const tripBudget = trip.budget?.totalBudget || 50000;
    const totalSpent = expenses.reduce((sum, exp) => sum + (exp.convertedAmount || exp.amount || 0), 0);
    const remainingBudget = Math.max(0, tripBudget - totalSpent);
    const utilization = tripBudget > 0 ? Number(((totalSpent / tripBudget) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      count: expenses.length,
      summary: {
        budget: Number(tripBudget.toFixed(2)),
        currency: trip.currency,
        totalSpent: Number(totalSpent.toFixed(2)),
        remainingBudget: Number(remainingBudget.toFixed(2)),
        utilizationPercentage: utilization,
      },
      data: expenses,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTripExpense = async (req, res) => {
  try {
    const trip = req.trip;

    const {
      title,
      category,
      amount,
      currency,
      date,
      description,
      paidBy,
      receiptUrl,
      itineraryItemId,
      splitType,
      splits,
      customExchangeRate,
    } = req.body;

    if (!title || amount === undefined || amount === null) {
      return res.status(400).json({ success: false, message: 'Expense title and amount are required.' });
    }

    const expenseCurrency = (currency || trip.currency || 'INR').toUpperCase();
    const numericAmount = Number(amount);

    // Multi-currency calculation
    const conversion = convertCurrency(
      numericAmount,
      expenseCurrency,
      trip.currency,
      customExchangeRate ? Number(customExchangeRate) : null
    );

    // Determine Payer
    const finalPaidBy = paidBy || {
      userId: req.user._id,
      name: req.user.displayName || 'You',
      email: req.user.email,
    };

    // Calculate Splits
    let calculatedSplits = [];
    if (Array.isArray(splits) && splits.length > 0) {
      calculatedSplits = splits;
    } else {
      // Auto equal split across trip participants
      const participants = trip.participants?.length > 0 ? trip.participants : [finalPaidBy];
      const perPersonShare = Number((conversion.convertedAmount / participants.length).toFixed(2));
      const percentageShare = Number((100 / participants.length).toFixed(1));

      calculatedSplits = participants.map((p) => ({
        user: p.user || null,
        name: p.name,
        email: p.email || '',
        shareAmount: perPersonShare,
        sharePercentage: percentageShare,
        isSettled: (p.email && p.email.toLowerCase() === finalPaidBy.email?.toLowerCase()),
      }));
    }

    const newExpense = await TripExpense.create({
      trip: trip._id,
      title: title.trim(),
      category: category || 'other',
      amount: numericAmount,
      currency: expenseCurrency,
      exchangeRate: conversion.exchangeRate,
      convertedAmount: conversion.convertedAmount,
      conversionTimestamp: conversion.conversionTimestamp,
      date: date ? new Date(date) : new Date(),
      description: description || '',
      paidBy: finalPaidBy,
      receiptUrl: receiptUrl || '',
      itineraryItemId: itineraryItemId || null,
      splitType: splitType || 'equal',
      splits: calculatedSplits,
    });

    await logActivity(
      trip._id,
      req.user,
      'ADDED_EXPENSE',
      `Recorded expense "${newExpense.title}" of ${expenseCurrency} ${numericAmount}`
    );

    return res.status(201).json({ success: true, data: newExpense });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTripExpense = async (req, res) => {
  try {
    const trip = req.trip;
    const expense = await TripExpense.findOne({ _id: req.params.expenseId, trip: trip._id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    const {
      title,
      category,
      amount,
      currency,
      date,
      description,
      paidBy,
      receiptUrl,
      splitType,
      splits,
      customExchangeRate,
    } = req.body;

    if (title !== undefined) expense.title = title.trim();
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (paidBy !== undefined) expense.paidBy = paidBy;
    if (receiptUrl !== undefined) expense.receiptUrl = receiptUrl;
    if (splitType !== undefined) expense.splitType = splitType;
    if (splits !== undefined) expense.splits = splits;
    if (date !== undefined) expense.date = new Date(date);

    // Re-evaluate multi-currency if amount or currency changed
    if (amount !== undefined || currency !== undefined || customExchangeRate !== undefined) {
      const numAmount = amount !== undefined ? Number(amount) : expense.amount;
      const cur = currency !== undefined ? currency.toUpperCase() : expense.currency;
      const conv = convertCurrency(
        numAmount,
        cur,
        trip.currency,
        customExchangeRate ? Number(customExchangeRate) : null
      );
      expense.amount = numAmount;
      expense.currency = cur;
      expense.exchangeRate = conv.exchangeRate;
      expense.convertedAmount = conv.convertedAmount;
      expense.conversionTimestamp = conv.conversionTimestamp;
    }

    await expense.save();

    await logActivity(trip._id, req.user, 'UPDATED_EXPENSE', `Updated expense "${expense.title}"`);

    return res.status(200).json({ success: true, data: expense });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTripExpense = async (req, res) => {
  try {
    const trip = req.trip;
    const expense = await TripExpense.findOneAndDelete({ _id: req.params.expenseId, trip: trip._id });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense record not found.' });
    }

    await logActivity(trip._id, req.user, 'DELETED_EXPENSE', `Deleted expense "${expense.title}"`);

    return res.status(200).json({ success: true, message: 'Expense record deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTripSettlement = async (req, res) => {
  try {
    const trip = req.trip;
    const expenses = await TripExpense.find({ trip: trip._id });

    const settlement = calculateTripSettlement(expenses, trip.participants || []);

    return res.status(200).json({
      success: true,
      currency: trip.currency,
      data: settlement,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const settleExpenseShare = async (req, res) => {
  try {
    const trip = req.trip;
    const { expenseId, splitIndex, isSettled } = req.body;

    const expense = await TripExpense.findOne({ _id: expenseId, trip: trip._id });
    if (!expense || !expense.splits[splitIndex]) {
      return res.status(404).json({ success: false, message: 'Expense or split entry not found.' });
    }

    expense.splits[splitIndex].isSettled = isSettled !== undefined ? isSettled : true;
    await expense.save();

    return res.status(200).json({ success: true, message: 'Settlement state updated.', data: expense });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. TRIP ANALYTICS & BUDGET
// ==========================================
