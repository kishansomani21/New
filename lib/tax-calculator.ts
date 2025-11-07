/**
 * UK Tax Calculator
 *
 * Calculates Income Tax and National Insurance for self-employed individuals
 * and landlords according to HMRC rules.
 *
 * Tax rates accurate for 2024-25 and 2025-26 tax years.
 */

import { TaxCalculation, Transaction } from './mtd-types';

// ============================================
// TAX RATES AND THRESHOLDS (2024-25 / 2025-26)
// ============================================

export interface TaxRates {
  // Personal Allowance
  personalAllowance: number; // £12,570

  // Income Tax Bands
  basicRateThreshold: number; // £50,270
  higherRateThreshold: number; // £125,140
  basicRate: number; // 20%
  higherRate: number; // 40%
  additionalRate: number; // 45%

  // National Insurance (Class 4 - Self-Employed)
  class4LowerThreshold: number; // £12,570
  class4UpperThreshold: number; // £50,270
  class4LowerRate: number; // 9%
  class4UpperRate: number; // 2%

  // National Insurance (Class 2 - Self-Employed)
  class2Threshold: number; // £12,570
  class2WeeklyRate: number; // £3.45 per week
}

// Current tax rates (2024-25 and 2025-26)
export const CURRENT_TAX_RATES: TaxRates = {
  personalAllowance: 12570,
  basicRateThreshold: 50270,
  higherRateThreshold: 125140,
  basicRate: 0.2,
  higherRate: 0.4,
  additionalRate: 0.45,
  class4LowerThreshold: 12570,
  class4UpperThreshold: 50270,
  class4LowerRate: 0.09,
  class4UpperRate: 0.02,
  class2Threshold: 12570,
  class2WeeklyRate: 3.45,
};

// ============================================
// INCOME TAX CALCULATION
// ============================================

/**
 * Calculate Income Tax based on taxable income
 * @param grossIncome - Total income before tax
 * @param rates - Tax rates to use
 * @returns Tax breakdown
 */
export function calculateIncomeTax(
  grossIncome: number,
  rates: TaxRates = CURRENT_TAX_RATES
): {
  personalAllowance: number;
  taxableIncome: number;
  basicRateTax: number;
  higherRateTax: number;
  additionalRateTax: number;
  totalIncomeTax: number;
} {
  // Personal allowance is reduced by £1 for every £2 over £100,000
  let personalAllowance = rates.personalAllowance;
  if (grossIncome > 100000) {
    const reduction = Math.floor((grossIncome - 100000) / 2);
    personalAllowance = Math.max(0, personalAllowance - reduction);
  }

  // Taxable income after personal allowance
  const taxableIncome = Math.max(0, grossIncome - personalAllowance);

  let basicRateTax = 0;
  let higherRateTax = 0;
  let additionalRateTax = 0;

  if (taxableIncome <= 0) {
    // No tax
  } else if (taxableIncome <= rates.basicRateThreshold) {
    // All in basic rate band (20%)
    basicRateTax = taxableIncome * rates.basicRate;
  } else if (taxableIncome <= rates.higherRateThreshold) {
    // Basic rate + higher rate
    basicRateTax = rates.basicRateThreshold * rates.basicRate;
    higherRateTax = (taxableIncome - rates.basicRateThreshold) * rates.higherRate;
  } else {
    // All three bands
    basicRateTax = rates.basicRateThreshold * rates.basicRate;
    higherRateTax =
      (rates.higherRateThreshold - rates.basicRateThreshold) * rates.higherRate;
    additionalRateTax =
      (taxableIncome - rates.higherRateThreshold) * rates.additionalRate;
  }

  const totalIncomeTax = basicRateTax + higherRateTax + additionalRateTax;

  return {
    personalAllowance,
    taxableIncome,
    basicRateTax,
    higherRateTax,
    additionalRateTax,
    totalIncomeTax,
  };
}

// ============================================
// NATIONAL INSURANCE CALCULATION
// ============================================

/**
 * Calculate Class 2 and Class 4 National Insurance
 * @param profit - Annual profit (income - expenses)
 * @param rates - Tax rates to use
 * @returns NI breakdown
 */
export function calculateNationalInsurance(
  profit: number,
  rates: TaxRates = CURRENT_TAX_RATES
): {
  class2NI: number;
  class4NI: number;
  totalNI: number;
} {
  // Class 2 NI: £3.45/week if profits > £12,570
  // 52 weeks per year
  const class2NI =
    profit > rates.class2Threshold ? rates.class2WeeklyRate * 52 : 0;

  // Class 4 NI: 9% on profits £12,570 - £50,270, 2% above
  let class4NI = 0;

  if (profit <= rates.class4LowerThreshold) {
    // No Class 4 NI
    class4NI = 0;
  } else if (profit <= rates.class4UpperThreshold) {
    // 9% on profits above £12,570
    class4NI = (profit - rates.class4LowerThreshold) * rates.class4LowerRate;
  } else {
    // 9% on £12,570 - £50,270, then 2% above
    const lowerBandNI =
      (rates.class4UpperThreshold - rates.class4LowerThreshold) *
      rates.class4LowerRate;
    const upperBandNI = (profit - rates.class4UpperThreshold) * rates.class4UpperRate;
    class4NI = lowerBandNI + upperBandNI;
  }

  const totalNI = class2NI + class4NI;

  return {
    class2NI,
    class4NI,
    totalNI,
  };
}

