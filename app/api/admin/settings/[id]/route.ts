import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const settings = await query(
      'SELECT * FROM settings WHERE id = $1',
      [id]
    ) as any[]

    if (settings.length === 0) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      setting: settings[0]
    })

  } catch (error) {
    console.error('Error fetching setting:', error)
    return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      setting_key,
      setting_value,
      setting_type,
      category,
      description,
      is_active
    } = body

    // Check if setting exists
    const existingSetting = await query(
      'SELECT id FROM settings WHERE id = $1',
      [id]
    ) as any[]

    if (existingSetting.length === 0) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    // Check if setting key already exists for different setting
    if (setting_key) {
      const keyCheck = await query(
        'SELECT id FROM settings WHERE setting_key = $1 AND id != $2',
        [setting_key, id]
      ) as any[]

      if (keyCheck.length > 0) {
        return NextResponse.json({ error: 'Setting key already exists' }, { status: 400 })
      }
    }

    // Update setting
    await query(
      `UPDATE settings SET
        setting_key = $1, setting_value = $2, setting_type = $3, 
        category = $4, description = $5, is_active = $6, updated_at = NOW()
      WHERE id = $7`,
      [
        setting_key, setting_value || '', setting_type || 'text',
        category, description || '', is_active !== false, id
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Setting updated successfully'
    })

  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if setting exists
    const existingSetting = await query(
      'SELECT id FROM settings WHERE id = $1',
      [id]
    ) as any[]

    if (existingSetting.length === 0) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    // Delete setting
    await query('DELETE FROM settings WHERE id = $1', [id])

    return NextResponse.json({
      success: true,
      message: 'Setting deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting setting:', error)
    return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 })
  }
}


