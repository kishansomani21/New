import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  addUploadedFile,
  getInfoRequestById,
  updateInfoRequest,
  addNotification,
  getUsers,
} from '@/lib/storage';
import { UploadedFile, Notification } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const requestId = formData.get('requestId') as string;
    const uploadedBy = formData.get('uploadedBy') as string;

    if (!file || !requestId || !uploadedBy) {
      return NextResponse.json(
        { error: 'File, request ID, and uploader ID are required' },
        { status: 400 }
      );
    }

    // Verify request exists
    const requestData = getInfoRequestById(requestId);
    if (!requestData) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileId = uuidv4();
    const fileExtension = path.extname(file.name);
    const fileName = `${fileId}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save file metadata
    const uploadedFile: UploadedFile = {
      id: fileId,
      requestId,
      fileName,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedBy,
      uploadedAt: new Date(),
      filePath: `/uploads/${fileName}`,
    };

    addUploadedFile(uploadedFile);

    // Update request status to in_progress if it was pending
    if (requestData.status === 'pending') {
      updateInfoRequest(requestId, { status: 'in_progress' });
    }

    // Create notification for admin users
    const adminUsers = getUsers().filter(u => u.role === 'admin');
    adminUsers.forEach(admin => {
      const notification: Notification = {
        id: uuidv4(),
        userId: admin.id,
        type: 'upload',
        title: 'New File Uploaded',
        message: `${requestData.clientName} uploaded a file for "${requestData.title}"`,
        read: false,
        createdAt: new Date(),
        relatedRequestId: requestId,
        relatedFileId: fileId,
      };
      addNotification(notification);
    });

    return NextResponse.json({
      success: true,
      file: uploadedFile,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
