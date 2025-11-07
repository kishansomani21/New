// Simple in-memory storage (replace with database in production)

import { User, InfoRequest, UploadedFile, Notification } from './types';

// In-memory data stores
const users: User[] = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: new Date(),
  },
  {
    id: 'client-1',
    name: 'John Client',
    email: 'john@example.com',
    role: 'client',
    createdAt: new Date(),
  },
  {
    id: 'client-2',
    name: 'Jane Client',
    email: 'jane@example.com',
    role: 'client',
    createdAt: new Date(),
  },
];

const infoRequests: InfoRequest[] = [];
const uploadedFiles: UploadedFile[] = [];
const notifications: Notification[] = [];

// User operations
export const getUsers = () => users;
export const getUserById = (id: string) => users.find(u => u.id === id);
export const getUserByEmail = (email: string) => users.find(u => u.email === email);
export const getClientUsers = () => users.filter(u => u.role === 'client');
export const addUser = (user: User) => users.push(user);

// Info Request operations
export const getInfoRequests = () => infoRequests;
export const getInfoRequestById = (id: string) => infoRequests.find(r => r.id === id);
export const getInfoRequestsByClient = (clientId: string) =>
  infoRequests.filter(r => r.clientId === clientId);
export const addInfoRequest = (request: InfoRequest) => infoRequests.push(request);
export const updateInfoRequest = (id: string, updates: Partial<InfoRequest>) => {
  const index = infoRequests.findIndex(r => r.id === id);
  if (index !== -1) {
    infoRequests[index] = { ...infoRequests[index], ...updates, updatedAt: new Date() };
    return infoRequests[index];
  }
  return null;
};

// File operations
export const getUploadedFiles = () => uploadedFiles;
export const getUploadedFileById = (id: string) => uploadedFiles.find(f => f.id === id);
export const getUploadedFilesByRequest = (requestId: string) =>
  uploadedFiles.filter(f => f.requestId === requestId);
export const addUploadedFile = (file: UploadedFile) => uploadedFiles.push(file);

// Notification operations
export const getNotifications = () => notifications;
export const getNotificationsByUser = (userId: string) =>
  notifications.filter(n => n.userId === userId).sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime()
  );
export const getUnreadNotificationsByUser = (userId: string) =>
  notifications.filter(n => n.userId === userId && !n.read);
export const addNotification = (notification: Notification) => notifications.push(notification);
export const markNotificationAsRead = (id: string) => {
  const notification = notifications.find(n => n.id === id);
  if (notification) {
    notification.read = true;
    return notification;
  }
  return null;
};
export const markAllNotificationsAsRead = (userId: string) => {
  notifications.forEach(n => {
    if (n.userId === userId) {
      n.read = true;
    }
  });
};
