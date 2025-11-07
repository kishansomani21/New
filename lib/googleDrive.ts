/**
 * Google Drive Integration
 *
 * Handles document storage and retrieval from Google Drive
 * for MTD ITSA compliance and record keeping.
 */

import { google } from 'googleapis';
import { Readable } from 'stream';

// ============================================
// GOOGLE DRIVE CLIENT
// ============================================

let drive: any = null;

function getDriveClient() {
  if (!drive) {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      throw new Error(
        'Google Drive credentials not found. Please set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in .env'
      );
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive',
      ],
    });

    drive = google.drive({ version: 'v3', auth });
  }

  return drive;
}

// ============================================
// FOLDER MANAGEMENT
// ============================================

/**
 * Get or create the main MTD ITSA folder
 * @returns Folder ID
 */
export async function getOrCreateMainFolder(): Promise<string> {
  const driveClient = getDriveClient();

  // Check if GOOGLE_DRIVE_FOLDER_ID is set in env
  const existingFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (existingFolderId) {
    return existingFolderId;
  }

  // Search for existing folder
  const folderName = 'MTD ITSA Financial Documents';
  const searchResponse = await driveClient.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (searchResponse.data.files && searchResponse.data.files.length > 0) {
    return searchResponse.data.files[0].id;
  }

  // Create new folder
  const folderMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const folder = await driveClient.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });

  console.log(`Created main folder: ${folder.data.id}`);
  console.log(`Add this to your .env: GOOGLE_DRIVE_FOLDER_ID=${folder.data.id}`);

  return folder.data.id;
}

/**
 * Get or create a subfolder for a specific tax year
 * @param taxYear - Tax year string (e.g., "2025-26")
 * @returns Folder ID
 */
export async function getOrCreateTaxYearFolder(taxYear: string): Promise<string> {
  const driveClient = getDriveClient();
  const parentFolderId = await getOrCreateMainFolder();

  // Search for existing tax year folder
  const searchResponse = await driveClient.files.list({
    q: `name='${taxYear}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (searchResponse.data.files && searchResponse.data.files.length > 0) {
    return searchResponse.data.files[0].id;
  }

  // Create new tax year folder
  const folderMetadata = {
    name: taxYear,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId],
  };

  const folder = await driveClient.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });

  return folder.data.id;
}

/**
 * Get or create a quarter subfolder
 * @param taxYear - Tax year string
 * @param quarter - Quarter (Q1, Q2, Q3, Q4)
 * @returns Folder ID
 */
export async function getOrCreateQuarterFolder(
  taxYear: string,
  quarter: string
): Promise<string> {
  const driveClient = getDriveClient();
  const parentFolderId = await getOrCreateTaxYearFolder(taxYear);

  // Search for existing quarter folder
  const searchResponse = await driveClient.files.list({
    q: `name='${quarter}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (searchResponse.data.files && searchResponse.data.files.length > 0) {
    return searchResponse.data.files[0].id;
  }

  // Create new quarter folder
  const folderMetadata = {
    name: quarter,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId],
  };

  const folder = await driveClient.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });

  return folder.data.id;
}

// ============================================
// FILE UPLOAD
// ============================================

/**
 * Upload a file to Google Drive
 * @param fileBuffer - File buffer
 * @param fileName - File name
 * @param mimeType - MIME type
 * @param taxYear - Tax year
 * @param quarter - Quarter
 * @returns File ID and shareable URL
 */
export async function uploadFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  taxYear: string,
  quarter: string
): Promise<{
  fileId: string;
  fileUrl: string;
  fileName: string;
}> {
  const driveClient = getDriveClient();

  // Get quarter folder
  const folderId = await getOrCreateQuarterFolder(taxYear, quarter);

  // Create readable stream from buffer
  const stream = Readable.from(fileBuffer);

  // Upload file
  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType,
    body: stream,
  };

  const file = await driveClient.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, name, webViewLink',
  });

  // Make file accessible (if needed)
  // Note: This makes the file accessible to anyone with the link
  // Remove this if you want stricter permissions
  await driveClient.permissions.create({
    fileId: file.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return {
    fileId: file.data.id,
    fileUrl: file.data.webViewLink || `https://drive.google.com/file/d/${file.data.id}/view`,
    fileName: file.data.name,
  };
}

// ============================================
// FILE RETRIEVAL
// ============================================

/**
 * Get file metadata
 * @param fileId - File ID
 * @returns File metadata
 */
export async function getFileMetadata(fileId: string): Promise<{
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: string;
  webViewLink: string;
}> {
  const driveClient = getDriveClient();

  const file = await driveClient.files.get({
    fileId,
    fields: 'id, name, mimeType, size, createdTime, webViewLink',
  });

  return {
    id: file.data.id,
    name: file.data.name,
    mimeType: file.data.mimeType,
    size: parseInt(file.data.size || '0', 10),
    createdTime: file.data.createdTime,
    webViewLink: file.data.webViewLink,
  };
}

/**
 * Download file from Google Drive
 * @param fileId - File ID
 * @returns File buffer
 */
export async function downloadFile(fileId: string): Promise<Buffer> {
  const driveClient = getDriveClient();

  const response = await driveClient.files.get(
    {
      fileId,
      alt: 'media',
    },
    { responseType: 'stream' }
  );

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    response.data.on('data', (chunk: Buffer) => chunks.push(chunk));
    response.data.on('end', () => resolve(Buffer.concat(chunks)));
    response.data.on('error', reject);
  });
}

/**
 * List all files in a quarter folder
 * @param taxYear - Tax year
 * @param quarter - Quarter
 * @returns Array of file metadata
 */
export async function listQuarterFiles(
  taxYear: string,
  quarter: string
): Promise<
  Array<{
    id: string;
    name: string;
    mimeType: string;
    createdTime: string;
  }>
> {
  const driveClient = getDriveClient();
  const folderId = await getOrCreateQuarterFolder(taxYear, quarter);

  const response = await driveClient.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id, name, mimeType, createdTime)',
    orderBy: 'createdTime desc',
  });

  return response.data.files || [];
}

// ============================================
// FILE DELETION
// ============================================

/**
 * Delete a file from Google Drive
 * @param fileId - File ID
 */
export async function deleteFile(fileId: string): Promise<void> {
  const driveClient = getDriveClient();

  await driveClient.files.delete({
    fileId,
  });
}

// ============================================
// FOLDER STRUCTURE INFO
// ============================================

/**
 * Get the complete folder structure
 * @returns Folder structure info
 */
export async function getFolderStructure(): Promise<{
  mainFolderId: string;
  mainFolderUrl: string;
}> {
  const driveClient = getDriveClient();
  const mainFolderId = await getOrCreateMainFolder();

  const folder = await driveClient.files.get({
    fileId: mainFolderId,
    fields: 'id, webViewLink',
  });

  return {
    mainFolderId: folder.data.id,
    mainFolderUrl:
      folder.data.webViewLink ||
      `https://drive.google.com/drive/folders/${folder.data.id}`,
  };
}
