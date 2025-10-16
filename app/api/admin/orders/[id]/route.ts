import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { handleApiError } from '@/lib/error-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get order details
    const orderResult = await query(
      `SELECT 
        o.*,
        u.first_name as user_first_name,
        u.last_name as user_last_name,
        u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1`,
      [id]
    ) as any[]

    if (orderResult.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 })
    }

    const order = orderResult[0]

    // Get order items
    const orderItems = await query(
      `SELECT 
        oi.*,
        p.image as product_image,
        p.name as product_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1`,
      [id]
    ) as any[]

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: orderItems
      }
    })

  } catch (error) {
    return handleApiError(error)
  }
}
