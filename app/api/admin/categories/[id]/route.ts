import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

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
      const uploadDir = join(process.cwd(), 'public/upload/categories')
      const filepath = join(uploadDir, filename)
      
      // Ensure upload directory exists
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (error) {
        // Directory might already exist, ignore error
        console.log('Upload directory already exists or created')
      }
      
      await writeFile(filepath, buffer)
      imagePath = `/upload/categories/${filename}`
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
        const { id } = await params
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
