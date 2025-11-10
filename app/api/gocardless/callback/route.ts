import { NextRequest, NextResponse } from 'next/server';
import { createNewSpreadsheet } from '@/lib/googleSheets';
import { saveUserAccount } from '@/lib/dataStore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ref = searchParams.get('ref');
    const userId = searchParams.get('state') || `user_${Date.now()}`;

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
      const accountId = requisition.accounts[0];

      // Get account details to get the account name
      const accountResponse = await fetch(
        `https://bankaccountdata.gocardless.com/api/v2/accounts/${accountId}/details/`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const accountDetails = await accountResponse.json();
      const accountName = accountDetails.account?.name || 'GoCardless Account';

      // Create a new Google Sheet for this user
      const sheetTitle = `${accountName} - ${userId} - ${new Date().toLocaleDateString()}`;
      const sheetResult = await createNewSpreadsheet(sheetTitle);

      // Store user account data
      saveUserAccount({
        userId: userId,
        accountId: accountId,
        provider: 'gocardless',
        accessToken: accessToken!,
        sheetId: sheetResult.spreadsheetId!,
        sheetUrl: sheetResult.spreadsheetUrl!,
        accountName: accountName,
        createdAt: new Date().toISOString(),
      });

      console.log(`✅ Created new sheet for GoCardless user ${userId}: ${sheetResult.spreadsheetUrl}`);

      // Successfully connected, redirect to dashboard
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?gocardless_success=true`
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
