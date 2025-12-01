import { NextRequest, NextResponse } from 'next/server';
import { RequiredDocument, getDefaultDocuments } from '@/lib/clientTypes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientType = 'individual',
      currentDocuments,
      updates,
    } = body;

    // Get base documents
    let documents: RequiredDocument[] = currentDocuments || getDefaultDocuments(clientType);

    // Apply updates
    if (updates && Array.isArray(updates)) {
      for (const update of updates) {
        const { documentId, received, receivedDate, notes } = update;
        const docIndex = documents.findIndex(d => d.id === documentId);

        if (docIndex !== -1) {
          documents[docIndex] = {
            ...documents[docIndex],
            received: received ?? documents[docIndex].received,
            receivedDate: receivedDate ?? documents[docIndex].receivedDate,
            notes: notes ?? documents[docIndex].notes,
          };
        }
      }
    }

    // Calculate progress
    const requiredDocs = documents.filter(d => d.required);
    const receivedRequired = requiredDocs.filter(d => d.received);
    const progress = requiredDocs.length > 0 ? receivedRequired.length / requiredDocs.length : 0;

    // Categorize documents
    const receivedDocs = documents.filter(d => d.received);
    const pendingDocs = documents.filter(d => !d.received);
    const requiredPending = pendingDocs.filter(d => d.required);

    return NextResponse.json({
      success: true,
      documents,
      summary: {
        total: documents.length,
        received: receivedDocs.length,
        pending: pendingDocs.length,
        requiredPending: requiredPending.length,
        progress,
        isComplete: requiredPending.length === 0,
      },
      receivedDocs,
      pendingDocs,
    });
  } catch (error: any) {
    console.error('Error updating documents:', error);
    return NextResponse.json(
      { error: 'Failed to update documents', details: error.message },
      { status: 500 }
    );
  }
}
