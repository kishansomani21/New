import { ClientDetailedInfo, BrightPayEmployee } from '../types/onboarding';
import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';

// Convert client to BrightPay employee format
export function clientToBrightPayEmployee(client: ClientDetailedInfo): BrightPayEmployee | null {
  // Only create BrightPay entry if client is PAYE registered
  if (!client.isPAYERegistered) {
    return null;
  }

  const [firstName, ...lastNameParts] = client.name.split(' ');
  const lastName = lastNameParts.join(' ') || firstName;

  return {
    title: '', // Would need to be collected in form
    firstName,
    lastName,
    email: client.email,
    phone: client.phone,
    address: client.address || '',
    postcode: client.postcode || '',
    niNumber: '', // Would need to be collected in form
    payrollId: `EMP${Date.now()}`, // Generate unique payroll ID
    startDate: format(new Date(), 'dd/MM/yyyy'),
    payFrequency: 'monthly',
    grossPay: 0, // Would need to be set manually
    taxCode: '1257L', // Default tax code for 2024/25
  };
}

// Generate BrightPay CSV for import
export async function generateBrightPayCSV(clients: ClientDetailedInfo[]): Promise<{
  success: boolean;
  csvPath?: string;
  csvContent?: string;
  error?: string;
}> {
  try {
    // Filter only PAYE registered clients
    const payeClients = clients.filter(c => c.isPAYERegistered);

    if (payeClients.length === 0) {
      return {
        success: false,
        error: 'No PAYE registered clients to export',
      };
    }

    // BrightPay CSV format headers
    const headers = [
      'Title',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Address Line 1',
      'Postcode',
      'NI Number',
      'Payroll ID',
      'Start Date',
      'Pay Frequency',
      'Gross Pay',
      'Tax Code',
      'UTR',
      'PAYE Reference',
      'Company Name',
    ];

    // Build CSV rows
    const rows = payeClients.map(client => {
      const employee = clientToBrightPayEmployee(client);
      if (!employee) return [];

      return [
        employee.title,
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.phone,
        employee.address,
        employee.postcode,
        employee.niNumber,
        employee.payrollId,
        employee.startDate,
        employee.payFrequency,
        employee.grossPay.toString(),
        employee.taxCode,
        client.utr || '',
        client.payeReference || '',
        client.companyName || '',
      ];
    });

    // Convert to CSV format
    const csvLines = [
      headers.join(','),
      ...rows.map(row => row.map(field => {
        // Escape fields containing commas or quotes
        if (typeof field === 'string' && (field.includes(',') || field.includes('"'))) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      }).join(','))
    ];

    const csvContent = csvLines.join('\n');

    // Save to file
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `brightpay_import_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    const csvPath = path.join(tempDir, fileName);

    fs.writeFileSync(csvPath, csvContent, 'utf-8');

    return {
      success: true,
      csvPath,
      csvContent,
    };
  } catch (error: any) {
    console.error('Error generating BrightPay CSV:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Generate CSV for single client
export async function generateSingleClientBrightPayCSV(client: ClientDetailedInfo): Promise<{
  success: boolean;
  csvPath?: string;
  csvContent?: string;
  error?: string;
}> {
  return generateBrightPayCSV([client]);
}

// Get CSV as buffer for email attachment
export function getCSVBuffer(csvContent: string): Buffer {
  return Buffer.from(csvContent, 'utf-8');
}

// Instructions for importing into BrightPay
export const BRIGHTPAY_IMPORT_INSTRUCTIONS = `
BrightPay Import Instructions:

1. Open BrightPay Desktop Application
2. Navigate to: Employees > Import Employees
3. Select "Import from CSV file"
4. Browse and select the downloaded CSV file
5. Map the CSV columns to BrightPay fields (should auto-map if headers match)
6. Review the preview of employees to be imported
7. Click "Import" to complete the process

Note: You may need to manually update the following fields after import:
- National Insurance Number
- Gross Pay amounts
- Bank details for each employee
- P45 information if applicable

For more help, visit: https://www.brightpay.co.uk/docs/
`;
