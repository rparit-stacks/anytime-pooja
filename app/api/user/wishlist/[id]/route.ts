import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const wishlistId = params.id

    if (!wishlistId) {
      return NextResponse.json({ error: 'Wishlist ID is required' }, { status: 400 })
    }

    // Delete from wishlist
    const result = await query(
      'DELETE FROM wishlist WHERE id = ?',
      [wishlistId]
    ) as any

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Item removed from wishlist'
    })

  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



