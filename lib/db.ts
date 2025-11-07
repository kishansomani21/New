// Simple JSON-based database for MVP
// This can be replaced with Prisma/real DB later

import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  userType: 'WORKER' | 'COMPANY';
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  bio?: string;
  location?: string;
  hourlyRate?: number;
  available: boolean;
  profileViews: number;
  contactPurchases: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  industry?: string;
  description?: string;
  website?: string;
  logo?: string;
  points: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  createdAt: string;
}

export interface WorkerSkill {
  id: string;
  workerId: string;
  skillId: string;
  yearsExperience: number;
  verified: boolean;
  createdAt: string;
}

export interface EmploymentHistory {
  id: string;
  workerId: string;
  companyId: string;
  jobTitle: string;
  description?: string;
  status: 'CURRENT' | 'PAST';
  signedInAt: string;
  signedOutAt?: string;
  signedInBy: string;
  signedOutBy?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  workerId: string;
  companyId: string;
  rating: number;
  comment?: string;
  workQuality?: number;
  reliability?: number;
  communication?: number;
  pointsAwarded: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactPurchase {
  id: string;
  companyId: string;
  workerId: string;
  basePrice: number;
  discountApplied: number;
  finalPrice: number;
  pointsUsed: number;
  phoneAccess: boolean;
  emailAccess: boolean;
  createdAt: string;
}

export interface Database {
  users: User[];
  workerProfiles: WorkerProfile[];
  companyProfiles: CompanyProfile[];
  skills: Skill[];
  workerSkills: WorkerSkill[];
  employmentHistory: EmploymentHistory[];
  reviews: Review[];
  contactPurchases: ContactPurchase[];
}

// Initialize database
function initDB(): Database {
  const dataDir = path.join(process.cwd(), 'data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialDB: Database = {
      users: [],
      workerProfiles: [],
      companyProfiles: [],
      skills: [],
      workerSkills: [],
      employmentHistory: [],
      reviews: [],
      contactPurchases: [],
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }

  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// Read database
export function readDB(): Database {
  try {
    return initDB();
  } catch (error) {
    console.error('Error reading database:', error);
    return initDB();
  }
}

// Write database
export function writeDB(data: Database): void {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Generate UUID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Helper functions for common operations
export const db = {
  // Users
  findUserByEmail: (email: string): User | undefined => {
    const data = readDB();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById: (id: string): User | undefined => {
    const data = readDB();
    return data.users.find(u => u.id === id);
  },

  createUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
    const data = readDB();
    const newUser: User = {
      ...user,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    writeDB(data);
    return newUser;
  },

  // Worker Profiles
  findWorkerProfileByUserId: (userId: string): WorkerProfile | undefined => {
    const data = readDB();
    return data.workerProfiles.find(wp => wp.userId === userId);
  },

  createWorkerProfile: (profile: Omit<WorkerProfile, 'id' | 'createdAt' | 'updatedAt'>): WorkerProfile => {
    const data = readDB();
    const newProfile: WorkerProfile = {
      ...profile,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.workerProfiles.push(newProfile);
    writeDB(data);
    return newProfile;
  },

  getAllWorkerProfiles: (): WorkerProfile[] => {
    const data = readDB();
    return data.workerProfiles;
  },

  updateWorkerProfile: (id: string, updates: Partial<WorkerProfile>): WorkerProfile | undefined => {
    const data = readDB();
    const index = data.workerProfiles.findIndex(wp => wp.id === id);
    if (index === -1) return undefined;

    data.workerProfiles[index] = {
      ...data.workerProfiles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDB(data);
    return data.workerProfiles[index];
  },

  // Company Profiles
  findCompanyProfileByUserId: (userId: string): CompanyProfile | undefined => {
    const data = readDB();
    return data.companyProfiles.find(cp => cp.userId === userId);
  },

  findCompanyProfileById: (id: string): CompanyProfile | undefined => {
    const data = readDB();
    return data.companyProfiles.find(cp => cp.id === id);
  },

  createCompanyProfile: (profile: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>): CompanyProfile => {
    const data = readDB();
    const newProfile: CompanyProfile = {
      ...profile,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.companyProfiles.push(newProfile);
    writeDB(data);
    return newProfile;
  },

  updateCompanyProfile: (id: string, updates: Partial<CompanyProfile>): CompanyProfile | undefined => {
    const data = readDB();
    const index = data.companyProfiles.findIndex(cp => cp.id === id);
    if (index === -1) return undefined;

    data.companyProfiles[index] = {
      ...data.companyProfiles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDB(data);
    return data.companyProfiles[index];
  },

  // Skills
  findSkillByName: (name: string): Skill | undefined => {
    const data = readDB();
    return data.skills.find(s => s.name.toLowerCase() === name.toLowerCase());
  },

  findSkillById: (id: string): Skill | undefined => {
    const data = readDB();
    return data.skills.find(s => s.id === id);
  },

  getAllSkills: (): Skill[] => {
    const data = readDB();
    return data.skills;
  },

  createSkill: (skill: Omit<Skill, 'id' | 'createdAt'>): Skill => {
    const data = readDB();
    const newSkill: Skill = {
      ...skill,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    data.skills.push(newSkill);
    writeDB(data);
    return newSkill;
  },

  // Worker Skills
  getWorkerSkills: (workerId: string): WorkerSkill[] => {
    const data = readDB();
    return data.workerSkills.filter(ws => ws.workerId === workerId);
  },

  addWorkerSkill: (workerSkill: Omit<WorkerSkill, 'id' | 'createdAt'>): WorkerSkill => {
    const data = readDB();
    const newWorkerSkill: WorkerSkill = {
      ...workerSkill,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    data.workerSkills.push(newWorkerSkill);
    writeDB(data);
    return newWorkerSkill;
  },

  // Employment History
  getWorkerEmploymentHistory: (workerId: string): EmploymentHistory[] => {
    const data = readDB();
    return data.employmentHistory.filter(eh => eh.workerId === workerId);
  },

  createEmploymentHistory: (employment: Omit<EmploymentHistory, 'id' | 'createdAt' | 'updatedAt'>): EmploymentHistory => {
    const data = readDB();
    const newEmployment: EmploymentHistory = {
      ...employment,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.employmentHistory.push(newEmployment);
    writeDB(data);
    return newEmployment;
  },

  updateEmploymentHistory: (id: string, updates: Partial<EmploymentHistory>): EmploymentHistory | undefined => {
    const data = readDB();
    const index = data.employmentHistory.findIndex(eh => eh.id === id);
    if (index === -1) return undefined;

    data.employmentHistory[index] = {
      ...data.employmentHistory[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    writeDB(data);
    return data.employmentHistory[index];
  },

  // Reviews
  getWorkerReviews: (workerId: string): Review[] => {
    const data = readDB();
    return data.reviews.filter(r => r.workerId === workerId);
  },

  createReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Review => {
    const data = readDB();
    const newReview: Review = {
      ...review,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.reviews.push(newReview);
    writeDB(data);
    return newReview;
  },

  // Contact Purchases
  createContactPurchase: (purchase: Omit<ContactPurchase, 'id' | 'createdAt'>): ContactPurchase => {
    const data = readDB();
    const newPurchase: ContactPurchase = {
      ...purchase,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    data.contactPurchases.push(newPurchase);
    writeDB(data);
    return newPurchase;
  },

  hasCompanyPurchasedContact: (companyId: string, workerId: string): boolean => {
    const data = readDB();
    return data.contactPurchases.some(
      cp => cp.companyId === companyId && cp.workerId === workerId
    );
  },
};
