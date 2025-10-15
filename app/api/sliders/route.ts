import { NextResponse } from "next/server"
import { queryWithFallback } from "@/lib/database"

export async function GET() {
  try {
    const sql = `
      SELECT 
        id,
        title,
        subtitle,
        cta_text as cta,
        cta_link as link,
        image,
        sort_order
      FROM sliders
      WHERE is_active = true
      ORDER BY sort_order ASC
    `
    
    const sliders = await queryWithFallback(sql) as any[]
    const response = NextResponse.json({ sliders })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to fetch sliders' }, { status: 500 })
  }
}
