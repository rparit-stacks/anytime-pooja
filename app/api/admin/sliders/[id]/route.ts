import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = `
      SELECT 
        id,
        title,
        subtitle,
        cta_text as cta,
        cta_link as link,
        image,
        is_active as isActive,
        sort_order as sortOrder,
        created_at as createdAt,
        updated_at as updatedAt
      FROM sliders
      WHERE id = ?
    `
    
    const { id } = await params
    const sliders = await query(sql, [id]) as any[]
    
    if (sliders.length === 0) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 })
    }
    
    return NextResponse.json({ slider: sliders[0] })
  } catch (error) {
    console.error('Error fetching slider:', error)
    return NextResponse.json({ error: 'Failed to fetch slider' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const title = formData.get('title') as string
    const subtitle = formData.get('subtitle') as string
    const ctaText = formData.get('ctaText') as string
    const ctaLink = formData.get('ctaLink') as string
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0
    const isActive = formData.get('isActive') === 'true'
    
    // Handle image upload
    const image = formData.get('image') as File
    let imagePath = null
    
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${image.name}`
      const uploadDir = join(process.cwd(), 'public/upload/sliders')
      const filepath = join(uploadDir, filename)
      
      // Ensure upload directory exists
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (error) {
        // Directory might already exist, ignore error
        console.log('Upload directory already exists or created')
      }
      
      await writeFile(filepath, buffer)
      imagePath = `/upload/sliders/${filename}`
    }

    // Build update query
    let sql = `
      UPDATE sliders SET 
        title = ?, subtitle = ?, cta_text = ?, cta_link = ?, sort_order = ?, is_active = ?,
        updated_at = CURRENT_TIMESTAMP
    `
    
    const params_array = [title, subtitle, ctaText, ctaLink, sortOrder, isActive]

    // Add image update if new image provided
    if (imagePath) {
      sql += `, image = ?`
      params_array.push(imagePath)
    }

        sql += ` WHERE id = ?`
        const { id } = await params
        params_array.push(id)
    
    await query(sql, params_array)
    
    return NextResponse.json({ success: true, message: 'Slider updated successfully' })
  } catch (error) {
    console.error('Error updating slider:', error)
    return NextResponse.json({ error: 'Failed to update slider' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check if slider exists
    const { id } = await params
    const checkSql = 'SELECT id FROM sliders WHERE id = ?'
    const existingSlider = await query(checkSql, [id]) as any[]
    
    if (existingSlider.length === 0) {
      return NextResponse.json({ error: 'Slider not found' }, { status: 404 })
    }

    // Delete the slider
    const deleteSql = 'DELETE FROM sliders WHERE id = ?'
    await query(deleteSql, [id])
    
    return NextResponse.json({ success: true, message: 'Slider deleted successfully' })
  } catch (error) {
    console.error('Error deleting slider:', error)
    return NextResponse.json({ error: 'Failed to delete slider' }, { status: 500 })
  }
}
