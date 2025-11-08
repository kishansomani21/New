import { ClientBasicInfo, ClientDetailedInfo, OnboardingWorkflowStatus } from '../types/onboarding';
import { sendGoogleFormEmail, sendEngagementLetterEmail, sendGoCardlessEmail, sendMissingInfoRequest } from '../services/gmail';
import { addClientToContacts } from '../services/googleContacts';
import { addClientToSheet, updateClientWorkflowStatus } from '../services/clientSheets';
import { sendDocumentForSignature } from '../services/zohoSign';
import { createGoCardlessCustomer, createPaymentLink } from '../services/goCardless';
import { fill648Form, createEngagementLetter } from '../services/pdfFiller';
import { generateSingleClientBrightPayCSV } from '../services/brightPay';
import { createVATAgentAuthorization } from '../services/hmrcAgent';
import { v4 as uuidv4 } from 'crypto';

// Generate unique client ID
function generateClientId(): string {
  return `CLIENT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

// Step 1: Initialize onboarding with basic info
export async function initiateOnboarding(basicInfo: ClientBasicInfo): Promise<{
  success: boolean;
  clientId?: string;
  workflowStatus?: OnboardingWorkflowStatus;
  error?: string;
}> {
  try {
    const clientId = generateClientId();

    // Create initial workflow status
    const workflowStatus: OnboardingWorkflowStatus = {
      clientId,
      status: 'initiated',
      steps: {
        googleFormSent: false,
        formCompleted: false,
        form648Generated: false,
        engagementLetterSent: false,
        engagementLetterSigned: false,
        goCardlessLinkSent: false,
        googleContactAdded: false,
        googleSheetUpdated: false,
        brightPayCSVGenerated: false,
        vatAuthorizationRequested: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Send Google Form to collect detailed information
    const googleFormUrl = process.env.GOOGLE_FORM_URL || 'https://forms.google.com/YOUR_FORM_ID';

    // Append client ID to form URL as prefill
    const formUrlWithClientId = `${googleFormUrl}?entry.CLIENT_ID=${clientId}`;

    const emailResult = await sendGoogleFormEmail(
      basicInfo.name,
      basicInfo.email,
      formUrlWithClientId
    );

    if (!emailResult.success) {
      return {
        success: false,
        error: `Failed to send Google Form: ${emailResult.error}`,
      };
    }

    // Update workflow status
    workflowStatus.steps.googleFormSent = true;
    workflowStatus.status = 'form-sent';
    workflowStatus.updatedAt = new Date();

    // Add to Google Sheets
    const tempClient: ClientDetailedInfo = {
      ...basicInfo,
      isPAYERegistered: false,
      isVATRegistered: false,
      isCISRegistered: false,
    };

    await addClientToSheet(tempClient, workflowStatus);
    workflowStatus.steps.googleSheetUpdated = true;

    return {
      success: true,
      clientId,
      workflowStatus,
    };
  } catch (error: any) {
    console.error('Error initiating onboarding:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Step 2: Process Google Form response
export async function processFormResponse(
  clientId: string,
  detailedInfo: ClientDetailedInfo
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const workflowStatus: OnboardingWorkflowStatus = {
      clientId,
      status: 'form-completed',
      steps: {
        googleFormSent: true,
        formCompleted: true,
        form648Generated: false,
        engagementLetterSent: false,
        engagementLetterSigned: false,
        goCardlessLinkSent: false,
        googleContactAdded: false,
        googleSheetUpdated: true,
        brightPayCSVGenerated: false,
        vatAuthorizationRequested: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 1. Add to Google Contacts
    const contactResult = await addClientToContacts(detailedInfo);
    if (contactResult.success) {
      workflowStatus.steps.googleContactAdded = true;
    }

    // 2. Update Google Sheets with full info
    await updateClientWorkflowStatus(clientId, workflowStatus);

    // 3. Generate 64-8 form
    const form648Result = await fill648Form(detailedInfo);
    if (form648Result.success) {
      workflowStatus.steps.form648Generated = true;
    }

    // 4. Generate and send engagement letter via Zoho Sign
    const engagementLetterResult = await createEngagementLetter(detailedInfo);

    if (engagementLetterResult.success && engagementLetterResult.pdfBuffer) {
      const zohoResult = await sendDocumentForSignature({
        recipientName: detailedInfo.name,
        recipientEmail: detailedInfo.email,
        documentName: `Engagement Letter - ${detailedInfo.name}`,
        documentBase64: engagementLetterResult.pdfBuffer.toString('base64'),
      });

      if (zohoResult.success && zohoResult.data) {
        // Send email notification
        await sendEngagementLetterEmail(
          detailedInfo.name,
          detailedInfo.email,
          zohoResult.data.signingUrl
        );

        workflowStatus.steps.engagementLetterSent = true;
        workflowStatus.status = 'documents-sent';
      }
    }

    // 5. Create GoCardless payment link
    const gcCustomerResult = await createGoCardlessCustomer(
      detailedInfo.name,
      detailedInfo.email,
      detailedInfo.companyName
    );

    if (gcCustomerResult.success && gcCustomerResult.customerId) {
      const paymentLinkResult = await createPaymentLink(
        gcCustomerResult.customerId,
        detailedInfo.name
      );

      if (paymentLinkResult.success && paymentLinkResult.data) {
        await sendGoCardlessEmail(
          detailedInfo.name,
          detailedInfo.email,
          paymentLinkResult.data.url
        );

        workflowStatus.steps.goCardlessLinkSent = true;
      }
    }

    // 6. Generate BrightPay CSV if PAYE registered
    if (detailedInfo.isPAYERegistered) {
      const csvResult = await generateSingleClientBrightPayCSV(detailedInfo);
      if (csvResult.success) {
        workflowStatus.steps.brightPayCSVGenerated = true;
        // CSV is saved in temp folder for manual upload
      }
    }

    // 7. Request VAT agent authorization if VAT registered
    if (detailedInfo.isVATRegistered && detailedInfo.vatNumber) {
      // Check if we have the VAT registration date
      // For now, we'll skip this if we don't have all required info
      // In production, you'd collect this in the Google Form
      const vatRegDate = '2020-01-01'; // Placeholder - should come from form

      const vatAuthResult = await createVATAgentAuthorization(
        detailedInfo.vatNumber,
        vatRegDate,
        detailedInfo.email
      );

      if (vatAuthResult.success) {
        workflowStatus.steps.vatAuthorizationRequested = true;
      }
    }

    // 8. Check for missing information
    const missingFields = checkMissingFields(detailedInfo);
    if (missingFields.length > 0) {
      await sendMissingInfoRequest(
        detailedInfo.name,
        detailedInfo.email,
        missingFields
      );
    }

    // Update final workflow status
    workflowStatus.updatedAt = new Date();
    await updateClientWorkflowStatus(clientId, workflowStatus);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error processing form response:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Helper: Check for missing required fields
function checkMissingFields(client: ClientDetailedInfo): string[] {
  const missing: string[] = [];

  if (!client.utr) {
    missing.push('UTR (Unique Taxpayer Reference)');
  }

  if (client.isPAYERegistered && !client.payeReference) {
    missing.push('PAYE Reference Number');
  }

  if (client.isVATRegistered && !client.vatNumber) {
    missing.push('VAT Registration Number');
  }

  if (!client.address || !client.postcode) {
    missing.push('Complete Address with Postcode');
  }

  if (!client.authenticationCode) {
    missing.push('HMRC Authentication Code (for agent authorization)');
  }

  return missing;
}

// Webhook handler for Zoho Sign completion
export async function handleEngagementLetterSigned(
  clientId: string,
  zohoRequestId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const workflowStatus: OnboardingWorkflowStatus = {
      clientId,
      status: 'completed',
      steps: {
        googleFormSent: true,
        formCompleted: true,
        form648Generated: true,
        engagementLetterSent: true,
        engagementLetterSigned: true,
        goCardlessLinkSent: true,
        googleContactAdded: true,
        googleSheetUpdated: true,
        brightPayCSVGenerated: false,
        vatAuthorizationRequested: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await updateClientWorkflowStatus(clientId, workflowStatus);

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error handling engagement letter signed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get workflow status
export async function getWorkflowStatus(clientId: string): Promise<{
  success: boolean;
  status?: OnboardingWorkflowStatus;
  error?: string;
}> {
  try {
    // In production, retrieve from database or Google Sheets
    // For now, return a placeholder
    return {
      success: false,
      error: 'Not implemented - would retrieve from database',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
