import { NextRequest, NextResponse } from "next/server"
import { query, queryWithFallback } from "@/lib/database"

export async function GET() {
  try {
    const sql = `
      SELECT 
        u.id,
        u.first_name as firstName,
        u.last_name as lastName,
        u.email,
        u.phone as phoneNumber,
        u.is_active as isActive,
        u.created_at as createdAt,
        COUNT(o.id) as totalOrders,
        COALESCE(SUM(o.total_amount), 0) as totalSpent,
        MAX(o.created_at) as lastOrderDate
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `
    
    const customers = await queryWithFallback(sql) as any[]
    return NextResponse.json({ customers })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}