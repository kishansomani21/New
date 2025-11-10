import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { createNewSpreadsheet } from '@/lib/googleSheets';
import { saveUserAccount } from '@/lib/dataStore';

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
    const { publicToken, userId } = await request.json();

    // If no userId provided, generate a simple one based on timestamp
    // In production, this should come from your authentication system
    const effectiveUserId = userId || `user_${Date.now()}`;

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get account information
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accounts = accountsResponse.data.accounts;
    const accountName = accounts[0]?.name || 'Bank Account';

    // Create a new Google Sheet for this user
    const sheetTitle = `${accountName} - ${effectiveUserId} - ${new Date().toLocaleDateString()}`;
    const sheetResult = await createNewSpreadsheet(sheetTitle);

    // Store user account data securely
    saveUserAccount({
      userId: effectiveUserId,
      accountId: itemId,
      provider: 'plaid',
      accessToken: accessToken,
      sheetId: sheetResult.spreadsheetId!,
      sheetUrl: sheetResult.spreadsheetUrl!,
      accountName: accountName,
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Created new sheet for user ${effectiveUserId}: ${sheetResult.spreadsheetUrl}`);

    return NextResponse.json({
      success: true,
      accountId: itemId,
      userId: effectiveUserId,
      accountName: accountName,
      balance: `$${accounts[0]?.balances.current?.toFixed(2) || '0.00'}`,
      sheetId: sheetResult.spreadsheetId,
      sheetUrl: sheetResult.spreadsheetUrl,
      accounts: accounts.map(acc => ({
        id: acc.account_id,
        name: acc.name,
        type: acc.type,
        subtype: acc.subtype,
        balance: acc.balances.current,
      })),
    });
  } catch (error: any) {
    console.error('Error exchanging token:', error);
    return NextResponse.json(
      { error: 'Failed to exchange token', details: error.message },
      { status: 500 }
    );
  }
}
