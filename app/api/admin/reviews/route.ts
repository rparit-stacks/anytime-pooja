import { NextRequest, NextResponse } from "next/server"
import { query, queryWithFallback } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const productId = url.searchParams.get('productId')
    const status = url.searchParams.get('status') || 'all'
    
    let sql = `
      SELECT 
        r.id,
        r.product_id as productId,
        p.name as productName,
        r.user_name as userName,
        r.user_email as userEmail,
        r.rating,
        r.title,
        r.comment,
        r.is_verified as isVerified,
        r.is_approved as isApproved,
        r.created_at as createdAt,
        r.updated_at as updatedAt
      FROM reviews r
      JOIN products p ON r.product_id = p.id
    `
    
    const params: any[] = []
    
    if (productId) {
      sql += ` WHERE r.product_id = ?`
      params.push(productId)
    }
    
    if (status === 'approved') {
      sql += productId ? ` AND r.is_approved = true` : ` WHERE r.is_approved = true`
    } else if (status === 'pending') {
      sql += productId ? ` AND r.is_approved = false` : ` WHERE r.is_approved = false`
    }
    
    sql += ` ORDER BY r.created_at DESC`
    
    const reviews = await queryWithFallback(sql, params) as any[]
    
    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
