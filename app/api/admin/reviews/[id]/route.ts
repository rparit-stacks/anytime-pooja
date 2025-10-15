import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { isApproved, isVerified } = body
    
    const sql = `
      UPDATE reviews 
      SET is_approved = ?, is_verified = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    
    const { id } = await params
    await query(sql, [isApproved, isVerified, id])
    
    return NextResponse.json({ success: true, message: 'Review updated successfully' })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sql = 'DELETE FROM reviews WHERE id = ?'
    await query(sql, [id])
    
    return NextResponse.json({ success: true, message: 'Review deleted successfully' })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
