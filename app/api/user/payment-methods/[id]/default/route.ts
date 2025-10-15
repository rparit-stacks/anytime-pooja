import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 })
    }

    // Get payment method details
    const paymentMethods = await query(
      'SELECT user_id FROM user_payment_methods WHERE id = ?',
      [paymentId]
    ) as any[]

    if (paymentMethods.length === 0) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    const { user_id } = paymentMethods[0]

    // Unset other default payment methods
    await query(
      'UPDATE user_payment_methods SET is_default = 0 WHERE user_id = ?',
      [user_id]
    )

    // Set this payment method as default
    await query(
      'UPDATE user_payment_methods SET is_default = 1 WHERE id = ?',
      [paymentId]
    )

    return NextResponse.json({
      success: true,
      message: 'Default payment method updated successfully'
    })

  } catch (error) {
    console.error('Error setting default payment method:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



