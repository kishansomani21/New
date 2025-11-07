/**
 * HMRC-Compliant Transaction Categorization System
 *
 * This module provides the categorization logic for MTD ITSA compliance.
 * All categories align with HMRC's allowable expense definitions.
 */

import { IncomeCategory, ExpenseCategory } from './mtd-types';

// ============================================
// CATEGORY DEFINITIONS
// ============================================

export interface CategoryDefinition {
  code: IncomeCategory | ExpenseCategory;
  label: string;
  description: string;
  examples: string[];
  hmrcGuidance: string;
  allowableConditions?: string[];
}

// ============================================
// INCOME CATEGORIES
// ============================================

export const INCOME_CATEGORIES: Record<IncomeCategory, CategoryDefinition> = {
  SELF_EMPLOYMENT_INCOME: {
    code: 'SELF_EMPLOYMENT_INCOME',
    label: 'Self-Employment Income',
    description: 'Trading income from your self-employment business',
    examples: [
      'Sales receipts',
      'Service income',
      'Consulting fees',
      'Freelance income',
      'Trading receipts',
    ],
    hmrcGuidance:
      'All income from your trade, profession or vocation must be reported',
  },

  PROPERTY_RENTAL_INCOME: {
    code: 'PROPERTY_RENTAL_INCOME',
    label: 'Property Rental Income',
    description: 'UK property rental income from tenants',
    examples: [
      'Monthly rent payments',
      'Quarterly rent',
      'Tenant payments',
      'Rental income',
    ],
    hmrcGuidance:
      'Include all rent received from UK residential and commercial properties',
  },

  OTHER_BUSINESS_INCOME: {
    code: 'OTHER_BUSINESS_INCOME',
    label: 'Other Business Income',
    description: 'Other business receipts and income',
    examples: [
      'Interest received',
      'Commission income',
      'Royalties',
      'Sundry income',
    ],
    hmrcGuidance:
      'Include any other income relating to your self-employment or property business',
  },
};

