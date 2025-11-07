import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd verify a JWT token or session cookie here
    // For this MVP, we'll use a simple userId from headers
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = db.findUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;

    // Get profile data
    let profile = null;
    if (user.userType === 'WORKER') {
      profile = db.findWorkerProfileByUserId(user.id);
    } else if (user.userType === 'COMPANY') {
      profile = db.findCompanyProfileByUserId(user.id);
    }

    return NextResponse.json({
      user: userWithoutPassword,
      profile,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
