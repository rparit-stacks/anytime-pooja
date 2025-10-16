import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import jwt from "jsonwebtoken"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 Order details API called for order ID:', id)
    
    // Try to get user ID from authorization header first
    let userId = null
    const authHeader = request.headers.get('authorization')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '6dbff0f37cbebbe9bf17c43548c40d382c9000d31537f76f601b16955e3c628e70d4f30cb60993f2690665a7b6b4745951dd8e24029b196f69cdb0d1815cc11b') as any
        userId = decoded.userId
        console.log('✅ JWT verification successful, user ID:', userId)
      } catch (jwtError) {
        console.log('❌ JWT verification failed, trying alternative method')
      }
    }
    
    // If no JWT token or verification failed, try to get user ID from query params
    if (!userId) {
      const { searchParams } = new URL(request.url)
      userId = searchParams.get('userId')
      console.log('🔄 Using userId from query params:', userId)
    }
    
    if (!userId) {
      console.log('❌ No user ID found')
      return NextResponse.json({ error: 'User authentication required' }, { status: 401 })
    }

    console.log('🔍 Querying orders for order ID:', id, 'user ID:', userId)
    const orders = await query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    ) as any[]

    console.log('📦 Orders found:', orders.length)
    if (orders.length === 0) {
      console.log('❌ No orders found for this user and order ID')
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orders[0]
    console.log('✅ Order found:', { id: order.id, order_number: order.order_number, status: order.status })

    // Get order items
    console.log('🔍 Fetching order items for order ID:', id)
    const orderItems = await query(
      `SELECT oi.*, p.image 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = $1`,
      [id]
    ) as any[]

    console.log('🛍️ Order items found:', orderItems.length)

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