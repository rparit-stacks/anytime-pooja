import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sql = `
      SELECT 
        id,
        banner_key,
        banner_title,
        banner_description,
        banner_image,
        button_text,
        button_url,
        banner_order,
        is_active
      FROM promo_banners
      WHERE id = ?
    `
    const banners = await query(sql, [id]) as any[]

    if (banners.length === 0) {
      return NextResponse.json({ error: 'Promo banner not found' }, { status: 404 })
    }

    return NextResponse.json({ banner: banners[0] })
  } catch (error) {
    console.error('Error fetching promo banner:', error)
    return NextResponse.json({ error: 'Failed to fetch promo banner' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const formData = await request.formData()
    
    const bannerTitle = formData.get('banner_title') as string
    const bannerDescription = formData.get('banner_description') as string
    const buttonText = formData.get('button_text') as string
    const buttonUrl = formData.get('button_url') as string
    const bannerOrder = parseInt(formData.get('banner_order') as string) || 1
    const isActive = formData.get('is_active') === 'true'

    // Handle banner image upload
    const bannerImage = formData.get('banner_image') as File
    let bannerImagePath = ''

    if (bannerImage && bannerImage.size > 0) {
      const bytes = await bannerImage.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const timestamp = Date.now()
      const filename = `${timestamp}-${bannerImage.name}`
      const filepath = join(process.cwd(), 'public/upload/banners', filename)
      
      await writeFile(filepath, buffer)
      bannerImagePath = `/upload/banners/${filename}`
    }

    let sql = `
      UPDATE promo_banners
      SET banner_title = ?, banner_description = ?, button_text = ?, 
          button_url = ?, banner_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
    `
    const params_array = [bannerTitle, bannerDescription, buttonText, buttonUrl, bannerOrder, isActive]

    // Add image update if new image provided
    if (bannerImagePath) {
      sql += `, banner_image = ?`
      params_array.push(bannerImagePath)
    }

    sql += ` WHERE id = ?`
    params_array.push(id)

    await query(sql, params_array)

    return NextResponse.json({ 
      success: true, 
      message: 'Promo banner updated successfully' 
    })
  } catch (error) {
    console.error('Error updating promo banner:', error)
    return NextResponse.json({ error: 'Failed to update promo banner' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sql = `DELETE FROM promo_banners WHERE id = ?`
    await query(sql, [id])

    return NextResponse.json({ 
      success: true, 
      message: 'Promo banner deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting promo banner:', error)
    return NextResponse.json({ error: 'Failed to delete promo banner' }, { status: 500 })
  }
}
