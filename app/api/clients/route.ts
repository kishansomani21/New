import { NextRequest, NextResponse } from 'next/server';
import { getClientUsers } from '@/lib/storage';

// GET all client users
export async function GET(request: NextRequest) {
  try {
    const clients = getClientUsers();
    return NextResponse.json({ success: true, clients });
  } catch (error) {
    console.error('Get clients error:', error);
    return NextResponse.json(
      { error: 'Failed to get clients' },
      { status: 500 }
    );
  }
}
