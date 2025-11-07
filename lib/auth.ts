import bcrypt from 'bcryptjs';
import { db, User } from './db';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  userType: 'WORKER' | 'COMPANY',
  additionalData?: { companyName?: string; phone?: string }
): Promise<{ success: boolean; user?: User; error?: string }> {
  // Check if user already exists
  const existingUser = db.findUserByEmail(email);
  if (existingUser) {
    return { success: false, error: 'Email already registered' };
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = db.createUser({
    email,
    password: hashedPassword,
    name,
    userType,
    phone: additionalData?.phone,
  });

  // Create corresponding profile
  if (userType === 'WORKER') {
    db.createWorkerProfile({
      userId: user.id,
      available: true,
      profileViews: 0,
      contactPurchases: 0,
      averageRating: 0,
    });
  } else if (userType === 'COMPANY') {
    db.createCompanyProfile({
      userId: user.id,
      companyName: additionalData?.companyName || name,
      points: 0,
      totalReviews: 0,
    });
  }

  return { success: true, user };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const user = db.findUserByEmail(email);

  if (!user) {
    return { success: false, error: 'Invalid credentials' };
  }

  const isValidPassword = await verifyPassword(password, user.password);

  if (!isValidPassword) {
    return { success: false, error: 'Invalid credentials' };
  }

  return { success: true, user };
}
