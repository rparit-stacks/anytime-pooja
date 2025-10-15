import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '6dbff0f37cbebbe9bf17c43548c40d382c9000d31537f76f601b16955e3c628e70d4f30cb60993f2690665a7b6b4745951dd8e24029b196f69cdb0d1815cc11b') as any

    // Get user settings
    const settings = await query(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [decoded.userId]
    ) as any[]

    if (settings.length === 0) {
      // Create default settings if none exist
      await query(
        `INSERT INTO user_settings (
          user_id, email_notifications, sms_notifications, marketing_emails,
          order_updates, security_alerts, two_factor_auth, profile_visibility
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [decoded.userId, true, false, true, true, true, false, 'private']
      )

      return NextResponse.json({
        success: true,
        settings: {
          email_notifications: true,
          sms_notifications: false,
          marketing_emails: true,
          order_updates: true,
          security_alerts: true,
          two_factor_auth: false,
          profile_visibility: 'private'
        }
      })
    }

    const userSettings = settings[0]
    return NextResponse.json({
      success: true,
      settings: {
        email_notifications: Boolean(userSettings.email_notifications),
        sms_notifications: Boolean(userSettings.sms_notifications),
        marketing_emails: Boolean(userSettings.marketing_emails),
        order_updates: Boolean(userSettings.order_updates),
        security_alerts: Boolean(userSettings.security_alerts),
        two_factor_auth: Boolean(userSettings.two_factor_auth),
        profile_visibility: userSettings.profile_visibility || 'private'
      }
    })

  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '6dbff0f37cbebbe9bf17c43548c40d382c9000d31537f76f601b16955e3c628e70d4f30cb60993f2690665a7b6b4745951dd8e24029b196f69cdb0d1815cc11b') as any

    const body = await request.json()
    const {
      email_notifications,
      sms_notifications,
      marketing_emails,
      order_updates,
      security_alerts,
      two_factor_auth,
      profile_visibility
    } = body

    // Check if settings exist
    const existingSettings = await query(
      'SELECT id FROM user_settings WHERE user_id = ?',
      [decoded.userId]
    ) as any[]

    if (existingSettings.length > 0) {
      // Update existing settings
      await query(
        `UPDATE user_settings SET 
          email_notifications = ?, sms_notifications = ?, marketing_emails = ?,
          order_updates = ?, security_alerts = ?, two_factor_auth = ?, 
          profile_visibility = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?`,
        [
          email_notifications, sms_notifications, marketing_emails,
          order_updates, security_alerts, two_factor_auth, profile_visibility,
          decoded.userId
        ]
      )
    } else {
      // Create new settings
      await query(
        `INSERT INTO user_settings (
          user_id, email_notifications, sms_notifications, marketing_emails,
          order_updates, security_alerts, two_factor_auth, profile_visibility
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          decoded.userId, email_notifications, sms_notifications, marketing_emails,
          order_updates, security_alerts, two_factor_auth, profile_visibility
        ]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    })

  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
