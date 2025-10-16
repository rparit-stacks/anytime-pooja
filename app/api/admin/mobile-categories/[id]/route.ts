import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { handleApiError } from '@/lib/error-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const mobileCategory = await query(`
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
      WHERE mc.id = $1
    `, [id])

    if (!mobileCategory.length) {
      return NextResponse.json({
        success: false,
        error: 'Mobile category not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      category: mobileCategory[0]
    })

  } catch (error) {
    return handleApiError(error, 'Failed to fetch mobile category')
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { sort_order, is_active, mobile_category_image } = body

    // Update mobile category
    const result = await query(`
      UPDATE mobile_categories 
      SET 
        sort_order = COALESCE($2, sort_order),
        is_active = COALESCE($3, is_active),
        mobile_category_image = COALESCE($4, mobile_category_image),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, sort_order, is_active, mobile_category_image])

    if (!result.length) {
      return NextResponse.json({
        success: false,
        error: 'Mobile category not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      category: result[0]
    })

  } catch (error) {
    return handleApiError(error, 'Failed to update mobile category')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const result = await query(
      'DELETE FROM mobile_categories WHERE id = $1 RETURNING *',
      [id]
    )

    if (!result.length) {
      return NextResponse.json({
        success: false,
        error: 'Mobile category not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Mobile category deleted successfully'
    })

  } catch (error) {
    return handleApiError(error, 'Failed to delete mobile category')
  }
}
