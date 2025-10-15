import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const addressId = params.id

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    // Get address details
    const addresses = await query(
      'SELECT user_id, type FROM user_addresses WHERE id = ?',
      [addressId]
    ) as any[]

    if (addresses.length === 0) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    const { user_id, type } = addresses[0]

    // Unset other default addresses of same type
    await query(
      'UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND type = ?',
      [user_id, type]
    )

    // Set this address as default
    await query(
      'UPDATE user_addresses SET is_default = 1 WHERE id = ?',
      [addressId]
    )

    return NextResponse.json({
      success: true,
      message: 'Default address updated successfully'
    })

  } catch (error) {
    console.error('Error setting default address:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



