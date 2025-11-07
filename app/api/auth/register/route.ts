import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, userType, companyName, phone } = body;

    // Validation
    if (!email || !password || !name || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (userType !== 'WORKER' && userType !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    if (userType === 'COMPANY' && !companyName) {
      return NextResponse.json(
        { error: 'Company name is required for company accounts' },
        { status: 400 }
      );
    }

    const result = await registerUser(email, password, name, userType, {
      companyName,
      phone,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Don't send password back
    const { password: _, ...userWithoutPassword } = result.user!;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
