import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { writeFile } from "fs/promises"
import { join } from "path"

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
      WHERE is_active = 1
      ORDER BY category, setting_key
    `
    
    const settings = await query(sql) as any[]
    
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
        const bytes = await logoFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const timestamp = Date.now()
        const filename = `logo-${timestamp}.${logoFile.name.split('.').pop()}`
        const filepath = join(process.cwd(), 'public/images', filename)
        await writeFile(filepath, buffer)
        fileUploads.logo_url = `/images/${filename}`
      }
    }
    
    if (category === 'favicon') {
      const faviconFile = formData.get('favicon') as File
      if (faviconFile && faviconFile.size > 0) {
        const bytes = await faviconFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const timestamp = Date.now()
        const filename = `favicon-${timestamp}.${faviconFile.name.split('.').pop()}`
        const filepath = join(process.cwd(), 'public', filename)
        await writeFile(filepath, buffer)
        fileUploads.favicon_url = `/${filename}`
      }
      
      const appleTouchIconFile = formData.get('apple_touch_icon') as File
      if (appleTouchIconFile && appleTouchIconFile.size > 0) {
        const bytes = await appleTouchIconFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const timestamp = Date.now()
        const filename = `apple-touch-icon-${timestamp}.${appleTouchIconFile.name.split('.').pop()}`
        const filepath = join(process.cwd(), 'public/images', filename)
        await writeFile(filepath, buffer)
        fileUploads.apple_touch_icon = `/images/${filename}`
      }
    }
    
    if (category === 'seo') {
      const ogImageFile = formData.get('og_image') as File
      if (ogImageFile && ogImageFile.size > 0) {
        const bytes = await ogImageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const timestamp = Date.now()
        const filename = `og-image-${timestamp}.${ogImageFile.name.split('.').pop()}`
        const filepath = join(process.cwd(), 'public/images', filename)
        await writeFile(filepath, buffer)
        fileUploads.og_image = `/images/${filename}`
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
      await query(updateSql, [settingValue, key, category])
    }
    
    return NextResponse.json({ success: true, message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
