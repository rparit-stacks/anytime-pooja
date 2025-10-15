import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
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
      const filepath = join(process.cwd(), 'public/upload/categories', filename)
      
      await writeFile(filepath, buffer)
      imagePath = `/upload/categories/${filename}`
    }

    const sql = `
      INSERT INTO categories (name, slug, description, image, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    
    const params = [name, slug, description, imagePath, sortOrder, isActive]
    await query(sql, params)
    
    return NextResponse.json({ success: true, message: 'Category added successfully' })
  } catch (error) {
    console.error('Error adding category:', error)
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const sql = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.image,
        c.sort_order as sortOrder,
        c.is_active as isActive,
        COUNT(p.id) as productCount
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `
    
    const categories = await query(sql) as any[]
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
