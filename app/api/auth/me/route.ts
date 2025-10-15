import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '6dbff0f37cbebbe9bf17c43548c40d382c9000d31537f76f601b16955e3c628e70d4f30cb60993f2690665a7b6b4745951dd8e24029b196f69cdb0d1815cc11b') as any

    const users = await query(
      'SELECT id, first_name, last_name, email, phone, is_active, email_verified FROM users WHERE id = ?',
      [decoded.userId]
    ) as any[]

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = users[0]

    if (!user.is_active) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        profile_image: null // Default value since column doesn't exist
      }
    })

  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
