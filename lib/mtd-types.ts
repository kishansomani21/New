/**
 * MTD ITSA (Making Tax Digital for Income Tax Self Assessment)
 * TypeScript Type Definitions
 *
 * These types align with HMRC's MTD ITSA requirements for digital record keeping
 * and quarterly submissions.
 */

// ============================================
// TRANSACTION TYPES
// ============================================

export type TransactionType = 'INCOME' | 'EXPENSE';

export type IncomeCategory =
  | 'SELF_EMPLOYMENT_INCOME'           // Trading income from self-employment
  | 'PROPERTY_RENTAL_INCOME'           // UK property rental income
  | 'OTHER_BUSINESS_INCOME';           // Other business income

export type ExpenseCategory =
  // Self-Employment Expenses
  | 'COST_OF_GOODS_SOLD'               // Stock, raw materials
  | 'WAGES_SALARIES'                   // Employee costs
  | 'CAR_VAN_TRAVEL'                   // Motor expenses
  | 'RENT_RATES_POWER'                 // Premises costs
  | 'PHONE_INTERNET_STATIONERY'        // Office costs
  | 'REPAIRS_RENEWALS'                 // Repairs (not improvements)
  | 'ACCOUNTANCY_LEGAL'                // Professional fees
  | 'INSURANCE'                        // Business insurance
  | 'BANK_CHARGES_INTEREST'            // Financial costs
  | 'ADVERTISING_MARKETING'            // Marketing costs
  | 'DEPRECIATION'                     // Capital allowances
  | 'OTHER_EXPENSES'                   // Other allowable expenses

  // Property Rental Expenses
  | 'PROPERTY_AGENT_FEES'              // Letting agent fees
  | 'PROPERTY_LEGAL_FEES'              // Legal costs for letting
  | 'PROPERTY_ACCOUNTANCY'             // Accountant fees
  | 'PROPERTY_MANAGEMENT'              // Property management
  | 'PROPERTY_MAINTENANCE'             // Repairs and maintenance
  | 'PROPERTY_INSURANCE'               // Buildings/contents insurance
  | 'PROPERTY_RATES'                   // Council tax, water rates
  | 'PROPERTY_UTILITIES'               // Gas, electricity (if paid by landlord)
  | 'PROPERTY_MORTGAGE_INTEREST'       // Mortgage interest (tax relief)
  | 'PROPERTY_GROUND_RENT'             // Ground rent, service charges
  | 'PROPERTY_OTHER';                  // Other property expenses

// ============================================
// TRANSACTION RECORD
// ============================================

export interface Transaction {
  id: string;                          // Unique transaction ID
  date: string;                        // ISO 8601 date (YYYY-MM-DD)
  amount: number;                      // Amount in GBP (positive for income, positive for expenses)
  description: string;                 // Transaction description
  type: TransactionType;               // INCOME or EXPENSE
  category: IncomeCategory | ExpenseCategory; // HMRC-compliant category
  businessPurpose?: string;            // Explanation of business purpose
  vatAmount?: number;                  // VAT amount if applicable
  extractedFrom: string;               // Source document reference
  confidence: number;                  // AI confidence score (0-1)
}

// ============================================
// TAX QUARTERS (UK Tax Year: 6 April - 5 April)
// ============================================

export type TaxQuarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface QuarterPeriod {
  quarter: TaxQuarter;
  taxYear: string;                     // e.g., "2025-26"
  startDate: string;                   // ISO 8601 date
  endDate: string;                     // ISO 8601 date
  dueDate: string;                     // Submission due date
}

// Q1: 6 April - 5 July (Due: 7 August)
// Q2: 6 July - 5 October (Due: 7 November)
// Q3: 6 October - 5 January (Due: 7 February)
// Q4: 6 January - 5 April (Due: 7 May)

// ============================================
// QUARTERLY SUMMARY (Cumulative)
// ============================================

export interface QuarterlySummary {
  quarter: TaxQuarter;
  taxYear: string;
  period: QuarterPeriod;

  // Income totals
  totalIncome: number;
  incomeBreakdown: {
    selfEmploymentIncome: number;
    propertyRentalIncome: number;
    otherBusinessIncome: number;
  };

  // Expense totals
  totalExpenses: number;
  expenseBreakdown: Record<ExpenseCategory, number>;

  // Net position
  profit: number;                      // totalIncome - totalExpenses

  // Transaction count
  transactionCount: number;

  // Cumulative (year-to-date)
  cumulativeIncome: number;
  cumulativeExpenses: number;
  cumulativeProfit: number;
}

// ============================================
// TAX CALCULATION
// ============================================

export interface TaxCalculation {
  taxYear: string;

  // Income
  totalIncome: number;
  personalAllowance: number;           // £12,570 for 2024-25
  taxableIncome: number;               // totalIncome - personalAllowance

  // Income Tax Bands (2024-25)
  basicRateTax: number;                // 20% on £12,571 - £50,270
  higherRateTax: number;               // 40% on £50,271 - £125,140
  additionalRateTax: number;           // 45% on £125,141+
  totalIncomeTax: number;

  // National Insurance (Class 4 for self-employed)
  class4NI: number;                    // 9% on profits £12,570 - £50,270, 2% above
  class2NI: number;                    // £3.45/week if profits > £12,570
  totalNI: number;

  // Total Tax Liability
  totalTax: number;                    // totalIncomeTax + totalNI

  // Effective rates
  effectiveTaxRate: number;            // percentage
  marginalTaxRate: number;             // percentage
}

// ============================================
// DOCUMENT RECORD
// ============================================

export interface DocumentRecord {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  uploadDate: string;                  // ISO 8601 timestamp
  quarter: TaxQuarter;
  taxYear: string;
  googleDriveFileId: string;           // Google Drive file ID
  googleDriveUrl: string;              // Shareable link
  extractedTransactions: Transaction[];
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

// ============================================
// USER SESSION
// ============================================

export interface UserSession {
  sessionId: string;
  createdAt: string;
  currentTaxYear: string;
  documents: DocumentRecord[];
  transactions: Transaction[];
  quarterlySummaries: QuarterlySummary[];
  taxCalculation?: TaxCalculation;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ExtractionResult {
  transactions: Transaction[];
  summary: {
    totalTransactions: number;
    totalIncome: number;
    totalExpenses: number;
    highConfidence: number;           // Count of transactions with confidence > 0.8
    lowConfidence: number;            // Count of transactions with confidence < 0.6
  };
  warnings: string[];
}
