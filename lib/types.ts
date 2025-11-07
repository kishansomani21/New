// Types for the Client Information Collection App

export type UserRole = 'admin' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface InfoRequest {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'in_progress';
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

export interface UploadedFile {
  id: string;
  requestId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: Date;
  filePath: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'upload' | 'request' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  relatedRequestId?: string;
  relatedFileId?: string;
}
