import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '6dbff0f37cbebbe9bf17c43548c40d382c9000d31537f76f601b16955e3c628e70d4f30cb60993f2690665a7b6b4745951dd8e24029b196f69cdb0d1815cc11b') as any

    const { items, billing, shipping, total } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 })
    }

    if (!billing || !shipping) {
      return NextResponse.json({ error: 'Billing and shipping information are required' }, { status: 400 })
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const orderResult = await query(
      `INSERT INTO orders (
        order_number, user_id, email, phone,
        billing_first_name, billing_last_name, billing_company,
        billing_address_line_1, billing_address_line_2,
        billing_city, billing_state, billing_postal_code, billing_country, billing_phone,
        shipping_first_name, shipping_last_name, shipping_company,
        shipping_address_line_1, shipping_address_line_2,
        shipping_city, shipping_state, shipping_postal_code, shipping_country, shipping_phone,
        subtotal, shipping_cost, tax_amount, discount_amount, total_amount,
        status, payment_status, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber, decoded.userId, billing.email || '', billing.phone || '',
        billing.firstName, billing.lastName, billing.company || '',
        billing.addressLine1, billing.addressLine2 || '',
        billing.city, billing.state, billing.postalCode, billing.country, billing.phone || '',
        shipping.firstName, shipping.lastName, shipping.company || '',
        shipping.addressLine1, shipping.addressLine2 || '',
        shipping.city, shipping.state, shipping.postalCode, shipping.country, shipping.phone || '',
        total, 0, 0, 0, total,
        'pending', 'pending', 'razorpay'
      ]
    ) as any

    const orderId = orderResult.insertId

    // Create order items
    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, total_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.id, item.name, item.price, item.quantity, item.price * item.quantity]
      )
    }

    // Get the created order
    const order = await query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    ) as any[]

    return NextResponse.json({
      success: true,
      order: order[0]
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
