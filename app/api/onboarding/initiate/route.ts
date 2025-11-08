import { NextRequest, NextResponse } from 'next/server';
import { initiateOnboarding } from '@/lib/workflows/onboardingOrchestrator';
import { ClientBasicInfo } from '@/lib/types/onboarding';

// POST /api/onboarding/initiate
// Initiate client onboarding with just name, email, and phone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, phone } = body;

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const basicInfo: ClientBasicInfo = {
      name,
      email,
      phone,
    };

    // Initiate onboarding workflow
    const result = await initiateOnboarding(basicInfo);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to initiate onboarding' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding initiated successfully',
      clientId: result.clientId,
      status: result.workflowStatus?.status,
      nextSteps: [
        'Google Form sent to client email',
        'Client will complete detailed information form',
        'System will automatically process the rest of the onboarding',
      ],
    });
  } catch (error: any) {
    console.error('Error in onboarding initiation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
