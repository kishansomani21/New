/**
 * Quarterly Summary Calculator
 *
 * Calculates cumulative quarterly summaries for MTD ITSA compliance.
 * UK tax quarters run: Q1 (Apr-Jul), Q2 (Jul-Oct), Q3 (Oct-Jan), Q4 (Jan-Apr)
 */

import {
  Transaction,
  QuarterlySummary,
  TaxQuarter,
  ExpenseCategory,
} from './mtd-types';
import {
  getQuarterPeriods,
  getQuarterPeriod,
  isDateInQuarter,
} from './tax-periods';
import { getExpenseCategoryCodes } from './hmrc-categories';

// ============================================
// TRANSACTION FILTERING
// ============================================

/**
 * Filter transactions by quarter
 * @param transactions - All transactions
 * @param quarter - Quarter to filter
 * @param taxYear - Tax year
 * @returns Filtered transactions
 */
export function filterTransactionsByQuarter(
  transactions: Transaction[],
  quarter: TaxQuarter,
  taxYear: string
): Transaction[] {
  return transactions.filter((txn) =>
    isDateInQuarter(txn.date, quarter, taxYear)
  );
}

/**
 * Filter transactions up to and including a quarter (cumulative)
 * @param transactions - All transactions
 * @param quarter - Quarter (up to and including)
 * @param taxYear - Tax year
 * @returns Filtered transactions
 */
export function filterTransactionsUpToQuarter(
  transactions: Transaction[],
  quarter: TaxQuarter,
  taxYear: string
): Transaction[] {
  const quarters: TaxQuarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quarterIndex = quarters.indexOf(quarter);

  if (quarterIndex === -1) {
    throw new Error(`Invalid quarter: ${quarter}`);
  }

  const includeQuarters = quarters.slice(0, quarterIndex + 1);

  return transactions.filter((txn) => {
    for (const q of includeQuarters) {
      if (isDateInQuarter(txn.date, q, taxYear)) {
        return true;
      }
    }
    return false;
  });
}

// ============================================
// INCOME/EXPENSE AGGREGATION
// ============================================

/**
 * Calculate income breakdown
 * @param transactions - Transactions (filtered)
 * @returns Income breakdown
 */
function calculateIncomeBreakdown(transactions: Transaction[]): {
  selfEmploymentIncome: number;
  propertyRentalIncome: number;
  otherBusinessIncome: number;
  total: number;
} {
  let selfEmploymentIncome = 0;
  let propertyRentalIncome = 0;
  let otherBusinessIncome = 0;

  const incomeTransactions = transactions.filter((txn) => txn.type === 'INCOME');

  for (const txn of incomeTransactions) {
    switch (txn.category) {
      case 'SELF_EMPLOYMENT_INCOME':
        selfEmploymentIncome += txn.amount;
        break;
      case 'PROPERTY_RENTAL_INCOME':
        propertyRentalIncome += txn.amount;
        break;
      case 'OTHER_BUSINESS_INCOME':
        otherBusinessIncome += txn.amount;
        break;
    }
  }

  const total = selfEmploymentIncome + propertyRentalIncome + otherBusinessIncome;

  return {
    selfEmploymentIncome,
    propertyRentalIncome,
    otherBusinessIncome,
    total,
  };
}

/**
 * Calculate expense breakdown
 * @param transactions - Transactions (filtered)
 * @returns Expense breakdown by category
 */
function calculateExpenseBreakdown(
  transactions: Transaction[]
): Record<ExpenseCategory, number> {
  const breakdown: Record<ExpenseCategory, number> = {} as Record<
    ExpenseCategory,
    number
  >;

  // Initialize all categories to 0
  for (const category of getExpenseCategoryCodes()) {
    breakdown[category] = 0;
  }

  // Sum expenses by category
  const expenseTransactions = transactions.filter(
    (txn) => txn.type === 'EXPENSE'
  );

  for (const txn of expenseTransactions) {
    const category = txn.category as ExpenseCategory;
    breakdown[category] = (breakdown[category] || 0) + txn.amount;
  }

  return breakdown;
}

/**
 * Calculate total expenses
 * @param expenseBreakdown - Expense breakdown
 * @returns Total expenses
 */
function calculateTotalExpenses(
  expenseBreakdown: Record<ExpenseCategory, number>
): number {
  return Object.values(expenseBreakdown).reduce((sum, amount) => sum + amount, 0);
}

// ============================================
// QUARTERLY SUMMARY CALCULATION
// ============================================

/**
 * Calculate quarterly summary (non-cumulative, just this quarter)
 * @param transactions - All transactions for the tax year
 * @param quarter - Quarter to calculate
 * @param taxYear - Tax year
 * @returns Quarterly summary
 */
