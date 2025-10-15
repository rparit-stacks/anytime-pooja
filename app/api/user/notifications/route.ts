import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const notifications = await query(
      'SELECT * FROM user_notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    ) as any[]

    return NextResponse.json({
      success: true,
      notifications: notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        is_read: Boolean(notification.is_read),
        action_url: notification.action_url,
        created_at: notification.created_at
      }))
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      user_id,
      title,
      message,
      type = 'system',
      action_url
    } = await request.json()

    if (!user_id || !title || !message) {
      return NextResponse.json({ error: 'User ID, title, and message are required' }, { status: 400 })
    }

    await query(
      'INSERT INTO user_notifications (user_id, title, message, type, action_url) VALUES (?, ?, ?, ?, ?)',
      [user_id, title, message, type, action_url]
    )

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully'
    })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



