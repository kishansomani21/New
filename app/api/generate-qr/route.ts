/**
 * QR Code Generation API Endpoint
 *
 * Generates a QR code for easy mobile access to the app
 */

import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export const runtime = 'nodejs';

/**
 * GET /api/generate-qr
 * Generates a QR code for the app URL
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(targetUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          qrCode: qrCodeDataUrl,
          url: targetUrl,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('QR code generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate QR code',
      },
      { status: 500 }
    );
  }
}
