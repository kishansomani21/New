import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ClientDetailedInfo } from '../types/onboarding';
import fs from 'fs';
import path from 'path';

// Fill out HMRC 64-8 form
export async function fill648Form(client: ClientDetailedInfo): Promise<{
  success: boolean;
  pdfBuffer?: Buffer;
  error?: string;
}> {
  try {
    // For now, we'll create a simple 64-8 form
    // In production, you'd download the official PDF from HMRC and fill it
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();
    const fontSize = 10;

    // Header
    page.drawText('HMRC Form 64-8', {
      x: 50,
      y: height - 50,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText('Authorising your agent', {
      x: 50,
      y: height - 70,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    // Agent details
    let yPosition = height - 110;

    page.drawText('AGENT DETAILS', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    });

    yPosition -= 30;
    page.drawText('Agent Name: [Your Accounting Firm Name]', {
      x: 50,
      y: yPosition,
      size: fontSize,
      font: font,
    });

    yPosition -= 20;
    page.drawText('Agent Reference: [Your Agent Reference Number]', {
      x: 50,
      y: yPosition,
      size: fontSize,
      font: font,
    });

    // Client details
    yPosition -= 40;
    page.drawText('CLIENT DETAILS', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    });

    yPosition -= 30;
    page.drawText(`Name: ${client.name}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
      font: font,
    });

    if (client.companyName) {
      yPosition -= 20;
      page.drawText(`Company Name: ${client.companyName}`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: font,
      });
    }

    yPosition -= 20;
    page.drawText(`Email: ${client.email}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
      font: font,
    });

    yPosition -= 20;
    page.drawText(`Phone: ${client.phone}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
      font: font,
    });

    if (client.address) {
      yPosition -= 20;
      page.drawText(`Address: ${client.address}`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: font,
      });
    }

    if (client.postcode) {
      yPosition -= 20;
      page.drawText(`Postcode: ${client.postcode}`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: font,
      });
    }

    if (client.utr) {
      yPosition -= 20;
      page.drawText(`UTR: ${client.utr}`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: font,
      });
    }

    // Tax services authorization
    yPosition -= 40;
    page.drawText('TAX SERVICES AUTHORIZED', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    });

    yPosition -= 30;
    const services = [];
    if (client.isPAYERegistered) services.push('PAYE');
    if (client.isVATRegistered) services.push('VAT');
    if (client.isCISRegistered) services.push('CIS');
    services.push('Self Assessment', 'Corporation Tax');

    services.forEach(service => {
      page.drawText(`☑ ${service}`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: font,
      });
      yPosition -= 20;
    });

    // Declaration
    yPosition -= 40;
    page.drawText('DECLARATION', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    });

    yPosition -= 30;
    const declarationText = [
      'I authorise the agent named above to act on my behalf for the tax matters',
      'selected above. I understand that this authority will remain in place until I',
      'cancel it in writing with HMRC or my agent.',
    ];

    declarationText.forEach(line => {
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: font,
      });
      yPosition -= 20;
    });

    // Signature section
    yPosition -= 40;
    page.drawText('Client Signature: _________________________', {
      x: 50,
      y: yPosition,
      size: fontSize,
      font: font,
    });

    yPosition -= 30;
    page.drawText(`Date: ${new Date().toLocaleDateString('en-GB')}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
      font: font,
    });

    // Footer
    page.drawText('This is a simplified 64-8 form. Please replace with official HMRC template.', {
      x: 50,
      y: 30,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();

    return {
      success: true,
      pdfBuffer: Buffer.from(pdfBytes),
    };
  } catch (error: any) {
    console.error('Error filling 64-8 form:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Create engagement letter
export async function createEngagementLetter(client: ClientDetailedInfo): Promise<{
  success: boolean;
  pdfBuffer?: Buffer;
  error?: string;
}> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();

    // Header
    page.drawText('ENGAGEMENT LETTER', {
      x: 50,
      y: height - 50,
      size: 18,
      font: boldFont,
      color: rgb(0.2, 0.3, 0.5),
    });

    let yPosition = height - 100;

    page.drawText(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), {
      x: 50,
      y: yPosition,
      size: 10,
      font: font,
    });

    yPosition -= 40;
    page.drawText(`Dear ${client.name},`, {
      x: 50,
      y: yPosition,
      size: 11,
      font: font,
    });

    yPosition -= 30;
    page.drawText('TERMS OF ENGAGEMENT', {
      x: 50,
      y: yPosition,
      size: 12,
      font: boldFont,
    });

    yPosition -= 30;
    const paragraphs = [
      'We are pleased to confirm our engagement to provide accounting and taxation services to you.',
      '',
      '1. SERVICES',
      'We will provide the following services:',
      '   • Bookkeeping and accounting services',
      '   • Preparation of annual accounts',
      '   • Completion and submission of tax returns',
      '   • VAT returns (if applicable)',
      '   • Payroll services (if applicable)',
      '   • General tax advice and planning',
      '',
      '2. CLIENT RESPONSIBILITIES',
      'You agree to:',
      '   • Provide complete and accurate information in a timely manner',
      '   • Maintain proper records of all business transactions',
      '   • Respond promptly to our requests for information',
      '   • Pay our fees in accordance with the agreed terms',
      '',
      '3. FEES',
      'Our fees will be charged monthly based on the services provided. We will notify you',
      'in advance of any significant additional work required.',
      '',
      '4. CONFIDENTIALITY',
      'We will maintain the confidentiality of your information in accordance with',
      'professional standards and GDPR regulations.',
      '',
      'Please sign and return this letter to confirm your acceptance of these terms.',
      '',
      'Yours sincerely,',
      '',
      '[Your Accounting Firm]',
    ];

    paragraphs.forEach(text => {
      if (yPosition < 100) {
        // Would need a new page - simplified for now
        return;
      }

      const fontSize = text.startsWith('   •') || text.startsWith('   ') ? 9 :
                       text.match(/^\d+\./) ? 10 : 10;
      const useFont = text.match(/^\d+\./) || text === 'TERMS OF ENGAGEMENT' ? boldFont : font;

      page.drawText(text, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font: useFont,
      });

      yPosition -= text === '' ? 10 : 15;
    });

    const pdfBytes = await pdfDoc.save();

    return {
      success: true,
      pdfBuffer: Buffer.from(pdfBytes),
    };
  } catch (error: any) {
    console.error('Error creating engagement letter:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Save PDF to temporary file
export async function savePDFToTemp(buffer: Buffer, filename: string): Promise<string> {
  const tempDir = path.join(process.cwd(), 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const filePath = path.join(tempDir, filename);
  fs.writeFileSync(filePath, buffer);

  return filePath;
}
