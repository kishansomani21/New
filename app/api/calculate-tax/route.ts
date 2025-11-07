/**
 * Tax Calculation API Endpoint
 *
 * Calculates quarterly summaries and tax liability from transactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { Transaction, QuarterlySummary, TaxCalculation, ApiResponse } from '@/lib/mtd-types';
import { calculateAllQuarterlySummaries } from '@/lib/quarterly-calculator';
import { calculateTaxFromTransactions } from '@/lib/tax-calculator';
import { getCurrentTaxYear } from '@/lib/tax-periods';

export const runtime = 'nodejs';

/**
 * POST /api/calculate-tax
 * Calculates tax from transactions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions, taxYear } = body;

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid transactions data',
        },
        { status: 400 }
      );
    }

    const year = taxYear || getCurrentTaxYear();

    // Calculate quarterly summaries
    const quarterlySummaries = calculateAllQuarterlySummaries(
      transactions as Transaction[],
      year
    );

    // Calculate tax
    const taxCalculation = calculateTaxFromTransactions(
      transactions as Transaction[],
      year
    );

    return NextResponse.json<
      ApiResponse<{
        quarterlySummaries: QuarterlySummary[];
        taxCalculation: TaxCalculation;
      }>
    >(
      {
        success: true,
        data: {
          quarterlySummaries,
          taxCalculation,
        },
        message: 'Tax calculation completed successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Tax calculation error:', error);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error.message || 'Failed to calculate tax',
      },
      { status: 500 }
    );
  }
}
