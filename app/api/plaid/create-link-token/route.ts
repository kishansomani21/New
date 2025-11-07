import { NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

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

export async function POST() {
  try {
    const configs = {
      user: {
        // This should be a unique ID for each user in your system
        client_user_id: 'user-' + Date.now(),
      },
      client_name: 'BankSync',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us, CountryCode.Ca],
      language: 'en',
    };

    const createTokenResponse = await plaidClient.linkTokenCreate(configs);

    return NextResponse.json({
      link_token: createTokenResponse.data.link_token,
    });
  } catch (error: any) {
    console.error('Error creating link token:', error);
    return NextResponse.json(
      { error: 'Failed to create link token', details: error.message },
      { status: 500 }
    );
  }
}
