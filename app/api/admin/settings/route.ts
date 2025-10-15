import { NextRequest, NextResponse } from "next/server"
import { query, queryWithFallback } from "@/lib/database"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function GET() {
  try {
    const sql = `
      SELECT 
        id,
        setting_key,
        setting_value,
        setting_type,
        category,
        description,
        is_active,
        created_at,
        updated_at
      FROM settings
      WHERE is_active = true
      ORDER BY category, setting_key
    `
    
    const settings = await queryWithFallback(sql) as any[]
    
    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    }, {} as Record<string, any[]>)
    
    return NextResponse.json({ settings: groupedSettings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const category = formData.get('category') as string
    const settings = JSON.parse(formData.get('settings') as string)
    
    // Handle file uploads for each category
    const fileUploads: Record<string, string> = {}
    
    if (category === 'logo') {
      const logoFile = formData.get('logo') as File
      if (logoFile && logoFile.size > 0) {
        try {
          fileUploads.logo_url = await uploadToCloudinary(logoFile, 'settings/logo')
        } catch (error) {
          console.error('Logo upload failed:', error)
        }
      }
    }
    
    if (category === 'favicon') {
      const faviconFile = formData.get('favicon') as File
      if (faviconFile && faviconFile.size > 0) {
        try {
          fileUploads.favicon_url = await uploadToCloudinary(faviconFile, 'settings/favicon')
        } catch (error) {
          console.error('Favicon upload failed:', error)
        }
      }
      
      const appleTouchIconFile = formData.get('apple_touch_icon') as File
      if (appleTouchIconFile && appleTouchIconFile.size > 0) {
        try {
          fileUploads.apple_touch_icon = await uploadToCloudinary(appleTouchIconFile, 'settings/icons')
        } catch (error) {
          console.error('Apple touch icon upload failed:', error)
        }
      }
    }
    
    if (category === 'seo') {
      const ogImageFile = formData.get('og_image') as File
      if (ogImageFile && ogImageFile.size > 0) {
        try {
          fileUploads.og_image = await uploadToCloudinary(ogImageFile, 'settings/seo')
        } catch (error) {
          console.error('OG image upload failed:', error)
        }
      }
    }
    
    // Update settings
    for (const [key, value] of Object.entries(settings)) {
      // Use uploaded file path if available, otherwise use the value
      const settingValue = fileUploads[key] || value
      
      const updateSql = `
        UPDATE settings 
        SET setting_value = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE setting_key = ? AND category = ?
      `
      await queryWithFallback(updateSql, [settingValue, key, category])
    }
    
    return NextResponse.json({ success: true, message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
