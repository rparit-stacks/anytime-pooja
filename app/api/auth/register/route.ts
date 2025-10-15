import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { sendVerificationEmail } from "@/lib/smtp"

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password } = await request.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email])
    if ((existingUser as any[]).length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, is_active, email_verified) 
       VALUES (?, ?, ?, ?, ?, 1, 0)`,
      [firstName, lastName, email, phone || null, passwordHash]
    ) as any

    const userId = result.insertId

    // Generate email verification token
    const verificationToken = uuidv4()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await query(
      'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, verificationToken, expiresAt]
    )

    // Send verification email
    try {
      await sendVerificationEmail(email, firstName, verificationToken)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail registration if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User registered successfully. Please check your email to verify your account.',
      userId 
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
