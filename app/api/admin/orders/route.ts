import { NextRequest, NextResponse } from "next/server"
import { query, queryWithFallback } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const paymentStatus = searchParams.get('payment_status') || ''

    const offset = (page - 1) * limit

    let whereConditions = []
    let queryParams = []
    let paramIndex = 1

    if (search) {
      whereConditions.push(`(order_number ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR billing_first_name ILIKE $${paramIndex} OR billing_last_name ILIKE $${paramIndex})`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex}`)
      queryParams.push(status)
      paramIndex++
    }

    if (paymentStatus) {
      whereConditions.push(`payment_status = $${paramIndex}`)
      queryParams.push(paymentStatus)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Get total count (separate query for count to avoid GROUP BY issues)
    const countQuery = `SELECT COUNT(DISTINCT o.id) as total FROM orders o ${whereClause}`
    const countResult = await queryWithFallback(countQuery, queryParams) as any[]
    const total = parseInt(countResult[0]?.total || '0')

    // Get orders with pagination and item count
    const ordersQuery = `
      SELECT 
        o.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email,
        COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      ${whereClause}
      GROUP BY o.id, u.first_name, u.last_name, u.email
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    queryParams.push(limit, offset)

    const orders = await queryWithFallback(ordersQuery, queryParams) as any[]

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await queryWithFallback(
          `SELECT 
            oi.*,
            p.image as product_image,
            p.name as product_name
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1`,
          [order.id]
        ) as any[]

        return {
          ...order,
          items: orderItems,
          items_count: parseInt(order.items_count) || 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, status, payment_status, tracking_number, estimated_delivery, notes } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Check if order exists
    const existingOrder = await query(
      'SELECT id FROM orders WHERE id = $1',
      [orderId]
    ) as any[]

    if (existingOrder.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Build update query dynamically
    const updateFields = []
    const updateValues = []
    let paramIndex = 1

    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex}`)
      updateValues.push(status)
      paramIndex++
    }

    if (payment_status !== undefined) {
      updateFields.push(`payment_status = $${paramIndex}`)
      updateValues.push(payment_status)
      paramIndex++
    }

    if (tracking_number !== undefined) {
      updateFields.push(`tracking_number = $${paramIndex}`)
      updateValues.push(tracking_number)
      paramIndex++
    }

    if (estimated_delivery !== undefined) {
      updateFields.push(`estimated_delivery = $${paramIndex}`)
      updateValues.push(estimated_delivery)
      paramIndex++
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex}`)
      updateValues.push(notes)
      paramIndex++
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    updateFields.push(`updated_at = NOW()`)
    updateValues.push(orderId)

    const updateQuery = `
      UPDATE orders 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
    `

    await query(updateQuery, updateValues)

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    })

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
