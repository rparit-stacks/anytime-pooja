import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const addressId = params.id

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    const addresses = await query(
      'SELECT * FROM user_addresses WHERE id = $1',
      [addressId]
    ) as any[]

    if (addresses.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      address: addresses[0]
    })

  } catch (error) {
    console.error('Error fetching address:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const addressId = params.id
    const {
      type,
      first_name,
      last_name,
      company,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      country,
      phone,
      is_default
    } = await request.json()

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    // Check if address exists
    const existingAddress = await query(
      'SELECT user_id FROM user_addresses WHERE id = $1',
      [addressId]
    ) as any[]

    if (existingAddress.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // If setting as default, unset other default addresses of same type
    if (is_default) {
      await query(
        'UPDATE user_addresses SET is_default = false WHERE user_id = $1 AND type = $2 AND id != $3',
        [existingAddress[0].user_id, type, addressId]
      )
    }

    // Update address
    await query(
      `UPDATE user_addresses SET 
       type = $1, first_name = $2, last_name = $3, company = $4, 
       address_line_1 = $5, address_line_2 = $6, city = $7, state = $8, 
       postal_code = $9, country = $10, phone = $11, is_default = $12
       WHERE id = $13`,
      [
        type, first_name, last_name, company,
        address_line_1, address_line_2, city, state,
        postal_code, country, phone, is_default,
        addressId
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully'
    })

  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const addressId = params.id

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    const result = await query(
      'DELETE FROM user_addresses WHERE id = $1',
      [addressId]
    ) as any

    if (result.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}