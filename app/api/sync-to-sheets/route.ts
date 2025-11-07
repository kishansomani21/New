import { NextRequest, NextResponse } from 'next/server';
import { appendTransactionsToSheet, Transaction } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const { accountId, accessToken, provider } = await request.json();

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    let transactions: Transaction[] = [];

    // Fetch transactions based on provider
    if (provider === 'plaid' || !provider) {
      // Assume Plaid for now - in production you'd determine this from stored data
      const plaidResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/plaid/transactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        }
      );

      if (!plaidResponse.ok) {
        throw new Error('Failed to fetch transactions from Plaid');
      }

      const plaidData = await plaidResponse.json();
      transactions = plaidData.transactions;
    } else if (provider === 'gocardless') {
      // Fetch from GoCardless
      const gcAccessToken = process.env.GOCARDLESS_ACCESS_TOKEN;
      const gcResponse = await fetch(
        `https://bankaccountdata.gocardless.com/api/v2/accounts/${accountId}/transactions/`,
        {
          headers: {
            'Authorization': `Bearer ${gcAccessToken}`,
          },
        }
      );

      const gcData = await gcResponse.json();
      transactions = gcData.transactions?.booked?.map((txn: any) => ({
        id: txn.transactionId,
        date: txn.bookingDate,
        name: txn.remittanceInformationUnstructured || 'N/A',
        amount: parseFloat(txn.transactionAmount.amount),
        category: 'N/A',
        merchantName: txn.creditorName || '',
      })) || [];
    } else if (provider === 'truelayer') {
      // TrueLayer implementation would go here
      // This would require the stored access token for the account
      transactions = [];
    }

    if (transactions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No transactions found to sync',
      });
    }

    // Sync to Google Sheets
    const result = await appendTransactionsToSheet(transactions);

    return NextResponse.json({
      success: true,
      transactionCount: transactions.length,
      spreadsheetUrl: result.spreadsheetUrl,
      message: `Successfully synced ${transactions.length} transactions to Google Sheets`,
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync to Google Sheets', details: error.message },
      { status: 500 }
    );
  }
}
