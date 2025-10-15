import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user orders with order items
    const orders = await query(`
      SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.status,
        o.payment_status,
        o.payment_method,
        o.created_at,
        o.estimated_delivery,
        o.tracking_number
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId]) as any[]

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await query(`
          SELECT 
            id,
            product_name,
            product_price,
            quantity,
            total_price
          FROM order_items
          WHERE order_id = ?
        `, [order.id]) as any[]

        return {
          id: order.id,
          order_number: order.order_number,
          total_amount: parseFloat(order.total_amount),
          status: order.status,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          created_at: order.created_at,
          estimated_delivery: order.estimated_delivery,
          tracking_number: order.tracking_number,
          order_items: orderItems.map((item: any) => ({
            id: item.id,
            product_name: item.product_name,
            product_price: parseFloat(item.product_price),
            quantity: item.quantity,
            total_price: parseFloat(item.total_price)
          }))
        }
      })
    )

    return NextResponse.json({
      success: true,
      orders: ordersWithItems
    })

  } catch (error) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



