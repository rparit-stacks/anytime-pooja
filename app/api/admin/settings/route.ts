import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''

    let whereClause = ''
    let queryParams: any[] = []

    if (category) {
      whereClause = 'WHERE category = $1'
      queryParams = [category]
    }

    // Fetch all settings from database
    const settings = await query(
      `SELECT * FROM settings ${whereClause} ORDER BY category, setting_key`,
      queryParams
    ) as any[]

    // Fetch footer settings
    const footerSettings = await query(
      `SELECT * FROM footer_settings WHERE is_active = true ORDER BY sort_order ASC`
    ) as any[]

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    }, {})

    // Convert settings to key-value pairs for easy access
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {} as Record<string, any>)

    // Convert footer settings to structured format
    const footerData: Record<string, any> = {}
    footerSettings.forEach(setting => {
      if (setting.section_type === 'json') {
        try {
          footerData[setting.section_key] = JSON.parse(setting.section_value)
        } catch (e) {
          footerData[setting.section_key] = []
        }
      } else {
        footerData[setting.section_key] = setting.section_value
      }
    })

    return NextResponse.json({
      success: true,
      settings: groupedSettings,
      allSettings: settings,
      settingsMap,
      footer: footerData,
      footerSettings: footerSettings
    })

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, settings, footerSettings } = body

    if (type === 'settings' && settings) {
      // Update multiple settings
      const updatePromises = settings.map(async (setting: any) => {
        const { id, setting_value, setting_type, description, is_active } = setting

        if (!id) {
          throw new Error('Setting ID is required')
        }

        return query(
          `UPDATE settings SET
            setting_value = $1, setting_type = $2, description = $3, is_active = $4, updated_at = NOW()
          WHERE id = $5`,
          [setting_value || '', setting_type || 'text', description || '', is_active !== false, id]
        )
      })

      await Promise.all(updatePromises)

      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully'
      })
    }

    if (type === 'footer' && footerSettings) {
      // Update footer settings
      const updatePromises = footerSettings.map(async (setting: any) => {
        const { id, section_value, section_type, description, is_active } = setting

        if (!id) {
          throw new Error('Footer setting ID is required')
        }

        return query(
          `UPDATE footer_settings SET
            section_value = $1, section_type = $2, description = $3, is_active = $4, updated_at = NOW()
          WHERE id = $5`,
          [section_value || '', section_type || 'text', description || '', is_active !== false, id]
        )
      })

      await Promise.all(updatePromises)

      return NextResponse.json({
        success: true,
        message: 'Footer settings updated successfully'
      })
    }

    // Legacy single setting creation
    const {
      setting_key,
      setting_value,
      setting_type,
      category,
      description,
      is_active
    } = body

    // Validate required fields
    if (!setting_key || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if setting key already exists
    const existingSetting = await query(
      'SELECT id FROM settings WHERE setting_key = $1',
      [setting_key]
    ) as any[]

    if (existingSetting.length > 0) {
      return NextResponse.json({ error: 'Setting key already exists' }, { status: 400 })
    }

    // Insert new setting
    const result = await query(
      `INSERT INTO settings (
        setting_key, setting_value, setting_type, category, description, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      ) RETURNING id`,
      [
        setting_key,
        setting_value || '',
        setting_type || 'text',
        category,
        description || '',
        is_active !== false
      ]
    ) as any[]

    return NextResponse.json({
      success: true,
      settingId: result[0]?.id,
      message: 'Setting created successfully'
    })

  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings } = body

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings array is required' }, { status: 400 })
    }

    // Update multiple settings
    const updatePromises = settings.map(async (setting: any) => {
      const { id, setting_value, setting_type, description, is_active } = setting

      if (!id) {
        throw new Error('Setting ID is required')
      }

      return query(
        `UPDATE settings SET
          setting_value = $1, setting_type = $2, description = $3, is_active = $4, updated_at = NOW()
        WHERE id = $5`,
        [setting_value || '', setting_type || 'text', description || '', is_active !== false, id]
      )
    })

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    })

  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
