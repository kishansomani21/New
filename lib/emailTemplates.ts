import { Client, RequiredDocument, DocumentCategory } from './clientTypes';

export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface EmailGenerationOptions {
  client: Client;
  companyName?: string;
  senderName?: string;
  senderTitle?: string;
  senderEmail?: string;
  customMessage?: string;
}

const DEFAULT_COMPANY_NAME = 'Our Company';
const DEFAULT_SENDER_NAME = 'The Onboarding Team';

function getGreeting(client: Client): string {
  const hour = new Date().getHours();
  let greeting = 'Hello';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  return `${greeting} ${client.name.split(' ')[0]}`;
}

function formatDocumentList(documents: RequiredDocument[]): string {
  const byCategory = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<DocumentCategory, RequiredDocument[]>);

  const categoryNames: Record<DocumentCategory, string> = {
    identity: 'Identity Documents',
    financial: 'Financial Documents',
    business: 'Business Documents',
    legal: 'Legal Documents',
    compliance: 'Compliance & KYC',
    other: 'Other Documents',
  };

  let list = '';
  for (const [category, docs] of Object.entries(byCategory)) {
    list += `\n**${categoryNames[category as DocumentCategory]}:**\n`;
    docs.forEach(doc => {
      const requiredBadge = doc.required ? ' (Required)' : ' (Optional)';
      list += `- ${doc.name}${requiredBadge}\n`;
      list += `  ${doc.description}\n`;
    });
  }

  return list;
}

export function generateWelcomeEmail(
  options: EmailGenerationOptions,
  pendingDocuments: RequiredDocument[],
  folderUrl?: string
): EmailTemplate {
  const { client, companyName = DEFAULT_COMPANY_NAME, senderName = DEFAULT_SENDER_NAME } = options;
  const greeting = getGreeting(client);

  const requiredDocs = pendingDocuments.filter(d => d.required);
  const optionalDocs = pendingDocuments.filter(d => !d.required);

  let body = `${greeting},

Welcome to ${companyName}! We're excited to begin working with you and want to make your onboarding process as smooth as possible.

To get started, we'll need you to provide some documentation. Below is a list of what we need:

**Required Documents:**
${requiredDocs.map(doc => `- ${doc.name}: ${doc.description}`).join('\n')}
`;

  if (optionalDocs.length > 0) {
    body += `
**Optional (but helpful) Documents:**
${optionalDocs.map(doc => `- ${doc.name}: ${doc.description}`).join('\n')}
`;
  }

  if (folderUrl) {
    body += `
**How to Submit Your Documents:**
We've created a secure folder for you to upload your documents:
${folderUrl}

Simply upload your files to the appropriate subfolder, and we'll be notified automatically.
`;
  } else {
    body += `
**How to Submit Your Documents:**
You can reply to this email with your documents attached, or let us know if you'd prefer a secure upload link.
`;
  }

  body += `
If you have any questions about any of these requirements, please don't hesitate to reach out. We're here to help!

Best regards,
${senderName}
${companyName}`;

  return {
    subject: `Welcome to ${companyName} - Getting Started with Your Onboarding`,
    body,
  };
}

