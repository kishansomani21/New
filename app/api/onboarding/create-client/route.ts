import { NextRequest, NextResponse } from 'next/server';
import { createClientFolderStructure, shareFolder } from '@/lib/googleDrive';
import { Client, getDefaultDocuments, OnboardingChecklist } from '@/lib/clientTypes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, type = 'individual', createFolder = true, shareWithClient = false } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Generate a unique client ID
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create the client object
    const client: Client = {
      id: clientId,
      name,
      email,
      phone,
      company,
      type,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create Google Drive folder structure if requested
    let folderData = null;
    if (createFolder) {
      try {
        const folderName = company ? `${company} - ${name}` : name;
        folderData = await createClientFolderStructure(folderName);
        client.folderId = folderData.id;
        client.folderUrl = folderData.url;

        // Share with client if requested
        if (shareWithClient && email) {
          await shareFolder(folderData.id, email, 'writer');
        }
      } catch (driveError: any) {
        console.error('Error creating Drive folder:', driveError);
        // Continue without folder if Drive fails
      }
    }

    // Get default documents for this client type
    const defaultDocs = getDefaultDocuments(type);

    // Create the onboarding checklist
    const checklist: OnboardingChecklist = {
      clientId,
      documents: defaultDocs,
      completedSteps: ['client_created'],
      pendingSteps: [
        'send_welcome_email',
        'collect_documents',
        'review_documents',
        'compliance_check',
        'final_approval',
      ],
    };

    return NextResponse.json({
      success: true,
      client,
      checklist,
      folder: folderData,
    });
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client', details: error.message },
      { status: 500 }
    );
  }
}
