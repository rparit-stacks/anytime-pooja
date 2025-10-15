import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0
    const isActive = formData.get('isActive') === 'true' || true // Default to true
    
    // Debug logging
    console.log('Category Data:', {
      name, slug, description, sortOrder, isActive
    })
    
    // Check for duplicate name
    const existingCategory = await query(
      'SELECT id FROM categories WHERE name = ?',
      [name]
    ) as any[]
    
    if (existingCategory.length > 0) {
      return NextResponse.json({ 
        error: 'Category with this name already exists',
        code: 'DUPLICATE_NAME'
      }, { status: 400 })
    }
    
    // Check for duplicate slug
    const existingSlug = await query(
      'SELECT id FROM categories WHERE slug = ?',
      [slug]
    ) as any[]
    
    if (existingSlug.length > 0) {
      return NextResponse.json({ 
        error: 'Category with this slug already exists',
        code: 'DUPLICATE_SLUG'
      }, { status: 400 })
    }
    
    // Get next available sort order if not provided
    let finalSortOrder = sortOrder
    if (sortOrder === 0) {
      const maxSortOrder = await query(
        'SELECT MAX(sort_order) as max_order FROM categories'
      ) as any[]
      finalSortOrder = (maxSortOrder[0]?.max_order || 0) + 1
    }
    
    // Handle image upload
    const image = formData.get('image') as File
    let imagePath = null
    
    if (image && image.size > 0) {
      try {
        imagePath = await uploadToCloudinary(image, 'categories')
      } catch (error) {
        console.error('Image upload failed:', error)
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
      }
    }

    const sql = `
      INSERT INTO categories (name, slug, description, image, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    
    const params = [name, slug, description, imagePath, finalSortOrder, isActive]
    console.log('Inserting category with params:', params)
    await query(sql, params)
    console.log('Category inserted successfully')
    
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
    console.log('Admin Categories API: Found categories:', categories.length, categories)
    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
