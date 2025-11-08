import { NextRequest, NextResponse } from 'next/server';
import { processFormResponse } from '@/lib/workflows/onboardingOrchestrator';
import { ClientDetailedInfo } from '@/lib/types/onboarding';

// POST /api/onboarding/form-response
// Handle Google Form submission (webhook)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract form data
    // Note: Adjust field mappings based on your actual Google Form structure
    const {
      clientId,
      name,
      email,
      phone,
      companyName,
      address,
      postcode,
      businessType,
      utr,
      vatNumber,
      payeReference,
      isPAYERegistered,
      isVATRegistered,
      isCISRegistered,
      authenticationCode,
      notes,
    } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const detailedInfo: ClientDetailedInfo = {
      name,
      email,
      phone,
      companyName: companyName || undefined,
      address: address || undefined,
      postcode: postcode || undefined,
      businessType: businessType || undefined,
      utr: utr || undefined,
      vatNumber: vatNumber || undefined,
      payeReference: payeReference || undefined,
      isPAYERegistered: isPAYERegistered === 'Yes' || isPAYERegistered === true,
      isVATRegistered: isVATRegistered === 'Yes' || isVATRegistered === true,
      isCISRegistered: isCISRegistered === 'Yes' || isCISRegistered === true,
      authenticationCode: authenticationCode || undefined,
      notes: notes || undefined,
    };

    // Process the form response
    const result = await processFormResponse(clientId, detailedInfo);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to process form response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Form response processed successfully',
      nextSteps: [
        'Engagement letter sent for signature',
        'GoCardless payment link sent',
        'Google Contact created',
        'Data added to tracking sheet',
        isPAYERegistered && 'BrightPay CSV generated',
        isVATRegistered && 'VAT agent authorization requested',
      ].filter(Boolean),
    });
  } catch (error: any) {
    console.error('Error processing form response:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
