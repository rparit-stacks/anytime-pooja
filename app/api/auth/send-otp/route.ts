import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { sendOTPEmail } from "@/lib/smtp"

export async function POST(request: NextRequest) {
  try {
    const { email, purpose = 'registration' } = await request.json()

    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if user exists for login purpose
    if (purpose === 'login') {
      const users = await query('SELECT id FROM users WHERE email = $1', [email]) as any[]
      if (users.length === 0) {
        return NextResponse.json({ error: 'User not found with this email' }, { status: 404 })
      }
    }

    // Check if user already exists for registration purpose
    if (purpose === 'registration') {
      const users = await query('SELECT id FROM users WHERE email = $1', [email]) as any[]
      if (users.length > 0) {
        return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 })
      }
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Set expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    // Delete any existing OTP for this email and purpose
    await query(
      'DELETE FROM otp_verification WHERE email = $1 AND purpose = $2',
      [email, purpose]
    )

    // Store OTP in database
    await query(
      'INSERT INTO otp_verification (email, otp_code, purpose, expires_at) VALUES ($1, $2, $3, $4)',
      [email, otpCode, purpose, expiresAt]
    )

    // Send OTP via email
    try {
      const emailSent = await sendOTPEmail(email, otpCode, purpose)
      if (!emailSent) {
        console.log('Email sending failed, but continuing with OTP generation')
        // Don't fail the request if email fails, just log it
      }
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError)
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your email',
      expiresIn: 300, // 5 minutes in seconds
      otp: otpCode // Include OTP in response for testing (remove in production)
    })

  } catch (error) {
    console.error('Error sending OTP:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
