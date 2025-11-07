import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
  getInfoRequests,
  getInfoRequestsByClient,
  addInfoRequest,
  addNotification,
  getUserById,
} from '@/lib/storage';
import { InfoRequest, Notification } from '@/lib/types';

// GET all requests or by client
export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get('clientId');
    const userId = request.nextUrl.searchParams.get('userId');

    if (clientId) {
      const requests = getInfoRequestsByClient(clientId);
      return NextResponse.json({ success: true, requests });
    }

    // If user is a client, only show their requests
    if (userId) {
      const user = getUserById(userId);
      if (user && user.role === 'client') {
        const requests = getInfoRequestsByClient(userId);
        return NextResponse.json({ success: true, requests });
      }
    }

    // Admin sees all requests
    const requests = getInfoRequests();
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json(
      { error: 'Failed to get requests' },
      { status: 500 }
    );
  }
}

// POST create new request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, title, description, dueDate } = body;

    if (!clientId || !title) {
      return NextResponse.json(
        { error: 'Client ID and title are required' },
        { status: 400 }
      );
    }

    const client = getUserById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const newRequest: InfoRequest = {
      id: uuidv4(),
      clientId,
      clientName: client.name,
      clientEmail: client.email,
      title,
      description: description || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
    };

    addInfoRequest(newRequest);

    // Create notification for client
    const notification: Notification = {
      id: uuidv4(),
      userId: clientId,
      type: 'request',
      title: 'New Information Request',
      message: `You have a new request: ${title}`,
      read: false,
      createdAt: new Date(),
      relatedRequestId: newRequest.id,
    };

    addNotification(notification);

    return NextResponse.json({
      success: true,
      request: newRequest,
    });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}
