/**
 * Expense Splitting & Debt Minimization Settlement Algorithm
 */

export const calculateTripSettlement = (expenses = [], participants = []) => {
  const memberBalances = {};

  // Initialize all known active participants
  const hasExplicitParticipants = Array.isArray(participants) && participants.length > 0;
  participants.forEach((p) => {
    const key = (p.email || p.name).toLowerCase();
    memberBalances[key] = {
      name: p.name,
      email: p.email || '',
      role: p.role,
      totalPaid: 0,
      totalOwed: 0,
      netBalance: 0,
      paidExpenses: [],
      sharedExpenses: [],
    };
  });

  // Aggregate expenses
  let totalSpent = 0;

  expenses.forEach((expense) => {
    const cost = Number(expense.convertedAmount || expense.amount || 0);
    
    // Settlement payments transfer money between members without counting as trip spending
    if (expense.category !== 'settlement') {
      totalSpent += cost;
    }

    // Credit payer
    const payerKey = (expense.paidBy?.email || expense.paidBy?.name || 'Unknown').toLowerCase();
    if (!memberBalances[payerKey]) {
      if (hasExplicitParticipants) {
        // Ignore removed/pending payers if we have an active participant list
      } else {
        memberBalances[payerKey] = {
          name: expense.paidBy?.name || 'Unknown',
          email: expense.paidBy?.email || '',
          totalPaid: 0,
          totalOwed: 0,
          netBalance: 0,
          paidExpenses: [],
          sharedExpenses: [],
        };
      }
    }
    if (memberBalances[payerKey]) {
      memberBalances[payerKey].totalPaid += cost;
      memberBalances[payerKey].paidExpenses.push({
        id: expense._id,
        title: expense.title,
        category: expense.category,
        amount: cost,
        date: expense.date,
      });
    }

    // Debit split participants
    if (expense.splits && expense.splits.length > 0) {
      expense.splits.forEach((split) => {
        const splitKey = (split.email || split.name || 'Unknown').toLowerCase();
        if (!memberBalances[splitKey]) {
          if (hasExplicitParticipants) {
            // Skip removed or pending invitees who are not active collaborators
            return;
          }
          memberBalances[splitKey] = {
            name: split.name || 'Unknown',
            email: split.email || '',
            totalPaid: 0,
            totalOwed: 0,
            netBalance: 0,
            paidExpenses: [],
            sharedExpenses: [],
          };
        }
        const share = Number(split.shareAmount || 0);
        memberBalances[splitKey].totalOwed += share;
        memberBalances[splitKey].sharedExpenses.push({
          id: expense._id,
          title: expense.title,
          category: expense.category,
          shareAmount: share,
          totalAmount: cost,
          paidByName: expense.paidBy?.name || 'Unknown',
          date: expense.date,
        });
      });
    } else if (memberBalances[payerKey]) {
      // Default: payer paid for themselves, no splits recorded
      memberBalances[payerKey].totalOwed += cost;
      memberBalances[payerKey].sharedExpenses.push({
        id: expense._id,
        title: expense.title,
        category: expense.category,
        shareAmount: cost,
        totalAmount: cost,
        paidByName: expense.paidBy?.name || 'Unknown',
        date: expense.date,
      });
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

