import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get wishlist items with product details
    const wishlistItems = await query(`
      SELECT 
        w.id,
        w.product_id,
        w.created_at,
        p.id as product_id,
        p.name,
        p.slug,
        p.price,
        p.original_price,
        p.image,
        p.rating,
        p.review_count,
        p.is_active,
        p.stock_quantity
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [userId]) as any[]

    return NextResponse.json({
      success: true,
      wishlist: wishlistItems.map(item => ({
        id: item.id,
        product_id: item.product_id,
        created_at: item.created_at,
        product: {
          id: item.product_id,
          name: item.name,
          slug: item.slug,
          price: parseFloat(item.price),
          original_price: item.original_price ? parseFloat(item.original_price) : null,
          image: item.image,
          rating: parseFloat(item.rating),
          review_count: item.review_count,
          is_active: Boolean(item.is_active),
          stock_quantity: item.stock_quantity
        }
      }))
    })

  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId } = await request.json()

    if (!userId || !productId) {
      return NextResponse.json({ error: 'User ID and Product ID are required' }, { status: 400 })
    }

    // Check if item already exists in wishlist
    const existingItem = await query(
      'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    ) as any[]

    if (existingItem.length > 0) {
      return NextResponse.json({ error: 'Item already in wishlist' }, { status: 400 })
    }

    // Add to wishlist
    await query(
      'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    )

    return NextResponse.json({
      success: true,
      message: 'Item added to wishlist'
    })

  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



