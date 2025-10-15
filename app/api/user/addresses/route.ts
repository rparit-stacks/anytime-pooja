import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const addresses = await query(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    ) as any[]

    return NextResponse.json({
      success: true,
      addresses
    })

  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, type, first_name, last_name, company, address_line_1, address_line_2, city, state, postal_code, country, phone, is_default } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!first_name || !last_name || !address_line_1 || !city || !state || !postal_code) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    // If this is set as default, unset other default addresses of the same type
    if (is_default) {
      await query(
        'UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND type = ?',
        [user_id, type]
      )
    }

    const result = await query(
      `INSERT INTO user_addresses (
        user_id, type, first_name, last_name, company,
        address_line_1, address_line_2, city, state, postal_code, country, phone, is_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, type, first_name, last_name, company || '', address_line_1, address_line_2 || '', city, state, postal_code, country, phone || '', is_default]
    ) as any

    return NextResponse.json({
      success: true,
      addressId: result.insertId,
      message: 'Address added successfully'
    })

  } catch (error) {
    console.error('Error adding address:', error)
    return NextResponse.json({ error: 'Failed to add address' }, { status: 500 })
  }
}
