import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const orderSql = `
      SELECT 
        o.id,
        CONCAT('ORD-', o.id) as orderNumber,
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as customerName,
        COALESCE(u.email, o.email) as customerEmail,
        o.total_amount as totalAmount,
        o.status as orderStatus,
        o.payment_status as paymentStatus,
        o.created_at as orderDate,
        o.payment_method as paymentMethod,
        o.tracking_number as trackingNumber
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `
    
    const { id } = await params
    const order = await query(orderSql, [id]) as any[]
    
    if (order.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    const itemsSql = `
      SELECT 
        oi.id,
        oi.quantity,
        oi.price_at_purchase as priceAtPurchase,
        p.name as productName,
        p.image as productImage
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `
    
    const items = await query(itemsSql, [id]) as any[]
    
    return NextResponse.json({ 
      order: order[0],
      items: items
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { status } = await request.json()
    
    const sql = `
      UPDATE orders 
      SET order_status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    
    const { id } = await params
    await query(sql, [status, id])
    
    return NextResponse.json({ success: true, message: 'Order status updated successfully' })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