export function generateFollowUpEmail(
  options: EmailGenerationOptions,
  pendingDocuments: RequiredDocument[],
  daysSinceLastContact: number,
  folderUrl?: string
): EmailTemplate {
  const { client, companyName = DEFAULT_COMPANY_NAME, senderName = DEFAULT_SENDER_NAME } = options;
  const greeting = getGreeting(client);

  const requiredPending = pendingDocuments.filter(d => d.required);
  const optionalPending = pendingDocuments.filter(d => !d.required);

  let urgencyLevel = 'gentle';
  if (daysSinceLastContact > 14) urgencyLevel = 'firm';
  if (daysSinceLastContact > 30) urgencyLevel = 'urgent';

  let openingLine = '';
  switch (urgencyLevel) {
    case 'gentle':
      openingLine = `I hope this message finds you well. I wanted to follow up on your onboarding process and see if there's anything we can help with.`;
      break;
    case 'firm':
      openingLine = `I'm reaching out as we haven't received some of the required documentation for your account. We'd love to help move things forward.`;
      break;
    case 'urgent':
      openingLine = `This is an important follow-up regarding your pending onboarding. We're still missing some critical documents and want to ensure we can proceed with your account.`;
      break;
  }

  let body = `${greeting},

${openingLine}

**Still Needed (Required):**
${requiredPending.length > 0 ? requiredPending.map(doc => `- ${doc.name}`).join('\n') : '- None! All required documents received.'}
`;

  if (optionalPending.length > 0 && urgencyLevel === 'gentle') {
    body += `
**Still Needed (Optional):**
${optionalPending.map(doc => `- ${doc.name}`).join('\n')}
`;
  }

  if (folderUrl) {
    body += `
You can upload your documents to your secure folder:
${folderUrl}
`;
  }

  body += `
If you're having trouble obtaining any of these documents, or if there's anything unclear, please let me know. I'm happy to discuss alternatives or answer any questions.
`;

  if (urgencyLevel === 'urgent') {
    body += `
**Please note:** We need to receive the required documents within the next 7 business days to keep your onboarding on track.
`;
  }

  body += `
Best regards,
${senderName}
${companyName}`;

  const subjectPrefix = urgencyLevel === 'urgent' ? '[Action Required] ' : '';
  return {
    subject: `${subjectPrefix}Following Up on Your Onboarding - ${companyName}`,
    body,
  };
}

export function generateThankYouEmail(
  options: EmailGenerationOptions,
  receivedDocuments: RequiredDocument[]
): EmailTemplate {
  const { client, companyName = DEFAULT_COMPANY_NAME, senderName = DEFAULT_SENDER_NAME } = options;
  const greeting = getGreeting(client);

  const body = `${greeting},

Thank you for submitting your documents! We've received the following:

${receivedDocuments.map(doc => `- ${doc.name}`).join('\n')}

Our team will review these documents and get back to you shortly. The review process typically takes 2-3 business days.

If we need any additional information or have questions, we'll reach out. Otherwise, you can expect to hear from us once the review is complete.

Thank you for your patience!

Best regards,
${senderName}
${companyName}`;

  return {
    subject: `Documents Received - Thank You! - ${companyName}`,
    body,
  };
}

export function generateCompletionEmail(
  options: EmailGenerationOptions
): EmailTemplate {
  const { client, companyName = DEFAULT_COMPANY_NAME, senderName = DEFAULT_SENDER_NAME } = options;
  const greeting = getGreeting(client);

  const body = `${greeting},

Great news! Your onboarding process is now complete, and your account has been fully approved.

**What happens next:**
- Your account is now active and ready to use
- You should have received separate credentials for accessing our services
- Our team is available to assist you with any questions as you get started

We're thrilled to have you on board and look forward to working with you!

If you have any questions or need assistance, please don't hesitate to reach out.

Welcome to ${companyName}!

Best regards,
${senderName}
${companyName}`;

  return {
    subject: `Congratulations! Your Onboarding is Complete - ${companyName}`,
    body,
  };
}

export function generateCustomEmail(
  options: EmailGenerationOptions,
  customSubject: string,
  customBody: string
): EmailTemplate {
  const { client, companyName = DEFAULT_COMPANY_NAME, senderName = DEFAULT_SENDER_NAME } = options;
  const greeting = getGreeting(client);

  const body = `${greeting},

${customBody}

Best regards,
${senderName}
${companyName}`;

  return {
    subject: customSubject,
    body,
  };
}

export function generateDocumentRequestEmail(
  options: EmailGenerationOptions,
  specificDocuments: RequiredDocument[],
  reason?: string
): EmailTemplate {
  const { client, companyName = DEFAULT_COMPANY_NAME, senderName = DEFAULT_SENDER_NAME } = options;
  const greeting = getGreeting(client);

  let body = `${greeting},

${reason || 'To continue with your onboarding process, we need the following additional documentation:'}

**Documents Needed:**
${specificDocuments.map(doc => `- **${doc.name}**: ${doc.description}`).join('\n')}

Please submit these documents at your earliest convenience. If you have any questions about these requirements, feel free to reach out.

Best regards,
${senderName}
${companyName}`;

  return {
    subject: `Additional Documents Needed - ${companyName}`,
    body,
  };
}