// ============================================
// EXPENSE CATEGORIES
// ============================================

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, CategoryDefinition> = {
  // Self-Employment Expenses
  COST_OF_GOODS_SOLD: {
    code: 'COST_OF_GOODS_SOLD',
    label: 'Cost of Goods Sold',
    description: 'Stock and raw materials for resale or used in goods produced',
    examples: [
      'Raw materials',
      'Stock purchases',
      'Wholesale goods',
      'Direct materials',
    ],
    hmrcGuidance:
      'Include the cost of goods bought for resale or raw materials used in production',
    allowableConditions: [
      'Must be used wholly and exclusively for business',
      'Stock and materials only, not capital items',
    ],
  },

  WAGES_SALARIES: {
    code: 'WAGES_SALARIES',
    label: 'Wages and Salaries',
    description: 'Employee wages, salaries, bonuses, pensions, and benefits',
    examples: [
      'Employee salaries',
      'PAYE payments',
      'Staff bonuses',
      'Employer pension contributions',
      'Employer NI contributions',
    ],
    hmrcGuidance:
      'Include all employee costs but not drawings or payments to yourself',
    allowableConditions: [
      'Cannot claim for your own wages or drawings',
      'Must have employees on payroll',
    ],
  },

  CAR_VAN_TRAVEL: {
    code: 'CAR_VAN_TRAVEL',
    label: 'Car, Van, and Travel Expenses',
    description: 'Motor expenses and business travel costs',
    examples: [
      'Fuel',
      'Vehicle insurance',
      'Vehicle repairs',
      'Road tax',
      'Parking',
      'Train/taxi fares',
    ],
    hmrcGuidance:
      'Include vehicle running costs or use simplified expenses (mileage rates)',
    allowableConditions: [
      'Only business mileage/use is allowable',
      'Cannot claim for home-to-work travel',
      'Keep mileage records for business journeys',
    ],
  },

  RENT_RATES_POWER: {
    code: 'RENT_RATES_POWER',
    label: 'Rent, Rates, Power and Insurance',
    description: 'Business premises rent, utilities, and council tax',
    examples: [
      'Office rent',
      'Business rates',
      'Electricity',
      'Gas',
      'Water',
    ],
    hmrcGuidance:
      'Include costs of business premises. If working from home, use simplified expenses',
    allowableConditions: [
      'Only business portion if mixed use',
      'Use flat rate for home working if applicable',
    ],
  },

  PHONE_INTERNET_STATIONERY: {
    code: 'PHONE_INTERNET_STATIONERY',
    label: 'Phone, Internet, and Stationery',
    description: 'Office costs including phone, internet, postage, and stationery',
    examples: [
      'Mobile phone bills',
      'Internet subscription',
      'Postage',
      'Stationery',
      'Printing',
    ],
    hmrcGuidance:
      'Include office running costs. Only business use portion if personal use',
    allowableConditions: ['Split costs if personal and business use'],
  },

  REPAIRS_RENEWALS: {
    code: 'REPAIRS_RENEWALS',
    label: 'Repairs and Renewals',
    description: 'Maintenance and repairs to business premises and equipment',
    examples: [
      'Equipment repairs',
      'Building repairs',
      'Maintenance costs',
      'Servicing',
    ],
    hmrcGuidance:
      'Include repairs and maintenance. Do NOT include improvements or initial renovations',
    allowableConditions: [
      'Must be repairs, not improvements',
      'Improvements are capital expenditure',
      'Restoring to original condition is allowable',
    ],
  },

  ACCOUNTANCY_LEGAL: {
    code: 'ACCOUNTANCY_LEGAL',
    label: 'Accountancy and Legal Fees',
    description: 'Professional fees for accountants, tax advisors, and legal services',
    examples: [
      'Accountancy fees',
      'Tax advisor fees',
      'Legal fees',
      'Professional subscriptions',
    ],
    hmrcGuidance:
      'Include fees for preparing accounts and tax returns, and business-related legal fees',
    allowableConditions: [
      'Must be for business purposes',
      'Cannot claim for personal tax advice',
    ],
  },

  INSURANCE: {
    code: 'INSURANCE',
    label: 'Business Insurance',
    description: 'Insurance for business assets, liability, and professional indemnity',
    examples: [
      'Professional indemnity insurance',
      'Public liability insurance',
      'Business equipment insurance',
      'Business interruption insurance',
    ],
    hmrcGuidance: 'Include all business insurance premiums',
    allowableConditions: ['Business use only, not personal insurance'],
  },

  BANK_CHARGES_INTEREST: {
    code: 'BANK_CHARGES_INTEREST',
    label: 'Bank Charges and Interest',
    description: 'Business bank charges, overdraft fees, and loan interest',
    examples: [
      'Business bank charges',
      'Business overdraft interest',
      'Business loan interest',
      'Credit card interest (business)',
    ],
    hmrcGuidance:
      'Include interest on business loans and bank charges on business accounts',
    allowableConditions: ['Must be for business borrowing'],
  },

  ADVERTISING_MARKETING: {
    code: 'ADVERTISING_MARKETING',
    label: 'Advertising and Marketing',
    description: 'Marketing, advertising, and promotional costs',
    examples: [
      'Google Ads',
      'Facebook advertising',
      'Website costs',
      'Business cards',
      'Promotional materials',
    ],
    hmrcGuidance: 'Include all costs of promoting your business',
  },

  DEPRECIATION: {
    code: 'DEPRECIATION',
    label: 'Capital Allowances (Depreciation)',
    description: 'Capital allowances on business equipment and vehicles',
    examples: [
      'Annual investment allowance',
      'Writing down allowance',
      'First-year allowances',
    ],
    hmrcGuidance:
      'Claim capital allowances instead of depreciation for tax purposes',
  },

  OTHER_EXPENSES: {
    code: 'OTHER_EXPENSES',
    label: 'Other Business Expenses',
    description: 'Other allowable business expenses',
    examples: [
      'Training courses',
      'Trade subscriptions',
      'Licenses',
      'Software subscriptions',
    ],
    hmrcGuidance: 'Include any other expenses wholly and exclusively for business',
    allowableConditions: ['Must be wholly and exclusively for business'],
  },

  // Property Rental Expenses
  PROPERTY_AGENT_FEES: {
    code: 'PROPERTY_AGENT_FEES',
    label: 'Letting Agent Fees',
    description: 'Fees paid to letting agents for managing properties',
    examples: [
      'Letting agent management fees',
      'Tenant finding fees',
      'Agent commission',
    ],
    hmrcGuidance: 'Include all fees paid to agents for letting your property',
  },

  PROPERTY_LEGAL_FEES: {
    code: 'PROPERTY_LEGAL_FEES',
    label: 'Property Legal Fees',
    description: 'Legal costs for renewing leases or evictions (not purchase)',
    examples: [
      'Tenancy agreement costs',
      'Eviction costs',
      'Lease renewal',
    ],
    hmrcGuidance:
      'Include legal fees for letting. Do NOT include purchase/sale costs',
    allowableConditions: [
      'Cannot claim for property purchase or sale',
      'Only for letting-related legal work',
    ],
  },

  PROPERTY_ACCOUNTANCY: {
    code: 'PROPERTY_ACCOUNTANCY',
    label: 'Property Accountancy Fees',
    description: 'Accountancy fees for property rental business',
    examples: [
      'Accountant fees for rental accounts',
      'Tax return preparation',
    ],
    hmrcGuidance: 'Include accountancy fees for your rental business',
  },

  PROPERTY_MANAGEMENT: {
    code: 'PROPERTY_MANAGEMENT',
    label: 'Property Management',
    description: 'Property management and maintenance costs',
    examples: [
      'Property management fees',
      'Caretaker costs',
      'Cleaning',
    ],
    hmrcGuidance: 'Include costs of managing and maintaining your property',
  },

  PROPERTY_MAINTENANCE: {
    code: 'PROPERTY_MAINTENANCE',
    label: 'Property Maintenance and Repairs',
    description: 'Repairs, maintenance, and servicing (not improvements)',
    examples: [
      'Repairs to property',
      'Decorating',
      'Boiler servicing',
      'Plumbing repairs',
    ],
    hmrcGuidance:
      'Include repairs and maintenance. Do NOT include improvements or renovations',
    allowableConditions: [
      'Must be repairs, not improvements',
      'Restoring to original condition only',
      'Cannot claim for improvements or extensions',
    ],
  },

  PROPERTY_INSURANCE: {
    code: 'PROPERTY_INSURANCE',
    label: 'Property Insurance',
    description: 'Buildings and contents insurance for rental properties',
    examples: [
      'Buildings insurance',
      'Contents insurance',
      'Landlord insurance',
    ],
    hmrcGuidance: 'Include insurance premiums for rental properties',
  },

  PROPERTY_RATES: {
    code: 'PROPERTY_RATES',
    label: 'Property Rates and Taxes',
    description: 'Council tax and water rates (if paid by landlord)',
    examples: ['Council tax', 'Water rates', 'Service charges'],
    hmrcGuidance:
      'Include council tax and water rates only if you pay them (not tenant)',
  },

  PROPERTY_UTILITIES: {
    code: 'PROPERTY_UTILITIES',
    label: 'Property Utilities',
    description: 'Gas, electricity, and water (if paid by landlord)',
    examples: ['Gas', 'Electricity', 'Water'],
    hmrcGuidance: 'Include utilities only if you pay them (not tenant)',
    allowableConditions: ['Only if included in rent and paid by you'],
  },

  PROPERTY_MORTGAGE_INTEREST: {
    code: 'PROPERTY_MORTGAGE_INTEREST',
    label: 'Mortgage Interest',
    description: 'Mortgage interest on rental properties (20% tax relief)',
    examples: ['Mortgage interest payments', 'Buy-to-let mortgage interest'],
    hmrcGuidance:
      'You can get 20% tax relief on mortgage interest but cannot deduct from income',
    allowableConditions: [
      'Only interest, not capital repayments',
      'Subject to 20% tax credit rules',
    ],
  },

  PROPERTY_GROUND_RENT: {
    code: 'PROPERTY_GROUND_RENT',
    label: 'Ground Rent and Service Charges',
    description: 'Ground rent, service charges, and estate management',
    examples: [
      'Ground rent',
      'Service charges',
      'Estate management fees',
    ],
    hmrcGuidance: 'Include ground rent and service charges you pay',
  },

  PROPERTY_OTHER: {
    code: 'PROPERTY_OTHER',
    label: 'Other Property Expenses',
    description: 'Other allowable property expenses',
    examples: [
      'Inventory costs',
      'Safety certificates',
      'Advertising for tenants',
    ],
    hmrcGuidance:
      'Include any other expenses wholly and exclusively for your rental business',
    allowableConditions: ['Must be wholly and exclusively for rental business'],
  },
};

