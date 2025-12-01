import { google } from 'googleapis';

export interface FolderStructure {
  name: string;
  subfolders?: FolderStructure[];
}

export interface CreatedFolder {
  id: string;
  name: string;
  url: string;
  subfolders?: CreatedFolder[];
}

export async function getGoogleDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });

  const drive = google.drive({ version: 'v3', auth });
  return drive;
}

export async function createFolder(
  name: string,
  parentId?: string
): Promise<CreatedFolder> {
  const drive = await getGoogleDriveClient();

  const fileMetadata: any = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentId) {
    fileMetadata.parents = [parentId];
  }

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id, name, webViewLink',
  });

  return {
    id: response.data.id!,
    name: response.data.name!,
    url: response.data.webViewLink || `https://drive.google.com/drive/folders/${response.data.id}`,
  };
}

export async function createClientFolderStructure(
  clientName: string,
  parentFolderId?: string
): Promise<CreatedFolder> {
  const drive = await getGoogleDriveClient();

  // Create main client folder
  const mainFolder = await createFolder(clientName, parentFolderId || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID);

  // Define standard folder structure for client onboarding
  const subfolderNames = [
    '01 - Identity Documents',
    '02 - Financial Documents',
    '03 - Business Documents',
    '04 - Contracts & Agreements',
    '05 - Correspondence',
    '06 - Compliance & KYC',
    '07 - Meeting Notes',
    '08 - Miscellaneous',
  ];

  const subfolders: CreatedFolder[] = [];

  for (const folderName of subfolderNames) {
    const subfolder = await createFolder(folderName, mainFolder.id);
    subfolders.push(subfolder);
  }

  return {
    ...mainFolder,
    subfolders,
  };
}

export async function createCustomFolderStructure(
  rootFolderName: string,
  structure: FolderStructure[],
  parentFolderId?: string
): Promise<CreatedFolder> {
  const rootFolder = await createFolder(
    rootFolderName,
    parentFolderId || process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
  );

  const createdSubfolders: CreatedFolder[] = [];

  for (const item of structure) {
    const subfolder = await createFolder(item.name, rootFolder.id);

    if (item.subfolders && item.subfolders.length > 0) {
      const nestedFolders: CreatedFolder[] = [];
      for (const nested of item.subfolders) {
        const nestedFolder = await createFolder(nested.name, subfolder.id);
        nestedFolders.push(nestedFolder);
      }
      subfolder.subfolders = nestedFolders;
    }

    createdSubfolders.push(subfolder);
  }

  return {
    ...rootFolder,
    subfolders: createdSubfolders,
  };
}

export async function shareFolder(
  folderId: string,
  email: string,
  role: 'reader' | 'writer' | 'commenter' = 'writer'
): Promise<void> {
  const drive = await getGoogleDriveClient();

  await drive.permissions.create({
    fileId: folderId,
    requestBody: {
      type: 'user',
      role,
      emailAddress: email,
    },
    sendNotificationEmail: true,
  });
}

export async function listFolderContents(folderId: string) {
  const drive = await getGoogleDriveClient();

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, webViewLink, createdTime, modifiedTime)',
    orderBy: 'name',
  });

  return response.data.files || [];
}

export async function checkFolderExists(folderName: string, parentId?: string): Promise<string | null> {
  const drive = await getGoogleDriveClient();

  let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  const response = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

  return null;
}
