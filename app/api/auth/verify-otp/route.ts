import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, otp, purpose = 'registration', userData } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    // Find OTP in database
    const otpRecords = await query(
      'SELECT * FROM otp_verification WHERE email = ? AND purpose = ? AND is_verified = false ORDER BY created_at DESC LIMIT 1',
      [email, purpose]
    ) as any[]

    if (otpRecords.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    const otpRecord = otpRecords[0]

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 })
    }

    // Verify OTP
    if (otpRecord.otp_code !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    // Mark OTP as verified
    await query(
      'UPDATE otp_verification SET is_verified = true WHERE id = ?',
      [otpRecord.id]
    )

    if (purpose === 'registration') {
      // Create user account
      if (!userData || !userData.firstName || !userData.lastName || !userData.password) {
        return NextResponse.json({ error: 'User data is required for registration' }, { status: 400 })
      }

      // Hash password
      const saltRounds = 12
      const passwordHash = await bcrypt.hash(userData.password, saltRounds)

      // Create user
      const result = await query(
        `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active, email_verified) 
         VALUES (?, ?, ?, ?, ?, 1, 1)`,
        [userData.firstName, userData.lastName, email, userData.phone || null, passwordHash]
      ) as any

      const userId = result.insertId

      // Generate JWT token
      const token = jwt.sign(
        { userId, email },
        process.env.JWT_SECRET || '6dbff0f37cbebbe9bf17c43548c40d382c9000d31537f76f601b16955e3c628e70d4f30cb60993f2690665a7b6b4745951dd8e24029b196f69cdb0d1815cc11b',
        { expiresIn: '7d' }
      )

      return NextResponse.json({
        success: true,
        message: 'Account created successfully',
        user: {
          id: userId,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: email,
          phone: userData.phone,
          email_verified: true
        },
        token
      })
    }

    if (purpose === 'login') {
      // Get user data
      const users = await query(
        'SELECT id, first_name, last_name, email, phone, is_active, email_verified FROM users WHERE email = ?',
        [email]
      ) as any[]

      if (users.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const user = users[0]

      if (!user.is_active) {
        return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 })
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || '6dbff0f37cbebbe9bf17c43548c40d382c9000d31537f76f601b16955e3c628e70d4f30cb60993f2690665a7b6b4745951dd8e24029b196f69cdb0d1815cc11b',
        { expiresIn: '7d' }
      )

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user,
        token
      })
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    })

  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
