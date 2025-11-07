/**
 * Document Upload API Endpoint
 *
 * Handles file uploads, stores in Google Drive, and extracts transactions using Claude AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/googleDrive';
import {
  extractTransactionsFromImage,
  extractTransactionsFromPDF,
} from '@/lib/claude-extractor';
import { getCurrentTaxYear, getQuarter } from '@/lib/tax-periods';
import { ApiResponse, DocumentRecord, ExtractionResult } from '@/lib/mtd-types';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large documents

/**
 * POST /api/upload-document
 * Uploads a document, stores in Google Drive, and extracts transactions
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const taxYear = (formData.get('taxYear') as string) || getCurrentTaxYear();
    const quarter = (formData.get('quarter') as string) || getQuarter(new Date());

    if (!file) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid file type. Please upload an image (JPEG, PNG, WebP) or PDF.',
        },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'File too large. Maximum size is 10MB.',
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Step 1: Upload to Google Drive
    console.log(`Uploading ${file.name} to Google Drive...`);
    const driveFile = await uploadFile(
      fileBuffer,
      file.name,
      file.type,
      taxYear,
      quarter
    );

    // Step 2: Extract transactions using Claude AI
    console.log(`Extracting transactions from ${file.name}...`);
    let extractionResult: ExtractionResult;

    if (file.type === 'application/pdf') {
      extractionResult = await extractTransactionsFromPDF(fileBuffer, file.name);
    } else {
      // Image file
      const base64 = fileBuffer.toString('base64');
      extractionResult = await extractTransactionsFromImage(
        base64,
        file.type,
        file.name
      );
    }

    // Step 3: Create document record
    const documentRecord: DocumentRecord = {
      id: `doc_${Date.now()}`,
      fileName: file.name,
      fileType: file.type === 'application/pdf' ? 'pdf' : 'image',
      uploadDate: new Date().toISOString(),
      quarter: quarter as any,
      taxYear,
      googleDriveFileId: driveFile.fileId,
      googleDriveUrl: driveFile.fileUrl,
      extractedTransactions: extractionResult.transactions,
      processingStatus: 'completed',
    };

    console.log(
      `Successfully processed ${file.name}: ${extractionResult.transactions.length} transactions extracted`
    );

    return NextResponse.json<ApiResponse<DocumentRecord>>(
      {
        success: true,
        data: documentRecord,
        message: `Successfully extracted ${extractionResult.transactions.length} transactions`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Document upload error:', error);

    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error.message || 'Failed to process document',
      },
      { status: 500 }
    );
  }
}
