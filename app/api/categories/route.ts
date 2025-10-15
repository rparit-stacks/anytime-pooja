import { NextResponse } from "next/server"
import { queryDirect } from "@/lib/database"

export async function GET() {
  try {
    const sql = `
      SELECT 
        id,
        name,
        slug,
        description,
        image,
        sort_order
      FROM categories
      WHERE is_active = 1
      ORDER BY sort_order ASC, name ASC
    `
    
    const categories = await queryDirect(sql) as any[]
    console.log('Categories API: Found categories:', categories.length, categories)
    const response = NextResponse.json({ categories })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
