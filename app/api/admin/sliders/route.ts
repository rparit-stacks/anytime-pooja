import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const title = formData.get('title') as string
    const subtitle = formData.get('subtitle') as string
    const cta = formData.get('cta') as string
    const link = formData.get('link') as string
    const isActive = formData.get('isActive') === 'true'
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 1
    
    // Handle image upload
    const image = formData.get('image') as File
    let imagePath = '/placeholder.svg'
    
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

    // Insert slider into database
    const sql = `
      INSERT INTO sliders (
        title, subtitle, cta_text, cta_link, image, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    
    const params = [title, subtitle, cta, link, imagePath, isActive, sortOrder]
    
    await query(sql, params)
    
    return NextResponse.json({ success: true, message: 'Slider created successfully' })
  } catch (error) {
    console.error('Error creating slider:', error)
    return NextResponse.json({ error: 'Failed to create slider' }, { status: 500 })
  }
}

export async function GET() {
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
        created_at as createdAt
      FROM sliders
      ORDER BY sort_order ASC, created_at DESC
    `
    
    const sliders = await query(sql) as any[]
    
    return NextResponse.json({ sliders })
  } catch (error) {
    console.error('Error fetching sliders:', error)
    return NextResponse.json({ error: 'Failed to fetch sliders' }, { status: 500 })
  }
}
