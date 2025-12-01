import { NextRequest, NextResponse } from 'next/server';
import {
  createClientFolderStructure,
  createCustomFolderStructure,
  shareFolder,
  FolderStructure,
} from '@/lib/googleDrive';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientName,
      customStructure,
      shareWith,
      parentFolderId,
    } = body;

    if (!clientName) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      );
    }

    let folder;

    if (customStructure && Array.isArray(customStructure)) {
      // Create custom folder structure
      folder = await createCustomFolderStructure(
        clientName,
        customStructure as FolderStructure[],
        parentFolderId
      );
    } else {
      // Create default client folder structure
      folder = await createClientFolderStructure(clientName, parentFolderId);
    }

    // Share folder with specified email(s)
    if (shareWith) {
      const emails = Array.isArray(shareWith) ? shareWith : [shareWith];
      for (const email of emails) {
        try {
          await shareFolder(folder.id, email, 'writer');
        } catch (shareError: any) {
          console.error(`Error sharing folder with ${email}:`, shareError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      folder,
    });
  } catch (error: any) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder', details: error.message },
      { status: 500 }
    );
  }
}
