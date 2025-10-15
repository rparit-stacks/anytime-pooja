import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_data } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 })
    }

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '0VTU4vOmb5B05UaaVKlsaxT7')
      .update(body.toString())
      .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // Save order to database
    if (order_data) {
      try {
        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        
        // Get address details
        const billingAddress = await query(
          'SELECT * FROM user_addresses WHERE id = ?',
          [order_data.billing_address_id]
        ) as any[]
        
        const shippingAddress = await query(
          'SELECT * FROM user_addresses WHERE id = ?',
          [order_data.shipping_address_id]
        ) as any[]

        if (billingAddress.length === 0 || shippingAddress.length === 0) {
          return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
        }

        const billing = billingAddress[0]
        const shipping = shippingAddress[0]

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
            status, payment_status, payment_method, payment_reference
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderNumber, order_data.user_id || null, billing.phone || '', billing.phone || '',
            billing.first_name, billing.last_name, billing.company || '',
            billing.address_line_1, billing.address_line_2 || '',
            billing.city, billing.state, billing.postal_code, billing.country, billing.phone || '',
            shipping.first_name, shipping.last_name, shipping.company || '',
            shipping.address_line_1, shipping.address_line_2 || '',
            shipping.city, shipping.state, shipping.postal_code, shipping.country, shipping.phone || '',
            order_data.subtotal, order_data.shipping_cost, order_data.tax, 0, order_data.total,
            'confirmed', 'paid', order_data.payment_method, razorpay_payment_id
          ]
        ) as any

        const orderId = orderResult.insertId

        if (!orderId) {
          throw new Error('Failed to create order - no order ID returned')
        }

        // Create order items
        for (const item of order_data.items) {
          await query(
            `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, total_price)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [orderId, parseInt(item.id) || null, item.name, item.price, item.quantity, item.price * item.quantity]
          )
        }


        console.log('Order created successfully:', { orderId, orderNumber, payment_id: razorpay_payment_id })
        
        // Send order confirmation email
        try {
          const { sendOrderConfirmationEmail } = await import('@/lib/smtp')
          
          // Create order object with email for email sending
          const orderForEmail = {
            ...order_data,
            order_number: orderNumber,
            email: billing.phone || order_data.email, // Use billing phone as email fallback
            first_name: billing.first_name,
            last_name: billing.last_name,
            created_at: new Date().toISOString(),
            payment_status: 'paid',
            total_amount: order_data.total,
            shipping_first_name: shipping.first_name,
            shipping_last_name: shipping.last_name,
            shipping_address_line_1: shipping.address_line_1,
            shipping_address_line_2: shipping.address_line_2,
            shipping_city: shipping.city,
            shipping_state: shipping.state,
            shipping_postal_code: shipping.postal_code,
            shipping_country: shipping.country,
            shipping_phone: shipping.phone
          }
          
          await sendOrderConfirmationEmail(orderForEmail, order_data.items)
          console.log('Order confirmation email sent successfully')
        } catch (emailError) {
          console.error('Failed to send order confirmation email:', emailError)
          // Don't fail the order creation if email fails
        }
        
        return NextResponse.json({
          success: true,
          order_id: orderId,
          order_number: orderNumber,
          payment_id: razorpay_payment_id,
          message: 'Payment verified and order created successfully'
        })
      } catch (dbError) {
        console.error('Database error:', dbError)
        return NextResponse.json({ error: 'Payment verified but failed to save order' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      payment_id: razorpay_payment_id,
      message: 'Payment verified successfully'
    })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}