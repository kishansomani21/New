import { NextRequest, NextResponse } from 'next/server';
import {
  getInfoRequestById,
  updateInfoRequest,
  getUploadedFilesByRequest,
} from '@/lib/storage';

// GET single request with files
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestData = getInfoRequestById(params.id);

    if (!requestData) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    const files = getUploadedFilesByRequest(params.id);

    return NextResponse.json({
      success: true,
      request: requestData,
      files,
    });
  } catch (error) {
    console.error('Get request error:', error);
    return NextResponse.json(
      { error: 'Failed to get request' },
      { status: 500 }
    );
  }
}

// PATCH update request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const updated = updateInfoRequest(params.id, { status });

    if (!updated) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request: updated,
    });
  } catch (error) {
    console.error('Update request error:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}
