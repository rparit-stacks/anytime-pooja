import { NextRequest, NextResponse } from "next/server"
import { query, queryWithFallback } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    
    let sql = `
      SELECT 
        o.id,
        CONCAT('ORD-', o.id) as orderNumber,
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as customerName,
        COALESCE(u.email, o.email) as customerEmail,
        o.total_amount as totalAmount,
        o.status as orderStatus,
        o.payment_status as paymentStatus,
        o.created_at as orderDate,
        COUNT(oi.id) as itemCount
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
    `
    
    const params: any[] = []
    
    if (status && status !== "all") {
      sql += ` HAVING o.status = ?`
      params.push(status)
    }
    
    sql += ` ORDER BY o.created_at DESC`
    
    const orders = await queryWithFallback(sql, params) as any[]
    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}