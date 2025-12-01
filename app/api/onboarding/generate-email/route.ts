import { NextRequest, NextResponse } from 'next/server';
import {
  generateWelcomeEmail,
  generateFollowUpEmail,
  generateThankYouEmail,
  generateCompletionEmail,
  generateDocumentRequestEmail,
  generateCustomEmail,
  EmailGenerationOptions,
} from '@/lib/emailTemplates';
import { Client, RequiredDocument } from '@/lib/clientTypes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      client,
      pendingDocuments,
      receivedDocuments,
      specificDocuments,
      folderUrl,
      daysSinceLastContact,
      customSubject,
      customBody,
      reason,
      companyName,
      senderName,
      senderTitle,
      senderEmail,
    } = body;

    if (!type || !client) {
      return NextResponse.json(
        { error: 'Email type and client data are required' },
        { status: 400 }
      );
    }

    const options: EmailGenerationOptions = {
      client: client as Client,
      companyName,
      senderName,
      senderTitle,
      senderEmail,
    };

    let email;

    switch (type) {
      case 'welcome':
        email = generateWelcomeEmail(
          options,
          pendingDocuments as RequiredDocument[],
          folderUrl
        );
        break;

      case 'followup':
        email = generateFollowUpEmail(
          options,
          pendingDocuments as RequiredDocument[],
          daysSinceLastContact || 7,
          folderUrl
        );
        break;

      case 'thankyou':
        email = generateThankYouEmail(
          options,
          receivedDocuments as RequiredDocument[]
        );
        break;

      case 'completion':
        email = generateCompletionEmail(options);
        break;

      case 'document_request':
        email = generateDocumentRequestEmail(
          options,
          specificDocuments as RequiredDocument[],
          reason
        );
        break;

      case 'custom':
        if (!customSubject || !customBody) {
          return NextResponse.json(
            { error: 'Custom emails require subject and body' },
            { status: 400 }
          );
        }
        email = generateCustomEmail(options, customSubject, customBody);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      email,
      type,
    });
  } catch (error: any) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: 'Failed to generate email', details: error.message },
      { status: 500 }
    );
  }
}
