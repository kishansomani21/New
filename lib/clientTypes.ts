export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  type: 'individual' | 'business';
  status: 'new' | 'pending_documents' | 'in_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  folderId?: string;
  folderUrl?: string;
  notes?: string;
}

export interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  category: DocumentCategory;
  required: boolean;
  received: boolean;
  receivedDate?: string;
  notes?: string;
}

export type DocumentCategory =
  | 'identity'
  | 'financial'
  | 'business'
  | 'legal'
  | 'compliance'
  | 'other';

export interface OnboardingChecklist {
  clientId: string;
  documents: RequiredDocument[];
  completedSteps: string[];
  pendingSteps: string[];
}

// Default document requirements for different client types
export const individualDocuments: RequiredDocument[] = [
  {
    id: 'passport',
    name: 'Passport or Government ID',
    description: 'Valid passport or government-issued photo ID',
    category: 'identity',
    required: true,
    received: false,
  },
  {
    id: 'proof_of_address',
    name: 'Proof of Address',
    description: 'Utility bill, bank statement, or official document showing address (within last 3 months)',
    category: 'identity',
    required: true,
    received: false,
  },
  {
    id: 'tax_id',
    name: 'Tax Identification Number',
    description: 'SSN, TIN, or equivalent tax ID',
    category: 'compliance',
    required: true,
    received: false,
  },
  {
    id: 'bank_statements',
    name: 'Bank Statements',
    description: 'Last 3 months of bank statements',
    category: 'financial',
    required: false,
    received: false,
  },
  {
    id: 'income_proof',
    name: 'Proof of Income',
    description: 'Pay stubs, tax returns, or employment letter',
    category: 'financial',
    required: false,
    received: false,
  },
  {
    id: 'signed_agreement',
    name: 'Signed Service Agreement',
    description: 'Signed copy of our service agreement',
    category: 'legal',
    required: true,
    received: false,
  },
  {
    id: 'w9_form',
    name: 'W-9 Form (US clients)',
    description: 'Request for Taxpayer Identification Number',
    category: 'compliance',
    required: false,
    received: false,
  },
];

export const businessDocuments: RequiredDocument[] = [
  {
    id: 'business_registration',
    name: 'Business Registration Certificate',
    description: 'Certificate of incorporation or business registration',
    category: 'business',
    required: true,
    received: false,
  },
  {
    id: 'articles_of_incorporation',
    name: 'Articles of Incorporation',
    description: 'Company formation documents',
    category: 'business',
    required: true,
    received: false,
  },
  {
    id: 'ein_document',
    name: 'EIN/Tax ID Document',
    description: 'IRS EIN confirmation letter or equivalent',
    category: 'compliance',
    required: true,
    received: false,
  },
  {
    id: 'ownership_structure',
    name: 'Ownership Structure',
    description: 'Document showing beneficial owners (25%+ ownership)',
    category: 'compliance',
    required: true,
    received: false,
  },
  {
    id: 'operating_agreement',
    name: 'Operating Agreement/Bylaws',
    description: 'LLC Operating Agreement or Corporate Bylaws',
    category: 'legal',
    required: false,
    received: false,
  },
  {
    id: 'owner_id',
    name: 'Owner/Director ID',
    description: 'Government-issued ID for each beneficial owner',
    category: 'identity',
    required: true,
    received: false,
  },
  {
    id: 'proof_of_business_address',
    name: 'Proof of Business Address',
    description: 'Utility bill, lease agreement, or official document',
    category: 'identity',
    required: true,
    received: false,
  },
  {
    id: 'bank_statements_business',
    name: 'Business Bank Statements',
    description: 'Last 3-6 months of business bank statements',
    category: 'financial',
    required: false,
    received: false,
  },
  {
    id: 'financial_statements',
    name: 'Financial Statements',
    description: 'Balance sheet, income statement, or audited financials',
    category: 'financial',
    required: false,
    received: false,
  },
  {
    id: 'business_license',
    name: 'Business License',
    description: 'Any required professional or business licenses',
    category: 'business',
    required: false,
    received: false,
  },
  {
    id: 'signed_agreement_business',
    name: 'Signed Service Agreement',
    description: 'Signed copy of our service agreement',
    category: 'legal',
    required: true,
    received: false,
  },
  {
    id: 'w9_form_business',
    name: 'W-9 Form',
    description: 'Request for Taxpayer Identification Number',
    category: 'compliance',
    required: true,
    received: false,
  },
];

export function getDefaultDocuments(clientType: 'individual' | 'business'): RequiredDocument[] {
  const docs = clientType === 'individual' ? individualDocuments : businessDocuments;
  return docs.map(doc => ({ ...doc })); // Return a copy
}

export interface CommunicationRecord {
  id: string;
  clientId: string;
  type: 'email_sent' | 'email_received' | 'call' | 'meeting' | 'note';
  subject: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface ClientOnboardingState {
  client: Client;
  checklist: OnboardingChecklist;
  communications: CommunicationRecord[];
  driveFolderId?: string;
  driveFolderUrl?: string;
}
