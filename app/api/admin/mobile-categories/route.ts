import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { handleApiError } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    // Fetch mobile categories with category details
    const mobileCategories = await query(`
      SELECT 
        mc.id as mobile_category_id,
        mc.sort_order,
        mc.is_active as mobile_category_active,
        mc.created_at as mobile_category_created_at,
        mc.mobile_category_image,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug,
        c.image as category_image,
        c.is_active as category_active
      FROM mobile_categories mc
      JOIN categories c ON mc.category_id = c.id
      ORDER BY mc.sort_order ASC
    `)

    return NextResponse.json({
      success: true,
      categories: mobileCategories || []
    })

  } catch (error) {
    return handleApiError(error, 'Failed to fetch mobile categories')
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category_id, sort_order, is_active, mobile_category_image } = body

    console.log('POST /api/admin/mobile-categories - Request body:', body)

    // Validate required fields
    if (!category_id) {
      return NextResponse.json({
        success: false,
        error: 'Category ID is required'
      }, { status: 400 })
    }

    if (typeof category_id !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Category ID must be a number'
      }, { status: 400 })
    }

    if (sort_order !== undefined && (typeof sort_order !== 'number' || sort_order < 0)) {
      return NextResponse.json({
        success: false,
        error: 'Sort order must be a non-negative number'
      }, { status: 400 })
    }

    // Check if category exists
    const categoryExists = await query(
      'SELECT id FROM categories WHERE id = $1',
      [category_id]
    )

    if (!categoryExists.length) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 })
    }

    // Check if mobile category already exists for this category
    const existingMobileCategory = await query(
      'SELECT id FROM mobile_categories WHERE category_id = $1',
      [category_id]
    )

    if (existingMobileCategory.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Mobile category already exists for this category'
      }, { status: 400 })
    }

    // Create mobile category
    const result = await query(`
      INSERT INTO mobile_categories (category_id, sort_order, is_active, mobile_category_image)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      category_id,
      sort_order || 0,
      is_active !== undefined ? is_active : true,
      mobile_category_image || null
    ])

    console.log('POST /api/admin/mobile-categories - Created:', result[0])

    return NextResponse.json({
      success: true,
      category: result[0]
    }, { status: 201 })

  } catch (error) {
    return handleApiError(error, 'Failed to create mobile category')
  }
}
