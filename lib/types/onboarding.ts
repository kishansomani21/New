// Client Onboarding Types

export interface ClientBasicInfo {
  name: string;
  email: string;
  phone: string;
}

export interface ClientDetailedInfo extends ClientBasicInfo {
  companyName?: string;
  address?: string;
  postcode?: string;
  businessType?: 'sole-trader' | 'limited-company' | 'partnership';

  // Tax registration details
  isPAYERegistered: boolean;
  isVATRegistered: boolean;
  isCISRegistered: boolean;

  // Tax identifiers
  utr?: string; // Unique Taxpayer Reference
  vatNumber?: string;
  payeReference?: string;
  authenticationCode?: string; // For HMRC agent authorization

  // Banking
  sortCode?: string;
  accountNumber?: string;

  // Additional info
  preferredContactMethod?: 'email' | 'phone' | 'post';
  notes?: string;
}

export interface OnboardingWorkflowStatus {
  clientId: string;
  status: 'initiated' | 'form-sent' | 'form-completed' | 'documents-sent' | 'completed' | 'failed';
  steps: {
    googleFormSent: boolean;
    formCompleted: boolean;
    form648Generated: boolean;
    engagementLetterSent: boolean;
    engagementLetterSigned: boolean;
    goCardlessLinkSent: boolean;
    googleContactAdded: boolean;
    googleSheetUpdated: boolean;
    brightPayCSVGenerated: boolean;
    vatAuthorizationRequested: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  errors?: string[];
}

export interface GoogleFormResponse {
  clientId: string;
  timestamp: string;
  responses: {
    [questionId: string]: string;
  };
}

export interface ZohoSignRequest {
  recipientName: string;
  recipientEmail: string;
  documentName: string;
  documentUrl?: string;
  documentBase64?: string;
}

export interface ZohoSignResponse {
  requestId: string;
  status: string;
  documentId: string;
  signingUrl: string;
}

export interface GoCardlessPaymentLink {
  url: string;
  linkId: string;
  customerId: string;
}

export interface BrightPayEmployee {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  niNumber?: string;
  payrollId: string;
  startDate: string;
  payFrequency: 'weekly' | 'monthly';
  grossPay: number;
  taxCode: string;
}

export interface HMRCAgentAuthRequest {
  clientId: string;
  service: 'HMRC-MTD-VAT' | 'HMRC-MTD-IT';
  clientIdType: 'vrn' | 'ni' | 'utr';
  clientIdentifier: string;
  knownFact?: string; // VAT registration date or postcode
}

export interface HMRCAgentAuthResponse {
  invitationId: string;
  arn: string; // Agent Reference Number
  service: string;
  clientId: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Expired';
  expiryDate: string;
  invitationLink: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}
