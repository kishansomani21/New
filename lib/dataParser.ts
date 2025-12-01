import { Client, RequiredDocument, CommunicationRecord, getDefaultDocuments } from './clientTypes';

export interface ParsedClientData {
  client: Partial<Client>;
  receivedDocuments: string[];
  pendingDocuments: string[];
  communications: Partial<CommunicationRecord>[];
  rawNotes: string;
  confidence: number;
}

// Common patterns for extracting information
const patterns = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
  name: /(?:name|client|customer|contact)[:\s]+([A-Za-z]+(?:\s+[A-Za-z]+)+)/gi,
  company: /(?:company|business|organization|firm|corp|llc|inc)[:\s]+([^\n,]+)/gi,
  date: /\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b/gi,
};

// Document keyword mappings
const documentKeywords: Record<string, string[]> = {
  passport: ['passport', 'id card', 'government id', 'photo id', 'drivers license', 'driver\'s license', 'state id'],
  proof_of_address: ['proof of address', 'utility bill', 'address verification', 'bank statement address', 'residence proof'],
  tax_id: ['tax id', 'ssn', 'social security', 'tin', 'tax identification', 'itin', 'ein'],
  bank_statements: ['bank statement', 'account statement', 'checking statement', 'savings statement'],
  income_proof: ['income proof', 'pay stub', 'paystub', 'salary slip', 'employment letter', 'tax return', 'w2', 'w-2'],
  signed_agreement: ['signed agreement', 'signed contract', 'service agreement', 'engagement letter'],
  w9_form: ['w9', 'w-9', 'taxpayer identification'],
  business_registration: ['business registration', 'certificate of incorporation', 'registration certificate', 'articles of organization'],
  articles_of_incorporation: ['articles of incorporation', 'formation documents', 'corporate charter'],
  ein_document: ['ein', 'employer identification', 'irs letter', 'ein confirmation'],
  ownership_structure: ['ownership structure', 'beneficial owner', 'ownership chart', 'cap table', 'shareholder list'],
  operating_agreement: ['operating agreement', 'bylaws', 'llc agreement', 'partnership agreement'],
  owner_id: ['owner id', 'director id', 'officer id', 'shareholder id'],
  proof_of_business_address: ['business address', 'office address', 'commercial lease', 'business utility'],
  bank_statements_business: ['business bank statement', 'corporate account statement', 'company bank statement'],
  financial_statements: ['financial statement', 'balance sheet', 'income statement', 'p&l', 'profit and loss', 'audited financials'],
  business_license: ['business license', 'professional license', 'trade license', 'operating license'],
};

// Status keywords
const statusKeywords = {
  received: ['received', 'got', 'have', 'submitted', 'sent', 'provided', 'uploaded', 'attached', 'done', '✓', '✅', 'complete'],
  pending: ['pending', 'waiting', 'need', 'missing', 'required', 'outstanding', 'not received', 'still need', '❌', '✗', 'incomplete'],
};

export function parseClientData(text: string): ParsedClientData {
  const result: ParsedClientData = {
    client: {},
    receivedDocuments: [],
    pendingDocuments: [],
    communications: [],
    rawNotes: text,
    confidence: 0,
  };

  let confidencePoints = 0;
  const maxPoints = 10;

  // Extract email
  const emails = text.match(patterns.email);
  if (emails && emails.length > 0) {
    result.client.email = emails[0];
    confidencePoints += 2;
  }

  // Extract phone
  const phones = text.match(patterns.phone);
  if (phones && phones.length > 0) {
    result.client.phone = phones[0];
    confidencePoints += 1;
  }

  // Extract name
  const nameMatches = text.matchAll(patterns.name);
  for (const match of nameMatches) {
    if (match[1] && match[1].length > 2) {
      result.client.name = match[1].trim();
      confidencePoints += 2;
      break;
    }
  }

  // Extract company
  const companyMatches = text.matchAll(patterns.company);
  for (const match of companyMatches) {
    if (match[1] && match[1].length > 1) {
      result.client.company = match[1].trim();
      result.client.type = 'business';
      confidencePoints += 1;
      break;
    }
  }

  // If no company found, assume individual
  if (!result.client.company) {
    result.client.type = 'individual';
  }

  // Parse document status
  const textLower = text.toLowerCase();
  const lines = text.split('\n');

  for (const [docId, keywords] of Object.entries(documentKeywords)) {
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      const keywordIndex = textLower.indexOf(keywordLower);

      if (keywordIndex !== -1) {
        // Find the line containing this keyword
        const lineContainingKeyword = lines.find(line =>
          line.toLowerCase().includes(keywordLower)
        );

        if (lineContainingKeyword) {
          const lineLower = lineContainingKeyword.toLowerCase();

          // Check if it's marked as received or pending
          const isReceived = statusKeywords.received.some(word =>
            lineLower.includes(word.toLowerCase())
          );
          const isPending = statusKeywords.pending.some(word =>
            lineLower.includes(word.toLowerCase())
          );

          if (isReceived && !isPending) {
            if (!result.receivedDocuments.includes(docId)) {
              result.receivedDocuments.push(docId);
              confidencePoints += 0.5;
            }
          } else if (isPending || (!isReceived && !isPending)) {
            // If neither received nor pending is mentioned, assume pending
            if (!result.pendingDocuments.includes(docId)) {
              result.pendingDocuments.push(docId);
              confidencePoints += 0.3;
            }
          }
        }
        break; // Found a matching keyword, no need to check others for this doc
      }
    }
  }

  // Parse any communication references
  const emailSentMatch = text.match(/(?:sent|emailed|wrote)(?:\s+on)?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})?/gi);
  if (emailSentMatch) {
    emailSentMatch.forEach(match => {
      const dateMatch = match.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/);
      result.communications.push({
        type: 'email_sent',
        subject: 'Email communication',
        timestamp: dateMatch ? dateMatch[0] : new Date().toISOString(),
      });
    });
    confidencePoints += 1;
  }

  result.confidence = Math.min(confidencePoints / maxPoints, 1);

  return result;
}

