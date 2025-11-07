/**
 * UK Tax Year and Quarter Utilities
 *
 * UK Tax Year runs from 6 April to 5 April
 * MTD ITSA requires quarterly updates on fixed dates
 */

import { format, parse, isWithinInterval, addDays } from 'date-fns';
import { TaxQuarter, QuarterPeriod } from './mtd-types';

// ============================================
// TAX YEAR HELPERS
// ============================================

/**
 * Get the UK tax year for a given date
 * @param date - Date to check (ISO string or Date object)
 * @returns Tax year string (e.g., "2025-26")
 */
export function getTaxYear(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed
  const day = d.getDate();

  // If before 6 April, tax year is (year-1)-(year)
  // If on or after 6 April, tax year is (year)-(year+1)
  if (month < 3 || (month === 3 && day < 6)) {
    // Before 6 April
    return `${year - 1}-${String(year).slice(-2)}`;
  } else {
    // On or after 6 April
    return `${year}-${String(year + 1).slice(-2)}`;
  }
}

/**
 * Get the current tax year
 * @returns Current tax year string
 */
export function getCurrentTaxYear(): string {
  return getTaxYear(new Date());
}

/**
 * Get tax year start and end dates
 * @param taxYear - Tax year string (e.g., "2025-26")
 * @returns Start and end dates
 */
export function getTaxYearDates(taxYear: string): {
  startDate: string;
  endDate: string;
} {
  const [startYearStr] = taxYear.split('-');
  const startYear = parseInt(startYearStr, 10);

  // Tax year starts on 6 April
  const startDate = `${startYear}-04-06`;

  // Tax year ends on 5 April next year
  const endDate = `${startYear + 1}-04-05`;

  return { startDate, endDate };
}

// ============================================
// QUARTER HELPERS
// ============================================

/**
 * Get the quarter for a given date
 * @param date - Date to check
 * @returns Quarter (Q1, Q2, Q3, Q4)
 */
export function getQuarter(date: string | Date): TaxQuarter {
  const d = typeof date === 'string' ? new Date(date) : date;
  const taxYear = getTaxYear(d);
  const quarters = getQuarterPeriods(taxYear);

  for (const quarter of quarters) {
    const start = new Date(quarter.startDate);
    const end = new Date(quarter.endDate);

    if (isWithinInterval(d, { start, end })) {
      return quarter.quarter;
    }
  }

  // Fallback (shouldn't happen)
  return 'Q1';
}

/**
 * Get all quarter periods for a tax year
 * @param taxYear - Tax year string
 * @returns Array of quarter periods
 */
export function getQuarterPeriods(taxYear: string): QuarterPeriod[] {
  const [startYearStr] = taxYear.split('-');
  const startYear = parseInt(startYearStr, 10);

  return [
    {
      quarter: 'Q1',
      taxYear,
      startDate: `${startYear}-04-06`,
      endDate: `${startYear}-07-05`,
      dueDate: `${startYear}-08-07`,
    },
    {
      quarter: 'Q2',
      taxYear,
      startDate: `${startYear}-07-06`,
      endDate: `${startYear}-10-05`,
      dueDate: `${startYear}-11-07`,
    },
    {
      quarter: 'Q3',
      taxYear,
      startDate: `${startYear}-10-06`,
      endDate: `${startYear + 1}-01-05`,
      dueDate: `${startYear + 1}-02-07`,
    },
    {
      quarter: 'Q4',
      taxYear,
      startDate: `${startYear + 1}-01-06`,
      endDate: `${startYear + 1}-04-05`,
      dueDate: `${startYear + 1}-05-07`,
    },
  ];
}

/**
 * Get quarter period details
 * @param quarter - Quarter (Q1, Q2, Q3, Q4)
 * @param taxYear - Tax year string
 * @returns Quarter period details
 */
export function getQuarterPeriod(
  quarter: TaxQuarter,
  taxYear: string
): QuarterPeriod {
  const quarters = getQuarterPeriods(taxYear);
  const period = quarters.find((q) => q.quarter === quarter);

  if (!period) {
    throw new Error(`Invalid quarter: ${quarter}`);
  }

  return period;
}

/**
 * Check if a date is within a quarter
 * @param date - Date to check
 * @param quarter - Quarter to check against
 * @param taxYear - Tax year
 * @returns True if date is in quarter
 */
export function isDateInQuarter(
  date: string | Date,
  quarter: TaxQuarter,
  taxYear: string
): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const period = getQuarterPeriod(quarter, taxYear);

  const start = new Date(period.startDate);
  const end = new Date(period.endDate);

  return isWithinInterval(d, { start, end });
}

/**
 * Get the current quarter
 * @returns Current quarter
 */
export function getCurrentQuarter(): {
  quarter: TaxQuarter;
  taxYear: string;
} {
  const now = new Date();
  const taxYear = getTaxYear(now);
  const quarter = getQuarter(now);

  return { quarter, taxYear };
}

/**
 * Check if a quarterly update is overdue
 * @param quarter - Quarter to check
 * @param taxYear - Tax year
 * @returns True if overdue
 */
export function isQuarterOverdue(
  quarter: TaxQuarter,
  taxYear: string
): boolean {
  const period = getQuarterPeriod(quarter, taxYear);
  const dueDate = new Date(period.dueDate);
  const now = new Date();

  return now > dueDate;
}

/**
 * Get days remaining until quarterly submission due
 * @param quarter - Quarter
 * @param taxYear - Tax year
 * @returns Days remaining (negative if overdue)
 */
export function getDaysUntilDue(
  quarter: TaxQuarter,
  taxYear: string
): number {
  const period = getQuarterPeriod(quarter, taxYear);
  const dueDate = new Date(period.dueDate);
  const now = new Date();

  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Format quarter for display
 * @param quarter - Quarter
 * @param taxYear - Tax year
 * @returns Formatted string (e.g., "Q1 2025-26 (6 Apr - 5 Jul 2025)")
 */
export function formatQuarter(quarter: TaxQuarter, taxYear: string): string {
  const period = getQuarterPeriod(quarter, taxYear);
  const startDate = format(new Date(period.startDate), 'd MMM');
  const endDate = format(new Date(period.endDate), 'd MMM yyyy');

  return `${quarter} ${taxYear} (${startDate} - ${endDate})`;
}

/**
 * Format due date for display
 * @param quarter - Quarter
 * @param taxYear - Tax year
 * @returns Formatted string (e.g., "Due: 7 August 2025")
 */
export function formatDueDate(quarter: TaxQuarter, taxYear: string): string {
  const period = getQuarterPeriod(quarter, taxYear);
  return `Due: ${format(new Date(period.dueDate), 'd MMMM yyyy')}`;
}

// ============================================
// FINAL DECLARATION
// ============================================

/**
 * Get final declaration due date for a tax year
 * Final declaration is due 31 January following the tax year end
 * @param taxYear - Tax year string
 * @returns Due date (ISO string)
 */
export function getFinalDeclarationDueDate(taxYear: string): string {
  const [startYearStr] = taxYear.split('-');
  const startYear = parseInt(startYearStr, 10);

  // Final declaration due 31 January after tax year end
  // Tax year ends 5 April, so due date is 31 January next year
  return `${startYear + 2}-01-31`;
}

/**
 * Check if final declaration is overdue
 * @param taxYear - Tax year
 * @returns True if overdue
 */
export function isFinalDeclarationOverdue(taxYear: string): boolean {
  const dueDate = new Date(getFinalDeclarationDueDate(taxYear));
  const now = new Date();

  return now > dueDate;
}