// ============================================
// FULL TAX CALCULATION
// ============================================

/**
 * Calculate full tax liability (Income Tax + NI)
 * @param totalIncome - Total income
 * @param totalExpenses - Total allowable expenses
 * @param taxYear - Tax year string
 * @param rates - Tax rates to use (optional)
 * @returns Complete tax calculation
 */
export function calculateTax(
  totalIncome: number,
  totalExpenses: number,
  taxYear: string,
  rates: TaxRates = CURRENT_TAX_RATES
): TaxCalculation {
  // Profit = Income - Expenses
  const profit = totalIncome - totalExpenses;

  // Income Tax calculation
  const incomeTax = calculateIncomeTax(profit, rates);

  // National Insurance calculation
  const ni = calculateNationalInsurance(profit, rates);

  // Total tax liability
  const totalTax = incomeTax.totalIncomeTax + ni.totalNI;

  // Effective tax rate (total tax / total income)
  const effectiveTaxRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;

  // Marginal tax rate (tax on next £1 earned)
  let marginalTaxRate = 0;
  if (profit <= rates.class4LowerThreshold) {
    marginalTaxRate = 0; // Below personal allowance
  } else if (profit <= rates.basicRateThreshold) {
    marginalTaxRate = rates.basicRate * 100 + rates.class4LowerRate * 100; // 20% + 9% = 29%
  } else if (profit <= rates.higherRateThreshold) {
    marginalTaxRate = rates.higherRate * 100 + rates.class4UpperRate * 100; // 40% + 2% = 42%
  } else {
    marginalTaxRate = rates.additionalRate * 100 + rates.class4UpperRate * 100; // 45% + 2% = 47%
  }

  // Handle personal allowance taper (60% marginal rate between £100k-£125k)
  if (profit > 100000 && profit <= 100000 + rates.personalAllowance * 2) {
    marginalTaxRate = 60; // Effective 60% rate due to PA withdrawal
  }

  return {
    taxYear,
    totalIncome,
    personalAllowance: incomeTax.personalAllowance,
    taxableIncome: incomeTax.taxableIncome,
    basicRateTax: incomeTax.basicRateTax,
    higherRateTax: incomeTax.higherRateTax,
    additionalRateTax: incomeTax.additionalRateTax,
    totalIncomeTax: incomeTax.totalIncomeTax,
    class2NI: ni.class2NI,
    class4NI: ni.class4NI,
    totalNI: ni.totalNI,
    totalTax,
    effectiveTaxRate,
    marginalTaxRate,
  };
}

// ============================================
// TRANSACTION AGGREGATION
// ============================================

/**
 * Calculate totals from transactions
 * @param transactions - Array of transactions
 * @returns Income and expense totals
 */
export function aggregateTransactions(transactions: Transaction[]): {
  totalIncome: number;
  totalExpenses: number;
  profit: number;
} {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const transaction of transactions) {
    if (transaction.type === 'INCOME') {
      totalIncome += transaction.amount;
    } else if (transaction.type === 'EXPENSE') {
      totalExpenses += transaction.amount;
    }
  }

  const profit = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    profit,
  };
}

/**
 * Calculate tax from transactions
 * @param transactions - Array of transactions
 * @param taxYear - Tax year string
 * @returns Tax calculation
 */
export function calculateTaxFromTransactions(
  transactions: Transaction[],
  taxYear: string
): TaxCalculation {
  const { totalIncome, totalExpenses } = aggregateTransactions(transactions);
  return calculateTax(totalIncome, totalExpenses, taxYear);
}

// ============================================
// FORMATTING HELPERS
// ============================================

/**
 * Format currency (GBP)
 * @param amount - Amount to format
 * @returns Formatted string (e.g., "£12,570.00")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage
 * @param rate - Rate as decimal (e.g., 0.2 for 20%)
 * @returns Formatted string (e.g., "20.0%")
 */
export function formatPercentage(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

/**
 * Generate tax summary text
 * @param calculation - Tax calculation
 * @returns Human-readable summary
 */
export function generateTaxSummary(calculation: TaxCalculation): string {
  return `
Tax Year: ${calculation.taxYear}

Income: ${formatCurrency(calculation.totalIncome)}
Personal Allowance: ${formatCurrency(calculation.personalAllowance)}
Taxable Income: ${formatCurrency(calculation.taxableIncome)}

Income Tax:
  Basic Rate (20%): ${formatCurrency(calculation.basicRateTax)}
  Higher Rate (40%): ${formatCurrency(calculation.higherRateTax)}
  Additional Rate (45%): ${formatCurrency(calculation.additionalRateTax)}
  Total Income Tax: ${formatCurrency(calculation.totalIncomeTax)}

National Insurance:
  Class 2 NI: ${formatCurrency(calculation.class2NI)}
  Class 4 NI: ${formatCurrency(calculation.class4NI)}
  Total NI: ${formatCurrency(calculation.totalNI)}

Total Tax Liability: ${formatCurrency(calculation.totalTax)}

Effective Tax Rate: ${formatPercentage(calculation.effectiveTaxRate)}
Marginal Tax Rate: ${formatPercentage(calculation.marginalTaxRate)}
  `.trim();
}
