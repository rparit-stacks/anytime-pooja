import { NextRequest, NextResponse } from "next/server"
import { queryDirect } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sql = `
      SELECT 
        id,
        user_name as userName,
        user_email as userEmail,
        rating,
        title,
        comment,
        is_verified as isVerified,
        is_approved as isApproved,
        created_at as createdAt
      FROM reviews
      WHERE product_id = ? AND is_approved = true
      ORDER BY created_at DESC
    `
    
    const reviews = await queryDirect(sql, [id]) as any[]
    
    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userName, userEmail, rating, title, comment } = body
    
    // Validate required fields
    if (!userName || !userEmail || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }
    
    const sql = `
      INSERT INTO reviews (product_id, user_name, user_email, rating, title, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    
    await queryDirect(sql, [id, userName, userEmail, rating, title, comment])
    
    return NextResponse.json({ success: true, message: 'Review submitted successfully' })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
