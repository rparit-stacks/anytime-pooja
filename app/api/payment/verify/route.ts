import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    // Parse JSON with error handling
    let requestData
    try {
      requestData = await request.json()
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_data } = requestData

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
    if (order_data && order_data.items && order_data.items.length > 0) {
      try {
        // Validate required order data
        if (!order_data.billing_address_id || !order_data.shipping_address_id) {
          return NextResponse.json({ error: 'Missing address information' }, { status: 400 })
        }

        if (!order_data.subtotal || !order_data.total) {
          return NextResponse.json({ error: 'Missing order amount information' }, { status: 400 })
        }

        // Generate order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        
        // Get address details (PostgreSQL syntax)
        const billingAddress = await query(
          'SELECT * FROM user_addresses WHERE id = $1',
          [order_data.billing_address_id]
        ) as any[]
        
        const shippingAddress = await query(
          'SELECT * FROM user_addresses WHERE id = $1',
          [order_data.shipping_address_id]
        ) as any[]

        if (billingAddress.length === 0 || shippingAddress.length === 0) {
          return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
        }

        const billing = billingAddress[0]
        const shipping = shippingAddress[0]

        // Create order (PostgreSQL syntax) with better error handling
        console.log('Creating order with data:', {
          orderNumber,
          userId: order_data.user_id,
          email: order_data.email || billing.email,
          phone: billing.phone,
          subtotal: order_data.subtotal,
          total: order_data.total,
          paymentId: razorpay_payment_id
        })

        let orderResult
        try {
          orderResult = await query(
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
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33) RETURNING id`,
            [
              orderNumber, order_data.user_id || null, order_data.email || billing.email || '', billing.phone || '',
              billing.first_name, billing.last_name, billing.company || '',
              billing.address_line_1, billing.address_line_2 || '',
              billing.city, billing.state, billing.postal_code, billing.country, billing.phone || '',
              shipping.first_name, shipping.last_name, shipping.company || '',
              shipping.address_line_1, shipping.address_line_2 || '',
              shipping.city, shipping.state, shipping.postal_code, shipping.country, shipping.phone || '',
              order_data.subtotal, order_data.shipping_cost, order_data.tax, 0, order_data.total,
              'confirmed', 'paid', order_data.payment_method, razorpay_payment_id
            ]
          ) as any[]
        } catch (dbError: any) {
          // Handle duplicate key error for orders_pkey
          if (dbError.code === '23505' && dbError.constraint === 'orders_pkey') {
            console.log('Orders sequence out of sync, fixing...')
            try {
              // Fix the sequence
              await query('SELECT setval(\'orders_id_seq\', (SELECT COALESCE(MAX(id), 0) + 1 FROM orders), false)')
              console.log('Orders sequence fixed, retrying order creation...')
              
              // Retry the insert
              orderResult = await query(
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
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33) RETURNING id`,
                [
                  orderNumber, order_data.user_id || null, order_data.email || billing.email || '', billing.phone || '',
                  billing.first_name, billing.last_name, billing.company || '',
                  billing.address_line_1, billing.address_line_2 || '',
                  billing.city, billing.state, billing.postal_code, billing.country, billing.phone || '',
                  shipping.first_name, shipping.last_name, shipping.company || '',
                  shipping.address_line_1, shipping.address_line_2 || '',
                  shipping.city, shipping.state, shipping.postal_code, shipping.country, shipping.phone || '',
                  order_data.subtotal, order_data.shipping_cost, order_data.tax, 0, order_data.total,
                  'confirmed', 'paid', order_data.payment_method, razorpay_payment_id
                ]
              ) as any[]
            } catch (retryError) {
              console.error('Failed to create order even after sequence fix:', retryError)
              throw retryError
            }
          } else {
            throw dbError
          }
        }

        console.log('Order creation result:', orderResult)

        const orderId = orderResult[0]?.id

        if (!orderId) {
          throw new Error('Failed to create order - no order ID returned')
        }

        // Create order items (PostgreSQL syntax) with better error handling
        console.log('Creating order items:', order_data.items)
        for (const item of order_data.items) {
          console.log('Creating order item:', {
            orderId,
            productId: item.id,
            productName: item.name,
            price: item.price,
            quantity: item.quantity
          })
          
          await query(
            `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, total_price)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [orderId, parseInt(item.id) || null, item.name, item.price, item.quantity, item.price * item.quantity]
          )
        }
        console.log('All order items created successfully')


        console.log('Order created successfully:', { orderId, orderNumber, payment_id: razorpay_payment_id })
        
        // Send order confirmation email
        try {
          const { sendOrderConfirmationEmail } = await import('@/lib/smtp')
          
          // Create order object with email for email sending
          const orderForEmail = {
            ...order_data,
            order_number: orderNumber,
            email: order_data.email || billing.email || shipping.email, // Use proper email field with fallbacks
            billing_email: billing.email,
            shipping_email: shipping.email,
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
          
          console.log('Order data for email:', {
            email: orderForEmail.email,
            billing_email: orderForEmail.billing_email,
            shipping_email: orderForEmail.shipping_email,
            order_number: orderForEmail.order_number
          })
          
          // Only send email if we have a valid email address
          if (orderForEmail.email && orderForEmail.email.includes('@')) {
            await sendOrderConfirmationEmail(orderForEmail, order_data.items)
            console.log('Order confirmation email sent successfully')
          } else {
            console.warn('No valid email address found, skipping order confirmation email')
          }
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