// ============================================
// CATEGORIZATION KEYWORDS
// ============================================

export const CATEGORY_KEYWORDS: Record<
  IncomeCategory | ExpenseCategory,
  string[]
> = {
  // Income
  SELF_EMPLOYMENT_INCOME: [
    'sales',
    'income',
    'receipt',
    'payment received',
    'consulting fee',
    'service',
    'invoice',
  ],
  PROPERTY_RENTAL_INCOME: ['rent', 'rental', 'tenant', 'letting'],
  OTHER_BUSINESS_INCOME: ['interest', 'commission', 'royalty', 'dividend'],

  // Self-Employment Expenses
  COST_OF_GOODS_SOLD: ['stock', 'materials', 'wholesale', 'raw materials'],
  WAGES_SALARIES: ['salary', 'wage', 'payroll', 'paye', 'staff', 'employee'],
  CAR_VAN_TRAVEL: [
    'fuel',
    'petrol',
    'diesel',
    'mileage',
    'parking',
    'vehicle',
    'car',
    'van',
    'taxi',
    'train',
    'travel',
  ],
  RENT_RATES_POWER: [
    'rent',
    'rates',
    'electricity',
    'gas',
    'water',
    'utilities',
  ],
  PHONE_INTERNET_STATIONERY: [
    'phone',
    'mobile',
    'internet',
    'broadband',
    'stationery',
    'postage',
  ],
  REPAIRS_RENEWALS: ['repair', 'maintenance', 'servicing', 'fix'],
  ACCOUNTANCY_LEGAL: [
    'accountant',
    'accountancy',
    'legal',
    'solicitor',
    'tax advisor',
  ],
  INSURANCE: ['insurance', 'indemnity', 'liability'],
  BANK_CHARGES_INTEREST: [
    'bank charge',
    'interest',
    'overdraft',
    'loan',
    'finance charge',
  ],
  ADVERTISING_MARKETING: [
    'advertising',
    'marketing',
    'google ads',
    'facebook ads',
    'promotion',
  ],
  DEPRECIATION: ['depreciation', 'capital allowance', 'asset'],
  OTHER_EXPENSES: ['subscription', 'license', 'training', 'software'],

  // Property Expenses
  PROPERTY_AGENT_FEES: ['agent', 'letting agent', 'property management'],
  PROPERTY_LEGAL_FEES: ['legal', 'solicitor', 'eviction', 'tenancy'],
  PROPERTY_ACCOUNTANCY: ['accountant', 'accounting'],
  PROPERTY_MANAGEMENT: ['management', 'caretaker', 'cleaning'],
  PROPERTY_MAINTENANCE: [
    'repair',
    'maintenance',
    'decorating',
    'plumbing',
    'boiler',
  ],
  PROPERTY_INSURANCE: ['insurance', 'buildings', 'contents'],
  PROPERTY_RATES: ['council tax', 'rates', 'water rates'],
  PROPERTY_UTILITIES: ['gas', 'electricity', 'water', 'utilities'],
  PROPERTY_MORTGAGE_INTEREST: ['mortgage', 'interest'],
  PROPERTY_GROUND_RENT: ['ground rent', 'service charge'],
  PROPERTY_OTHER: ['certificate', 'safety', 'inventory'],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get category definition by code
 */
export function getCategoryDefinition(
  code: IncomeCategory | ExpenseCategory
): CategoryDefinition {
  return (
    INCOME_CATEGORIES[code as IncomeCategory] ||
    EXPENSE_CATEGORIES[code as ExpenseCategory]
  );
}

/**
 * Get all income category codes
 */
export function getIncomeCategoryCodes(): IncomeCategory[] {
  return Object.keys(INCOME_CATEGORIES) as IncomeCategory[];
}

/**
 * Get all expense category codes
 */
export function getExpenseCategoryCodes(): ExpenseCategory[] {
  return Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[];
}

/**
 * Suggest category based on description (simple keyword matching)
 * This is a fallback - Claude AI will do better categorization
 */
export function suggestCategory(
  description: string,
  isIncome: boolean
): (IncomeCategory | ExpenseCategory)[] {
  const lowerDesc = description.toLowerCase();
  const suggestions: (IncomeCategory | ExpenseCategory)[] = [];

  const categoriesToSearch = isIncome
    ? getIncomeCategoryCodes()
    : getExpenseCategoryCodes();

  for (const category of categoriesToSearch) {
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords.some((keyword) => lowerDesc.includes(keyword))) {
      suggestions.push(category);
    }
  }

  return suggestions;
}
