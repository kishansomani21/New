import { NextRequest, NextResponse } from 'next/server';
import { getAllUserAccounts } from '@/lib/dataStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const accounts = getAllUserAccounts(userId);

    // Remove sensitive data before sending to client
    const sanitizedAccounts = accounts.map(acc => ({
      accountId: acc.accountId,
      provider: acc.provider,
      accountName: acc.accountName,
      sheetUrl: acc.sheetUrl,
      createdAt: acc.createdAt,
      lastSync: acc.lastSync,
    }));

    return NextResponse.json({
      success: true,
      accounts: sanitizedAccounts,
    });
  } catch (error: any) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts', details: error.message },
      { status: 500 }
    );
  }
}
