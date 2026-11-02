/**
 * Expense Splitting & Debt Minimization Settlement Algorithm
 */

export const calculateTripSettlement = (expenses = [], participants = []) => {
  const memberBalances = {};

  // Initialize all known participants
  participants.forEach((p) => {
    const key = (p.email || p.name).toLowerCase();
    memberBalances[key] = {
      name: p.name,
      email: p.email || '',
      role: p.role,
      totalPaid: 0,
      totalOwed: 0,
      netBalance: 0,
    };
  });

  // Aggregate expenses
  let totalSpent = 0;

  expenses.forEach((expense) => {
    const cost = Number(expense.convertedAmount || expense.amount || 0);
    totalSpent += cost;

    // Credit payer
    const payerKey = (expense.paidBy?.email || expense.paidBy?.name || 'Unknown').toLowerCase();
    if (!memberBalances[payerKey]) {
      memberBalances[payerKey] = {
        name: expense.paidBy?.name || 'Unknown',
        email: expense.paidBy?.email || '',
        totalPaid: 0,
        totalOwed: 0,
        netBalance: 0,
      };
    }
    memberBalances[payerKey].totalPaid += cost;

    // Debit split participants
    if (expense.splits && expense.splits.length > 0) {
      expense.splits.forEach((split) => {
        if (split.isSettled) return; // Skip already settled splits

        const splitKey = (split.email || split.name || 'Unknown').toLowerCase();
        if (!memberBalances[splitKey]) {
          memberBalances[splitKey] = {
            name: split.name || 'Unknown',
            email: split.email || '',
            totalPaid: 0,
            totalOwed: 0,
            netBalance: 0,
          };
        }
        memberBalances[splitKey].totalOwed += Number(split.shareAmount || 0);
      });
    } else {
      // Default: payer paid for themselves, no splits recorded
      memberBalances[payerKey].totalOwed += cost;
    }
  });

  // Calculate net balances (paid - owed)
  // Positive = is owed money (creditor), Negative = owes money (debtor)
  const balancesList = Object.values(memberBalances).map((member) => {
    const net = Number((member.totalPaid - member.totalOwed).toFixed(2));
    return {
      ...member,
      totalPaid: Number(member.totalPaid.toFixed(2)),
      totalOwed: Number(member.totalOwed.toFixed(2)),
      netBalance: net,
    };
  });

  // Debt Minimization Algorithm (Cash Flow Simplification)
  const debtors = [];
  const creditors = [];

  balancesList.forEach((member) => {
    if (member.netBalance < -0.01) {
      debtors.push({ name: member.name, email: member.email, amount: Math.abs(member.netBalance) });
    } else if (member.netBalance > 0.01) {
      creditors.push({ name: member.name, email: member.email, amount: member.netBalance });
    }
  });

  // Sort descending
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlementPlan = [];
  let dIndex = 0;
  let cIndex = 0;

  while (dIndex < debtors.length && cIndex < creditors.length) {
    const debtor = debtors[dIndex];
    const creditor = creditors[cIndex];

    const paymentAmount = Math.min(debtor.amount, creditor.amount);
    if (paymentAmount > 0.01) {
      settlementPlan.push({
        from: debtor.name,
        fromEmail: debtor.email,
        to: creditor.name,
        toEmail: creditor.email,
        amount: Number(paymentAmount.toFixed(2)),
      });
    }

    debtor.amount -= paymentAmount;
    creditor.amount -= paymentAmount;

    if (debtor.amount <= 0.01) dIndex++;
    if (creditor.amount <= 0.01) cIndex++;
  }

  return {
    totalSpent: Number(totalSpent.toFixed(2)),
    memberBalances: balancesList,
    settlementPlan,
  };
};

