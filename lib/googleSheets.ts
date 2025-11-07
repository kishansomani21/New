import { google } from 'googleapis';

export interface Transaction {
  id: string;
  date: string;
  name: string;
  amount: number;
  category: string;
  pending?: boolean;
  merchantName?: string;
}

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

export async function appendTransactionsToSheet(
  transactions: Transaction[],
  sheetId?: string
) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = sheetId || process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error('Google Sheet ID not configured');
    }

    // Check if the sheet has headers, if not add them
    const headerRange = 'A1:G1';
    const headerCheck = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: headerRange,
    });

    if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: headerRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Transaction ID', 'Date', 'Description', 'Amount', 'Category', 'Merchant', 'Status']],
        },
      });
    }

    // Prepare transaction rows
    const rows = transactions.map(txn => [
      txn.id,
      txn.date,
      txn.name,
      txn.amount,
      txn.category,
      txn.merchantName || '',
      txn.pending ? 'Pending' : 'Posted',
    ]);

    // Append transactions
    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A2:G', // Start from row 2 to skip headers
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: rows,
      },
    });

    return {
      success: true,
      updatedRows: result.data.updates?.updatedRows || 0,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    };
  } catch (error: any) {
    console.error('Error appending to Google Sheets:', error);
    throw new Error(`Failed to sync to Google Sheets: ${error.message}`);
  }
}

export async function createNewSpreadsheet(title: string) {
  try {
    const sheets = await getGoogleSheetsClient();

    const result = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
        sheets: [
          {
            properties: {
              title: 'Transactions',
            },
          },
        ],
      },
    });

    const spreadsheetId = result.data.spreadsheetId;

    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId!,
      range: 'A1:G1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Transaction ID', 'Date', 'Description', 'Amount', 'Category', 'Merchant', 'Status']],
      },
    });

    return {
      spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    };
  } catch (error: any) {
    console.error('Error creating spreadsheet:', error);
    throw new Error(`Failed to create spreadsheet: ${error.message}`);
  }
}
