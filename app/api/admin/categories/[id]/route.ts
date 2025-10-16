import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const categories = await query(
      `SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.id = $1
      GROUP BY c.id`,
      [id]
    ) as any[]

    if (categories.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      category: categories[0]
    })

  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
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
      name,
      slug,
      description,
      image,
      is_active,
      sort_order
    } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if category exists
    const existingCategory = await query(
      'SELECT id FROM categories WHERE id = $1',
      [id]
    ) as any[]

    if (existingCategory.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if slug already exists for different category
    const slugCheck = await query(
      'SELECT id FROM categories WHERE slug = $1 AND id != $2',
      [slug, id]
    ) as any[]

    if (slugCheck.length > 0) {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 400 })
    }

    // Update category
    await query(
      `UPDATE categories SET
        name = $1, slug = $2, description = $3, image = $4,
        is_active = $5, sort_order = $6, updated_at = NOW()
      WHERE id = $7`,
      [name, slug, description || '', image || '', is_active !== false, sort_order || 0, id]
    )

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully'
    })

  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if category exists
    const existingCategory = await query(
      'SELECT id FROM categories WHERE id = $1',
      [id]
    ) as any[]

    if (existingCategory.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if category has products
    const products = await query(
      'SELECT id FROM products WHERE category_id = $1',
      [id]
    ) as any[]

    if (products.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete category. It has associated products.' 
      }, { status: 400 })
    }

    // Delete category
    await query('DELETE FROM categories WHERE id = $1', [id])

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
