import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const accessToken = process.env.GOCARDLESS_ACCESS_TOKEN;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/gocardless/callback`;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'GoCardless access token not configured' },
        { status: 500 }
      );
    }

    // GoCardless uses requisitions to connect bank accounts
    // First, create an agreement (end user agreement)
    const agreementResponse = await fetch(
      'https://bankaccountdata.gocardless.com/api/v2/agreements/enduser/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          institution_id: 'SANDBOXFINANCE_SFIN0000', // Sandbox institution
          max_historical_days: 90,
          access_valid_for_days: 90,
          access_scope: ['balances', 'details', 'transactions'],
        }),
      }
    );

    const agreement = await agreementResponse.json();

    if (!agreement.id) {
      return NextResponse.json(
        { error: 'Failed to create agreement', details: agreement },
        { status: 500 }
      );
    }

    // Create a requisition with the agreement
    const requisitionResponse = await fetch(
      'https://bankaccountdata.gocardless.com/api/v2/requisitions/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          redirect: redirectUri,
          institution_id: 'SANDBOXFINANCE_SFIN0000',
          agreement: agreement.id,
          reference: `user-${Date.now()}`,
        }),
      }
    );

    const requisition = await requisitionResponse.json();

    return NextResponse.json({
      authUrl: requisition.link,
      requisitionId: requisition.id,
    });
  } catch (error: any) {
    console.error('GoCardless authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate GoCardless connection', details: error.message },
      { status: 500 }
    );
  }
}
