import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
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
      ORDER BY banner_order ASC
    `
    const banners = await query(sql) as any[]

    return NextResponse.json({ banners })
  } catch (error) {
    console.error('Error fetching promo banners:', error)
    return NextResponse.json({ error: 'Failed to fetch promo banners' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
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
      const uploadDir = join(process.cwd(), 'public/upload/banners')
      const filepath = join(uploadDir, filename)
      
      // Ensure upload directory exists
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (error) {
        // Directory might already exist, ignore error
        console.log('Upload directory already exists or created')
      }
      
      await writeFile(filepath, buffer)
      bannerImagePath = `/upload/banners/${filename}`
    }

    // Generate banner key
    const bannerKey = `banner_${Date.now()}`

    const sql = `
      INSERT INTO promo_banners (
        banner_key, banner_title, banner_description, banner_image,
        button_text, button_url, banner_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const params = [
      bannerKey, bannerTitle, bannerDescription, bannerImagePath,
      buttonText, buttonUrl, bannerOrder, isActive
    ]

    await query(sql, params)

    return NextResponse.json({ 
      success: true, 
      message: 'Promo banner created successfully' 
    })
  } catch (error) {
    console.error('Error creating promo banner:', error)
    return NextResponse.json({ error: 'Failed to create promo banner' }, { status: 500 })
  }
}