export function analyzeDocumentStatus(
  parsedData: ParsedClientData,
  clientType: 'individual' | 'business'
): {
  receivedDocs: RequiredDocument[];
  pendingDocs: RequiredDocument[];
  progress: number;
} {
  const defaultDocs = getDefaultDocuments(clientType);

  const receivedDocs: RequiredDocument[] = [];
  const pendingDocs: RequiredDocument[] = [];

  for (const doc of defaultDocs) {
    if (parsedData.receivedDocuments.includes(doc.id)) {
      receivedDocs.push({ ...doc, received: true, receivedDate: new Date().toISOString() });
    } else {
      pendingDocs.push({ ...doc, received: false });
    }
  }

  const requiredDocs = defaultDocs.filter(d => d.required);
  const receivedRequired = receivedDocs.filter(d => d.required);
  const progress = requiredDocs.length > 0 ? receivedRequired.length / requiredDocs.length : 0;

  return {
    receivedDocs,
    pendingDocs,
    progress,
  };
}

export function extractFollowUpNeeds(parsedData: ParsedClientData): string[] {
  const needs: string[] = [];

  // Check for missing required documents
  const pendingRequired = parsedData.pendingDocuments.filter(docId => {
    // These are always required
    const requiredIds = ['passport', 'proof_of_address', 'tax_id', 'signed_agreement',
      'business_registration', 'articles_of_incorporation', 'ein_document',
      'ownership_structure', 'owner_id', 'proof_of_business_address', 'w9_form_business'];
    return requiredIds.includes(docId);
  });

  if (pendingRequired.length > 0) {
    needs.push(`Follow up on ${pendingRequired.length} missing required document(s)`);
  }

  // Check for client info gaps
  if (!parsedData.client.email) {
    needs.push('Obtain client email address');
  }
  if (!parsedData.client.name) {
    needs.push('Confirm client full legal name');
  }

  return needs;
}

export function generateSummary(parsedData: ParsedClientData): string {
  const { client, receivedDocuments, pendingDocuments, confidence } = parsedData;

  let summary = '## Client Data Summary\n\n';

  if (confidence < 0.3) {
    summary += '⚠️ **Low confidence in parsed data.** Please verify manually.\n\n';
  }

  summary += '### Client Information\n';
  summary += `- **Name:** ${client.name || 'Not found'}\n`;
  summary += `- **Email:** ${client.email || 'Not found'}\n`;
  summary += `- **Phone:** ${client.phone || 'Not found'}\n`;
  summary += `- **Company:** ${client.company || 'N/A'}\n`;
  summary += `- **Type:** ${client.type || 'Unknown'}\n\n`;

  summary += '### Document Status\n';
  summary += `✅ **Received (${receivedDocuments.length}):** ${receivedDocuments.join(', ') || 'None'}\n`;
  summary += `⏳ **Pending (${pendingDocuments.length}):** ${pendingDocuments.join(', ') || 'None'}\n\n`;

  const progress = receivedDocuments.length / (receivedDocuments.length + pendingDocuments.length) * 100 || 0;
  summary += `### Progress: ${progress.toFixed(0)}%\n`;

  return summary;
}
