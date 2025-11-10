import fs from 'fs';
import path from 'path';

// Data directory for storing user information
const DATA_DIR = path.join(process.cwd(), 'data');

export interface UserAccount {
  userId: string;
  accountId: string;
  provider: 'plaid' | 'gocardless' | 'truelayer';
  accessToken: string;
  sheetId: string;
  sheetUrl: string;
  accountName: string;
  createdAt: string;
  lastSync?: string;
}

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Get the file path for a user's data
function getUserFilePath(userId: string): string {
  return path.join(DATA_DIR, `${userId}.json`);
}

// Save user account data
export function saveUserAccount(account: UserAccount): void {
  ensureDataDir();
  const filePath = getUserFilePath(account.userId);

  let userData: UserAccount[] = [];

  // Load existing data if file exists
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    userData = JSON.parse(fileContent);
  }

  // Check if account already exists and update it, otherwise add new
  const existingIndex = userData.findIndex(
    acc => acc.accountId === account.accountId
  );

  if (existingIndex >= 0) {
    userData[existingIndex] = account;
  } else {
    userData.push(account);
  }

  fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
}

// Get user account by accountId
export function getUserAccount(userId: string, accountId: string): UserAccount | null {
  const filePath = getUserFilePath(userId);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const userData: UserAccount[] = JSON.parse(fileContent);

  return userData.find(acc => acc.accountId === accountId) || null;
}

// Get all accounts for a user
export function getAllUserAccounts(userId: string): UserAccount[] {
  const filePath = getUserFilePath(userId);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

// Update last sync time
export function updateLastSync(userId: string, accountId: string): void {
  const filePath = getUserFilePath(userId);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const userData: UserAccount[] = JSON.parse(fileContent);

  const accountIndex = userData.findIndex(acc => acc.accountId === accountId);

  if (accountIndex >= 0) {
    userData[accountIndex].lastSync = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
  }
}

// Delete user account
export function deleteUserAccount(userId: string, accountId: string): void {
  const filePath = getUserFilePath(userId);

  if (!fs.existsSync(filePath)) {
    return;
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  let userData: UserAccount[] = JSON.parse(fileContent);

  userData = userData.filter(acc => acc.accountId !== accountId);

  if (userData.length === 0) {
    fs.unlinkSync(filePath);
  } else {
    fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
  }
}
