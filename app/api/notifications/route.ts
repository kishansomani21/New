import { NextRequest, NextResponse } from 'next/server';
import {
  getNotificationsByUser,
  getUnreadNotificationsByUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/storage';

// GET notifications for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const unreadOnly = request.nextUrl.searchParams.get('unreadOnly') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const notifications = unreadOnly
      ? getUnreadNotificationsByUser(userId)
      : getNotificationsByUser(userId);

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: getUnreadNotificationsByUser(userId).length,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

// PATCH mark notification as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId, markAllRead } = body;

    if (markAllRead && userId) {
      markAllNotificationsAsRead(userId);
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const notification = markNotificationAsRead(notificationId);

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}
