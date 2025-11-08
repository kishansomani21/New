import { NextRequest, NextResponse } from 'next/server';
import { parseZohoSignWebhook } from '@/lib/services/zohoSign';
import { handleEngagementLetterSigned } from '@/lib/workflows/onboardingOrchestrator';

// POST /api/webhooks/zoho-sign
// Handle Zoho Sign webhooks (document signed, declined, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Parse webhook payload
    const webhookData = parseZohoSignWebhook(body);

    if (!webhookData) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    console.log('Zoho Sign webhook received:', webhookData);

    // Handle different events
    if (webhookData.status === 'completed') {
      // Document has been signed
      // Extract client ID from request metadata or document name
      // For now, we'll need to look it up by email
      const clientId = 'PLACEHOLDER'; // Would need to retrieve from database

      await handleEngagementLetterSigned(clientId, webhookData.requestId);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });
  } catch (error: any) {
    console.error('Error processing Zoho Sign webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
