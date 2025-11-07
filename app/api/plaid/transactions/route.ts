import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export async function POST(request: NextRequest) {
  try {
    const { accessToken, startDate, endDate } = await request.json();

    // Get transactions for the past 30 days
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: start,
      end_date: end,
      options: {
        count: 500,
        offset: 0,
      },
    });

    const transactions = transactionsResponse.data.transactions.map(txn => ({
      id: txn.transaction_id,
      date: txn.date,
      name: txn.name,
      amount: txn.amount,
      category: txn.category?.join(', ') || 'Uncategorized',
      pending: txn.pending,
      merchantName: txn.merchant_name,
    }));

    return NextResponse.json({
      success: true,
      transactions,
      total: transactionsResponse.data.total_transactions,
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error.message },
      { status: 500 }
    );
  }
}
