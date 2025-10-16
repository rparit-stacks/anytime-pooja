import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || '4'

    console.log(`🔍 Debugging user data for user ID: ${userId}`)

    // Check if user exists
    const user = await query(
      'SELECT id, first_name, last_name, email, phone FROM users WHERE id = $1',
      [userId]
    ) as any[]

    console.log('👤 User data:', user)

    // Check addresses
    const addresses = await query(
      'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    ) as any[]

    console.log('📍 Addresses data:', addresses)

    // Check orders
    const orders = await query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    ) as any[]

    console.log('📦 Orders data:', orders)

    // Check order items
    const orderItems = await query(
      'SELECT * FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE user_id = $1)',
      [userId]
    ) as any[]

    console.log('🛍️ Order items data:', orderItems)

    // Test specific order details if orders exist
    let orderDetailsTest = null
    if (orders.length > 0) {
      const firstOrderId = orders[0].id
      console.log('🔍 Testing order details for order ID:', firstOrderId)
      
      try {
        const orderDetails = await query(
          'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
          [firstOrderId, userId]
        ) as any[]
        
        const orderItemsForOrder = await query(
          `SELECT oi.*, p.image 
           FROM order_items oi 
           LEFT JOIN products p ON oi.product_id = p.id 
           WHERE oi.order_id = $1`,
          [firstOrderId]
        ) as any[]
        
        orderDetailsTest = {
          orderId: firstOrderId,
          orderFound: orderDetails.length > 0,
          orderData: orderDetails[0] || null,
          orderItemsCount: orderItemsForOrder.length,
          orderItems: orderItemsForOrder
        }
        
        console.log('🔍 Order details test result:', orderDetailsTest)
      } catch (error) {
        console.error('❌ Order details test failed:', error)
        orderDetailsTest = { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        userId,
        user: user[0] || null,
        userExists: user.length > 0,
        addresses: {
          count: addresses.length,
          data: addresses
        },
        orders: {
          count: orders.length,
          data: orders
        },
        orderItems: {
          count: orderItems.length,
          data: orderItems
        },
        orderDetailsTest
      }
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
