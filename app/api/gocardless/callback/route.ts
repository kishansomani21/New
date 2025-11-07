import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ref = searchParams.get('ref');

    if (!ref) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=missing_ref`);
    }

    const accessToken = process.env.GOCARDLESS_ACCESS_TOKEN;

    // Get the requisition details
    const requisitionResponse = await fetch(
      `https://bankaccountdata.gocardless.com/api/v2/requisitions/${ref}/`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const requisition = await requisitionResponse.json();

    if (requisition.accounts && requisition.accounts.length > 0) {
      // Successfully connected, redirect to dashboard
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?gocardless_success=true&account_id=${requisition.accounts[0]}`
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=no_accounts`
      );
    }
  } catch (error: any) {
    console.error('GoCardless callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=callback_failed`
    );
  }
}
