import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.TRUELAYER_CLIENT_ID;
    const redirectUri = process.env.TRUELAYER_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: 'TrueLayer credentials not configured' },
        { status: 500 }
      );
    }

    // TrueLayer OAuth2 authorization URL
    const authUrl = new URL('https://auth.truelayer-sandbox.com');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', 'info accounts balance transactions offline_access');
    authUrl.searchParams.append('providers', 'uk-ob-all uk-oauth-all');
    authUrl.searchParams.append('state', `state-${Date.now()}`);

    return NextResponse.json({
      authUrl: authUrl.toString(),
    });
  } catch (error: any) {
    console.error('TrueLayer authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate TrueLayer connection', details: error.message },
      { status: 500 }
    );
  }
}
