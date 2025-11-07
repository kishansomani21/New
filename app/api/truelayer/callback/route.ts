import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=truelayer_${error}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=missing_code`
      );
    }

    const clientId = process.env.TRUELAYER_CLIENT_ID;
    const clientSecret = process.env.TRUELAYER_CLIENT_SECRET;
    const redirectUri = process.env.TRUELAYER_REDIRECT_URI;

    // Exchange code for access token
    const tokenResponse = await fetch('https://auth.truelayer-sandbox.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri!,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=token_exchange_failed`
      );
    }

    // Get account information
    const accountsResponse = await fetch('https://api.truelayer-sandbox.com/data/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const accountsData = await accountsResponse.json();

    if (accountsData.results && accountsData.results.length > 0) {
      // Successfully connected
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?truelayer_success=true&account_id=${accountsData.results[0].account_id}`
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=no_accounts`
      );
    }
  } catch (error: any) {
    console.error('TrueLayer callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=callback_failed`
    );
  }
}