export function calculateQuarterSummary(
  transactions: Transaction[],
  quarter: TaxQuarter,
  taxYear: string
): QuarterlySummary {
  const period = getQuarterPeriod(quarter, taxYear);

  // Filter transactions for this quarter only
  const quarterTransactions = filterTransactionsByQuarter(
    transactions,
    quarter,
    taxYear
  );

  // Filter cumulative transactions (up to and including this quarter)
  const cumulativeTransactions = filterTransactionsUpToQuarter(
    transactions,
    quarter,
    taxYear
  );

  // Calculate quarter income
  const incomeBreakdown = calculateIncomeBreakdown(quarterTransactions);

  // Calculate quarter expenses
  const expenseBreakdown = calculateExpenseBreakdown(quarterTransactions);
  const totalExpenses = calculateTotalExpenses(expenseBreakdown);

  // Calculate cumulative totals
  const cumulativeIncome =
    calculateIncomeBreakdown(cumulativeTransactions).total;
  const cumulativeExpenses = calculateTotalExpenses(
    calculateExpenseBreakdown(cumulativeTransactions)
  );

  // Calculate profit
  const profit = incomeBreakdown.total - totalExpenses;
  const cumulativeProfit = cumulativeIncome - cumulativeExpenses;

  return {
    quarter,
    taxYear,
    period,
    totalIncome: incomeBreakdown.total,
    incomeBreakdown: {
      selfEmploymentIncome: incomeBreakdown.selfEmploymentIncome,
      propertyRentalIncome: incomeBreakdown.propertyRentalIncome,
      otherBusinessIncome: incomeBreakdown.otherBusinessIncome,
    },
    totalExpenses,
    expenseBreakdown,
    profit,
    transactionCount: quarterTransactions.length,
    cumulativeIncome,
    cumulativeExpenses,
    cumulativeProfit,
  };
}

/**
 * Calculate all quarterly summaries for a tax year
 * @param transactions - All transactions for the tax year
 * @param taxYear - Tax year
 * @returns Array of quarterly summaries
 */
export function calculateAllQuarterlySummaries(
  transactions: Transaction[],
  taxYear: string
): QuarterlySummary[] {
  const quarters: TaxQuarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

  return quarters.map((quarter) =>
    calculateQuarterSummary(transactions, quarter, taxYear)
  );
}

// ============================================
// SUMMARY VALIDATION
// ============================================

/**
 * Validate quarterly summary
 * @param summary - Quarterly summary
 * @returns Validation errors (empty if valid)
 */
export function validateQuarterlySummary(
  summary: QuarterlySummary
): string[] {
  const errors: string[] = [];

  // Check income total matches breakdown
  const incomeTotal =
    summary.incomeBreakdown.selfEmploymentIncome +
    summary.incomeBreakdown.propertyRentalIncome +
    summary.incomeBreakdown.otherBusinessIncome;

  if (Math.abs(incomeTotal - summary.totalIncome) > 0.01) {
    errors.push('Income breakdown does not match total income');
  }

  // Check expense total matches breakdown
  const expenseTotal = calculateTotalExpenses(summary.expenseBreakdown);

  if (Math.abs(expenseTotal - summary.totalExpenses) > 0.01) {
    errors.push('Expense breakdown does not match total expenses');
  }

  // Check profit calculation
  const calculatedProfit = summary.totalIncome - summary.totalExpenses;

  if (Math.abs(calculatedProfit - summary.profit) > 0.01) {
    errors.push('Profit calculation is incorrect');
  }

  // Check cumulative profit
  const calculatedCumulativeProfit =
    summary.cumulativeIncome - summary.cumulativeExpenses;

  if (Math.abs(calculatedCumulativeProfit - summary.cumulativeProfit) > 0.01) {
    errors.push('Cumulative profit calculation is incorrect');
  }

  return errors;
}

// ============================================
// FORMATTING HELPERS
// ============================================

/**
 * Format quarterly summary as text
 * @param summary - Quarterly summary
 * @returns Formatted text
 */
export function formatQuarterlySummary(summary: QuarterlySummary): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  return `
${summary.quarter} ${summary.taxYear} (${summary.period.startDate} to ${summary.period.endDate})
Due: ${summary.period.dueDate}

QUARTER TOTALS:
Income: ${formatCurrency(summary.totalIncome)}
  - Self-Employment: ${formatCurrency(summary.incomeBreakdown.selfEmploymentIncome)}
  - Property Rental: ${formatCurrency(summary.incomeBreakdown.propertyRentalIncome)}
  - Other Business: ${formatCurrency(summary.incomeBreakdown.otherBusinessIncome)}

Expenses: ${formatCurrency(summary.totalExpenses)}

Profit: ${formatCurrency(summary.profit)}

CUMULATIVE (Year to Date):
Income: ${formatCurrency(summary.cumulativeIncome)}
Expenses: ${formatCurrency(summary.cumulativeExpenses)}
Profit: ${formatCurrency(summary.cumulativeProfit)}

Transactions: ${summary.transactionCount}
  `.trim();
}

/**
 * Get summary statistics for all quarters
 * @param summaries - Array of quarterly summaries
 * @returns Summary statistics
 */
export function getSummaryStatistics(summaries: QuarterlySummary[]): {
  totalIncome: number;
  totalExpenses: number;
  totalProfit: number;
  totalTransactions: number;
  quarterCount: number;
} {
  // Use Q4 cumulative totals (or last quarter available)
  const lastSummary = summaries[summaries.length - 1];

  return {
    totalIncome: lastSummary?.cumulativeIncome || 0,
    totalExpenses: lastSummary?.cumulativeExpenses || 0,
    totalProfit: lastSummary?.cumulativeProfit || 0,
    totalTransactions: summaries.reduce(
      (sum, s) => sum + s.transactionCount,
      0
    ),
    quarterCount: summaries.length,
  };
}
