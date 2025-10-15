import { NextRequest, NextResponse } from "next/server"
import { query, queryWithFallback } from "@/lib/database"

export async function GET() {
  try {
    const sql = `
      SELECT 
        id,
        section_key,
        section_value,
        section_type,
        section_name,
        description,
        is_active,
        sort_order,
        created_at,
        updated_at
      FROM footer_settings
      WHERE is_active = true
      ORDER BY sort_order ASC, section_name ASC
    `
    
    const footerSettings = await queryWithFallback(sql) as any[]
    
    // Group settings by section
    const groupedSettings = footerSettings.reduce((acc, setting) => {
      if (!acc[setting.section_name]) {
        acc[setting.section_name] = []
      }
      acc[setting.section_name].push(setting)
      return acc
    }, {} as Record<string, any[]>)
    
    return NextResponse.json({ footerSettings: groupedSettings })
  } catch (error) {
    console.error('Error fetching footer settings:', error)
    return NextResponse.json({ error: 'Failed to fetch footer settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const settings = JSON.parse(formData.get('settings') as string)
    
    // Update footer settings
    for (const [key, value] of Object.entries(settings)) {
      const updateSql = `
        UPDATE footer_settings 
        SET section_value = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE section_key = ?
      `
      await queryWithFallback(updateSql, [value, key])
    }
    
    return NextResponse.json({ success: true, message: 'Footer settings updated successfully' })
  } catch (error) {
    console.error('Error updating footer settings:', error)
    return NextResponse.json({ error: 'Failed to update footer settings' }, { status: 500 })
  }
}
