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

    const paymentMethods = await query(
      'SELECT * FROM user_payment_methods WHERE id = ? AND user_id = ?',
      [id, decoded.userId]
    ) as any[]

    if (paymentMethods.length === 0) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    const method = paymentMethods[0]

    return NextResponse.json({
      success: true,
      paymentMethod: {
        id: method.id,
        payment_type: method.payment_type,
        card_number: method.card_number,
        card_holder_name: method.card_holder_name,
        expiry_month: method.expiry_month,
        expiry_year: method.expiry_year,
        upi_id: method.upi_id,
        wallet_type: method.wallet_type,
        bank_name: method.bank_name,
        is_default: Boolean(method.is_default),
        is_active: Boolean(method.is_active),
        created_at: method.created_at
      }
    })

  } catch (error) {
    console.error('Error fetching payment method:', error)
    return NextResponse.json({ error: 'Failed to fetch payment method' }, { status: 500 })
  }
}

export async function PUT(
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

    const {
      payment_type,
      card_number,
      card_holder_name,
      expiry_month,
      expiry_year,
      upi_id,
      wallet_type,
      bank_name,
      account_number,
      is_default
    } = await request.json()

    // If setting as default, unset other default payment methods
    if (is_default) {
      await query(
        'UPDATE user_payment_methods SET is_default = false WHERE user_id = ?',
        [decoded.userId]
      )
    }

    await query(
      `UPDATE user_payment_methods SET 
       payment_type = ?, card_number = ?, card_holder_name = ?, expiry_month = ?, expiry_year = ?,
       upi_id = ?, wallet_type = ?, bank_name = ?, account_number = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [
        payment_type, card_number, card_holder_name, expiry_month, expiry_year,
        upi_id, wallet_type, bank_name, account_number, is_default,
        id, decoded.userId
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Payment method updated successfully'
    })

  } catch (error) {
    console.error('Error updating payment method:', error)
    return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 })
  }
}

export async function DELETE(
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

    const result = await query(
      'DELETE FROM user_payment_methods WHERE id = ? AND user_id = ?',
      [id, decoded.userId]
    ) as any

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting payment method:', error)
    return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 })
  }
}