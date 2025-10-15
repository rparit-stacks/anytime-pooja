import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const sql = `
      SELECT 
        p.id,
        p.name,
        p.image,
        p.price,
        p.is_featured as isTrending,
        p.created_at as sortOrder
      FROM products p
      WHERE p.is_featured = 1 AND p.is_active = 1
      ORDER BY p.created_at DESC
    `
    
    const products = await query(sql) as any[]
    
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching trending products:', error)
    return NextResponse.json({ error: 'Failed to fetch trending products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, isTrending } = await request.json()
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Update the is_featured field in the products table
    const sql = `
      UPDATE products 
      SET is_featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    
    await query(sql, [isTrending ? 1 : 0, productId])
    
    return NextResponse.json({ 
      success: true, 
      message: isTrending ? 'Product added to trending' : 'Product removed from trending' 
    })
  } catch (error) {
    console.error('Error updating trending status:', error)
    return NextResponse.json({ error: 'Failed to update trending status' }, { status: 500 })
  }
}
