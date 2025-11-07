import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = db.findUserById(userId);
    if (!user || user.userType !== 'COMPANY') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const profile = db.findCompanyProfileByUserId(userId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      profile,
    });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
