import { google } from 'googleapis';
import { ClientDetailedInfo, OnboardingWorkflowStatus } from '../types/onboarding';

export async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

// Initialize client onboarding sheet with headers
export async function initializeClientSheet(sheetId?: string): Promise<{
  success: boolean;
  spreadsheetId?: string;
  error?: string;
}> {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = sheetId || process.env.GOOGLE_CLIENTS_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('Google Clients Sheet ID not configured');
    }

    const headers = [
      'Client ID',
      'Name',
      'Email',
      'Phone',
      'Company Name',
      'Business Type',
      'Address',
      'Postcode',
      'UTR',
      'VAT Number',
      'PAYE Reference',
      'PAYE Registered',
      'VAT Registered',
      'CIS Registered',
      'Onboarding Status',
      'Form Sent Date',
      'Form Completed Date',
      '64-8 Generated',
      'Engagement Letter Sent',
      'Engagement Letter Signed',
      'GoCardless Link Sent',
      'Google Contact Added',
      'BrightPay CSV Generated',
      'VAT Auth Requested',
      'Created Date',
      'Last Updated',
      'Notes',
    ];

    // Check if headers exist
    const headerCheck = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Clients!A1:AA1',
    });

    if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Clients!A1:AA1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers],
        },
      });
    }

    return {
      success: true,
      spreadsheetId,
    };
  } catch (error: any) {
    console.error('Error initializing client sheet:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Add client to Google Sheets
export async function addClientToSheet(
  client: ClientDetailedInfo,
  workflowStatus: OnboardingWorkflowStatus
): Promise<{
  success: boolean;
  rowNumber?: number;
  error?: string;
}> {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_CLIENTS_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('Google Clients Sheet ID not configured');
    }

    // Ensure sheet is initialized
    await initializeClientSheet(spreadsheetId);

    const row = [
      workflowStatus.clientId,
      client.name,
      client.email,
      client.phone,
      client.companyName || '',
      client.businessType || '',
      client.address || '',
      client.postcode || '',
      client.utr || '',
      client.vatNumber || '',
      client.payeReference || '',
      client.isPAYERegistered ? 'Yes' : 'No',
      client.isVATRegistered ? 'Yes' : 'No',
      client.isCISRegistered ? 'Yes' : 'No',
      workflowStatus.status,
      workflowStatus.steps.googleFormSent ? new Date().toISOString() : '',
      workflowStatus.steps.formCompleted ? new Date().toISOString() : '',
      workflowStatus.steps.form648Generated ? 'Yes' : 'No',
      workflowStatus.steps.engagementLetterSent ? 'Yes' : 'No',
      workflowStatus.steps.engagementLetterSigned ? 'Yes' : 'No',
      workflowStatus.steps.goCardlessLinkSent ? 'Yes' : 'No',
      workflowStatus.steps.googleContactAdded ? 'Yes' : 'No',
      workflowStatus.steps.brightPayCSVGenerated ? 'Yes' : 'No',
      workflowStatus.steps.vatAuthorizationRequested ? 'Yes' : 'No',
      new Date(workflowStatus.createdAt).toISOString(),
      new Date(workflowStatus.updatedAt).toISOString(),
      client.notes || '',
    ];

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Clients!A2:AA',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    return {
      success: true,
      rowNumber: result.data.updates?.updatedRows || 0,
    };
  } catch (error: any) {
    console.error('Error adding client to sheet:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Update client workflow status in sheet
export async function updateClientWorkflowStatus(
  clientId: string,
  workflowStatus: OnboardingWorkflowStatus
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_CLIENTS_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('Google Clients Sheet ID not configured');
    }

    // Find the row with this client ID
    const searchResult = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Clients!A:A',
    });

    const rows = searchResult.data.values || [];
    const rowIndex = rows.findIndex(row => row[0] === clientId);

    if (rowIndex === -1) {
      throw new Error(`Client ${clientId} not found in sheet`);
    }

    // Update the status columns
    const updates = [
      workflowStatus.status, // Column O (15)
      workflowStatus.steps.googleFormSent ? new Date().toISOString() : '', // Column P (16)
      workflowStatus.steps.formCompleted ? new Date().toISOString() : '', // Column Q (17)
      workflowStatus.steps.form648Generated ? 'Yes' : 'No', // Column R (18)
      workflowStatus.steps.engagementLetterSent ? 'Yes' : 'No', // Column S (19)
      workflowStatus.steps.engagementLetterSigned ? 'Yes' : 'No', // Column T (20)
      workflowStatus.steps.goCardlessLinkSent ? 'Yes' : 'No', // Column U (21)
      workflowStatus.steps.googleContactAdded ? 'Yes' : 'No', // Column V (22)
      workflowStatus.steps.brightPayCSVGenerated ? 'Yes' : 'No', // Column W (23)
      workflowStatus.steps.vatAuthorizationRequested ? 'Yes' : 'No', // Column X (24)
    ];

    // Update row (rowIndex + 1 because sheet is 1-indexed)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Clients!O${rowIndex + 1}:X${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [updates],
      },
    });

    // Update last updated timestamp
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Clients!Z${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[new Date(workflowStatus.updatedAt).toISOString()]],
      },
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Error updating client workflow status:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Get client by ID from sheet
export async function getClientFromSheet(clientId: string): Promise<{
  success: boolean;
  client?: ClientDetailedInfo;
  error?: string;
}> {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_CLIENTS_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('Google Clients Sheet ID not configured');
    }

    // Get all data
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Clients!A:AA',
    });

    const rows = result.data.values || [];

    // Find the client row
    const clientRow = rows.find(row => row[0] === clientId);

    if (!clientRow) {
      return {
        success: false,
        error: 'Client not found',
      };
    }

    const client: ClientDetailedInfo = {
      name: clientRow[1] || '',
      email: clientRow[2] || '',
      phone: clientRow[3] || '',
      companyName: clientRow[4] || undefined,
      businessType: clientRow[5] as any || undefined,
      address: clientRow[6] || undefined,
      postcode: clientRow[7] || undefined,
      utr: clientRow[8] || undefined,
      vatNumber: clientRow[9] || undefined,
      payeReference: clientRow[10] || undefined,
      isPAYERegistered: clientRow[11] === 'Yes',
      isVATRegistered: clientRow[12] === 'Yes',
      isCISRegistered: clientRow[13] === 'Yes',
      notes: clientRow[26] || undefined,
    };

    return {
      success: true,
      client,
    };
  } catch (error: any) {
    console.error('Error getting client from sheet:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
