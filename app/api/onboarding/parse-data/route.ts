import { NextRequest, NextResponse } from 'next/server';
import { parseClientData, analyzeDocumentStatus, generateSummary, extractFollowUpNeeds } from '@/lib/dataParser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, clientType = 'individual' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text data is required' },
        { status: 400 }
      );
    }

    // Parse the pasted data
    const parsedData = parseClientData(text);

    // Analyze document status
    const documentStatus = analyzeDocumentStatus(parsedData, clientType);

    // Generate summary
    const summary = generateSummary(parsedData);

    // Extract follow-up needs
    const followUpNeeds = extractFollowUpNeeds(parsedData);

    return NextResponse.json({
      success: true,
      parsed: {
        client: parsedData.client,
        confidence: parsedData.confidence,
      },
      documents: {
        received: documentStatus.receivedDocs,
        pending: documentStatus.pendingDocs,
        progress: documentStatus.progress,
      },
      summary,
      followUpNeeds,
    });
  } catch (error: any) {
    console.error('Error parsing data:', error);
    return NextResponse.json(
      { error: 'Failed to parse data', details: error.message },
      { status: 500 }
    );
  }
}
