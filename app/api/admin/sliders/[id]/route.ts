import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { handleApiError } from '@/lib/error-handler'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sliderId = parseInt(params.id)
    
    if (isNaN(sliderId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid slider ID'
      }, { status: 400 })
    }

    const result = await query(
      `SELECT 
        id, title, subtitle, cta_text, cta_link, image, 
        is_active, sort_order, created_at, updated_at
      FROM sliders 
      WHERE id = $1`,
      [sliderId]
    ) as any[]

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Slider not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      slider: result[0]
    })

  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sliderId = parseInt(params.id)
    
    if (isNaN(sliderId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid slider ID'
      }, { status: 400 })
    }

    const body = await request.json()
    const {
      title,
      subtitle,
      cta_text,
      cta_link,
      image,
      is_active,
      sort_order
    } = body

    // Validation
    if (!title || !cta_text || !cta_link || !image) {
      return NextResponse.json({
        success: false,
        error: 'Title, CTA text, CTA link, and image are required'
      }, { status: 400 })
    }

    // Check if slider exists
    const existingSlider = await query(
      'SELECT id FROM sliders WHERE id = $1',
      [sliderId]
    ) as any[]

    if (existingSlider.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Slider not found'
      }, { status: 404 })
    }

    // Update slider
    const result = await query(
      `UPDATE sliders SET
        title = $1, subtitle = $2, cta_text = $3, cta_link = $4, 
        image = $5, is_active = $6, sort_order = $7, updated_at = NOW()
      WHERE id = $8
      RETURNING id, title, subtitle, cta_text, cta_link, image, is_active, sort_order, updated_at`,
      [
        title.trim(),
        subtitle?.trim() || '',
        cta_text.trim(),
        cta_link.trim(),
        image.trim(),
        is_active !== false,
        sort_order || 0,
        sliderId
      ]
    ) as any[]

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Failed to update slider'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      slider: result[0],
      message: 'Slider updated successfully'
    })

  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sliderId = parseInt(params.id)
    
    if (isNaN(sliderId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid slider ID'
      }, { status: 400 })
    }

    // Check if slider exists
    const existingSlider = await query(
      'SELECT id, title FROM sliders WHERE id = $1',
      [sliderId]
    ) as any[]

    if (existingSlider.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Slider not found'
      }, { status: 404 })
    }

    // Delete slider
    await query('DELETE FROM sliders WHERE id = $1', [sliderId])

    return NextResponse.json({
      success: true,
      message: `Slider "${existingSlider[0].title}" deleted successfully`
    })

  } catch (error) {
    return handleApiError(error)
  }
}
