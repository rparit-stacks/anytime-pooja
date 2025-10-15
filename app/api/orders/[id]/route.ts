import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import jwt from "jsonwebtoken"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '6dbff0f37cbebbe9bf17c43548c40d382c9000d31537f76f601b16955e3c628e70d4f30cb60993f2690665a7b6b4745951dd8e24029b196f69cdb0d1815cc11b') as any

    const orders = await query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, decoded.userId]
    ) as any[]

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orders[0]

    // Get order items
    const orderItems = await query(
      `SELECT oi.*, p.image 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [id]
    ) as any[]

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        total_amount: parseFloat(order.total_amount),
        created_at: order.created_at,
        order_items: orderItems.map((item: any) => ({
          id: item.id,
          product_name: item.product_name,
          product_price: parseFloat(item.product_price),
          quantity: item.quantity,
          total_price: parseFloat(item.total_price),
          image: item.image
        })),
        billing_first_name: order.billing_first_name,
        billing_last_name: order.billing_last_name,
        billing_address_line_1: order.billing_address_line_1,
        billing_city: order.billing_city,
        billing_state: order.billing_state,
        billing_postal_code: order.billing_postal_code,
        billing_country: order.billing_country,
        shipping_first_name: order.shipping_first_name,
        shipping_last_name: order.shipping_last_name,
        shipping_address_line_1: order.shipping_address_line_1,
        shipping_city: order.shipping_city,
        shipping_state: order.shipping_state,
        shipping_postal_code: order.shipping_postal_code,
        shipping_country: order.shipping_country
      }
    })

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}