import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const paymentMethods = await query(
      'SELECT * FROM user_payment_methods WHERE user_id = ? AND is_active = 1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    ) as any[]

    return NextResponse.json({
      success: true,
      paymentMethods: paymentMethods.map(method => ({
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
      }))
    })

  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      user_id,
      payment_type,
      card_number,
      card_holder_name,
      expiry_month,
      expiry_year,
      cvv,
      upi_id,
      wallet_type,
      bank_name,
      account_number,
      is_default
    } = await request.json()

    if (!user_id || !payment_type) {
      return NextResponse.json({ error: 'User ID and payment type are required' }, { status: 400 })
    }

    // If setting as default, unset other default payment methods
    if (is_default) {
      await query(
        'UPDATE user_payment_methods SET is_default = 0 WHERE user_id = ?',
        [user_id]
      )
    }

    // Insert new payment method
    await query(
      `INSERT INTO user_payment_methods 
       (user_id, payment_type, card_number, card_holder_name, expiry_month, expiry_year, 
        upi_id, wallet_type, bank_name, account_number, is_default) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, payment_type, card_number, card_holder_name, expiry_month, expiry_year,
        upi_id, wallet_type, bank_name, account_number, is_default
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Payment method added successfully'
    })

  } catch (error) {
    console.error('Error adding payment method:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



