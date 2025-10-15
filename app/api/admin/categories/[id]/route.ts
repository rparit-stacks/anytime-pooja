import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = `
      SELECT 
        id,
        name,
        slug,
        description,
        image,
        sort_order as sortOrder,
        is_active as isActive,
        created_at as createdAt,
        updated_at as updatedAt
      FROM categories
      WHERE id = ?
    `
    
    const { id } = await params
    const categories = await query(sql, [id]) as any[]
    
    if (categories.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    
    return NextResponse.json({ category: categories[0] })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const formData = await request.formData()
    const { id } = await params
    
    // Extract form data
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0
    const isActive = formData.get('isActive') === 'true' || true // Default to true
    
    // Check for duplicate name (excluding current category)
    const existingName = await query(
      'SELECT id FROM categories WHERE name = ? AND id != ?',
      [name, id]
    ) as any[]
    
    if (existingName.length > 0) {
      return NextResponse.json({ 
        error: 'Category with this name already exists',
        code: 'DUPLICATE_NAME'
      }, { status: 400 })
    }
    
    // Check for duplicate slug (excluding current category)
    const existingSlug = await query(
      'SELECT id FROM categories WHERE slug = ? AND id != ?',
      [slug, id]
    ) as any[]
    
    if (existingSlug.length > 0) {
      return NextResponse.json({ 
        error: 'Category with this slug already exists',
        code: 'DUPLICATE_SLUG'
      }, { status: 400 })
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

    // Build update query
    let sql = `
      UPDATE categories SET 
        name = ?, slug = ?, description = ?, sort_order = ?, is_active = ?,
        updated_at = CURRENT_TIMESTAMP
    `
    
    const params_array = [name, slug, description, sortOrder, isActive]

    // Add image update if new image provided
    if (imagePath) {
      sql += `, image = ?`
      params_array.push(imagePath)
    }

        sql += ` WHERE id = ?`
        params_array.push(id)
    
    await query(sql, params_array)
    
    return NextResponse.json({ success: true, message: 'Category updated successfully' })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check if category exists
    const { id } = await params
    const checkSql = 'SELECT id FROM categories WHERE id = ?'
    const existingCategory = await query(checkSql, [id]) as any[]
    
    if (existingCategory.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Delete the category
    const deleteSql = 'DELETE FROM categories WHERE id = ?'
    await query(deleteSql, [id])
    
    return NextResponse.json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
