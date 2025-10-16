import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { handleApiError } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get total count
    const countResult = await query('SELECT COUNT(*) as total FROM sliders') as any[]
    const total = countResult[0]?.total || 0

    // Get sliders with pagination
    const sliders = await query(
      `SELECT 
        id, title, subtitle, cta_text, cta_link, image, 
        is_active, sort_order, created_at, updated_at
      FROM sliders 
      ORDER BY sort_order ASC, created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    ) as any[]

    return NextResponse.json({
      success: true,
      sliders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      subtitle,
      cta_text,
      cta_link,
      image,
      is_active = true,
      sort_order = 0
    } = body

    // Validation
    if (!title || !cta_text || !cta_link || !image) {
      return NextResponse.json({
        success: false,
        error: 'Title, CTA text, CTA link, and image are required'
      }, { status: 400 })
    }

    // Insert new slider
    let result: any[]
    try {
      result = await query(
        `INSERT INTO sliders (
          title, subtitle, cta_text, cta_link, image, is_active, sort_order
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        ) RETURNING id`,
        [
          title.trim(),
          subtitle?.trim() || '',
          cta_text.trim(),
          cta_link.trim(),
          image.trim(),
          is_active !== false,
          sort_order || 0
        ]
      ) as any[]
    } catch (dbError: any) {
      console.error('Database error creating slider:', dbError)

      // Handle specific database errors
      if (dbError.code === '23505') { // Unique constraint violation
        if (dbError.constraint === 'sliders_pkey') {
          // Sequence issue - fix it and retry
          console.log('Fixing sequence for sliders table...')
          try {
            // Reset the sequence to the correct value
            await query('SELECT setval(\'sliders_id_seq\', (SELECT COALESCE(MAX(id), 0) + 1 FROM sliders), false)')

            // Retry the insert
            result = await query(
              `INSERT INTO sliders (
                title, subtitle, cta_text, cta_link, image, is_active, sort_order
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7
              ) RETURNING id`,
              [
                title.trim(),
                subtitle?.trim() || '',
                cta_text.trim(),
                cta_link.trim(),
                image.trim(),
                is_active !== false,
                sort_order || 0
              ]
            ) as any[]
          } catch (retryError) {
            return NextResponse.json({
              success: false,
              error: 'Failed to create slider after sequence fix'
            }, { status: 500 })
          }
        }
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to create slider due to database error'
      }, { status: 500 })
    }

    if (!result || result.length === 0 || !result[0]?.id) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create slider - no ID returned'
      }, { status: 500 })
    }

    console.log('Slider created successfully:', {
      sliderId: result[0].id,
      title: title.trim()
    })

    return NextResponse.json({
      success: true,
      sliderId: result[0].id,
      message: 'Slider created successfully'
    })

  } catch (error) {
    console.error('Error creating slider:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create slider'
    }, { status: 500 })
  }
}
