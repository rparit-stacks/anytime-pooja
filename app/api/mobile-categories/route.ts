import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

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
      WHERE mc.is_active = true AND c.is_active = true
      ORDER BY mc.sort_order ASC
    `)

    console.log('Mobile Categories API: Found', mobileCategories?.length || 0, 'categories')
    console.log('Mobile Categories data:', mobileCategories)

    // Set cache headers for better performance
    const response = NextResponse.json({
      success: true,
      categories: mobileCategories || []
    })

    // Cache for 5 minutes
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    
    return response

  } catch (error) {
    console.error('Error fetching mobile categories:', error)
    
    // Return fallback data on error
    return NextResponse.json({
      success: false,
      categories: [],
      error: 'Failed to fetch mobile categories'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
