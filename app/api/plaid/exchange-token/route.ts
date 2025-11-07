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
    const { publicToken } = await request.json();

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

    // In a real application, you would store the access_token securely
    // in a database associated with the user
    // For this example, we'll just return the account info

    return NextResponse.json({
      success: true,
      accountId: itemId,
      accountName: accounts[0]?.name || 'Bank Account',
      balance: `$${accounts[0]?.balances.current?.toFixed(2) || '0.00'}`,
      accessToken, // In production, never return this to the client!
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
