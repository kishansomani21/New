import { NextRequest, NextResponse } from 'next/server';
import { appendTransactionsToSheet, Transaction } from '@/lib/googleSheets';
import { getUserAccount, updateLastSync } from '@/lib/dataStore';

export async function POST(request: NextRequest) {
  try {
    const { accountId, userId } = await request.json();

    if (!accountId || !userId) {
      return NextResponse.json(
        { error: 'Account ID and User ID are required' },
        { status: 400 }
      );
    }

    // Get user account data (which includes access token and sheet ID)
    const userAccount = getUserAccount(userId, accountId);

    if (!userAccount) {
      return NextResponse.json(
        { error: 'Account not found for this user' },
        { status: 404 }
      );
    }

    let transactions: Transaction[] = [];

    // Fetch transactions based on provider
    if (userAccount.provider === 'plaid') {
      const plaidResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/plaid/transactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: userAccount.accessToken }),
        }
      );

      if (!plaidResponse.ok) {
        throw new Error('Failed to fetch transactions from Plaid');
      }

      const plaidData = await plaidResponse.json();
      transactions = plaidData.transactions;
    } else if (userAccount.provider === 'gocardless') {
      // Fetch from GoCardless using the stored access token
      const gcResponse = await fetch(
        `https://bankaccountdata.gocardless.com/api/v2/accounts/${accountId}/transactions/`,
        {
          headers: {
            'Authorization': `Bearer ${userAccount.accessToken}`,
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
    } else if (userAccount.provider === 'truelayer') {
      // TrueLayer implementation using the stored access token
      const tlResponse = await fetch(
        `https://api.truelayer.com/data/v1/accounts/${accountId}/transactions`,
        {
          headers: {
            'Authorization': `Bearer ${userAccount.accessToken}`,
          },
        }
      );

      const tlData = await tlResponse.json();
      transactions = tlData.results?.map((txn: any) => ({
        id: txn.transaction_id,
        date: txn.timestamp,
        name: txn.description || 'N/A',
        amount: txn.amount,
        category: txn.transaction_category || 'N/A',
        merchantName: txn.merchant_name || '',
      })) || [];
    }

    if (transactions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No transactions found to sync',
        sheetUrl: userAccount.sheetUrl,
      });
    }

    // Sync to user's specific Google Sheet
    const result = await appendTransactionsToSheet(transactions, userAccount.sheetId);

    // Update last sync time
    updateLastSync(userId, accountId);

    console.log(`✅ Synced ${transactions.length} transactions for user ${userId} to ${userAccount.sheetUrl}`);

    return NextResponse.json({
      success: true,
      transactionCount: transactions.length,
      spreadsheetUrl: result.spreadsheetUrl,
      message: `Successfully synced ${transactions.length} transactions to your Google Sheet`,
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync to Google Sheets', details: error.message },
      { status: 500 }
    );
  }
}
