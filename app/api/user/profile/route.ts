import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import jwt from "jsonwebtoken"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '6dbff0f37cbebbe9bf17c43548c40d382c9000d31537f76f601b16955e3c628e70d4f30cb60993f2690665a7b6b4745951dd8e24029b196f69cdb0d1815cc11b') as any

    const body = await request.json()
    const { first_name, last_name, phone, bio, date_of_birth, gender } = body

    // For individual field updates, we don't require all fields
    if (first_name && !last_name) {
      return NextResponse.json({ error: 'Last name is required when updating first name' }, { status: 400 })
    }
    if (last_name && !first_name) {
      return NextResponse.json({ error: 'First name is required when updating last name' }, { status: 400 })
    }

    // Note: Profile image upload is handled in POST method

    // Build dynamic update query based on provided fields
    const updateFields = []
    const updateValues = []
    
    if (first_name !== undefined) {
      updateFields.push('first_name = ?')
      updateValues.push(first_name)
    }
    if (last_name !== undefined) {
      updateFields.push('last_name = ?')
      updateValues.push(last_name)
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?')
      updateValues.push(phone)
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?')
      updateValues.push(bio)
    }
    if (date_of_birth !== undefined) {
      updateFields.push('date_of_birth = ?')
      updateValues.push(date_of_birth)
    }
    if (gender !== undefined) {
      updateFields.push('gender = ?')
      updateValues.push(gender)
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    updateValues.push(decoded.userId)
    
    // Update user profile
    await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    )

    // Get updated user data
    const users = await query(
      'SELECT id, first_name, last_name, email, phone, bio, date_of_birth, gender, profile_image, is_active, email_verified FROM users WHERE id = ?',
      [decoded.userId]
    ) as any[]

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: users[0]
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '6dbff0f37cbebbe9bf17c43548c40d382c9000d31537f76f601b16955e3c628e70d4f30cb60993f2690665a7b6b4745951dd8e24029b196f69cdb0d1815cc11b') as any

    const formData = await request.formData()
    const profileImage = formData.get('profileImage') as File | null

    if (!profileImage || profileImage.size === 0) {
      return NextResponse.json({ error: 'Profile image is required' }, { status: 400 })
    }

    // Upload to Cloudinary
    let profileImagePath = ''
    try {
      profileImagePath = await uploadToCloudinary(profileImage, 'profiles')
    } catch (error) {
      console.error('Profile image upload failed:', error)
      return NextResponse.json({ error: 'Failed to upload profile image' }, { status: 500 })
    }

    // Update user profile image
    await query(
      'UPDATE users SET profile_image = ? WHERE id = ?',
      [profileImagePath, decoded.userId]
    )

    return NextResponse.json({
      success: true,
      message: 'Profile image updated successfully',
      profile_image: profileImagePath
    })

  } catch (error) {
    console.error('Error updating profile image:', error)
    return NextResponse.json({ error: 'Failed to update profile image' }, { status: 500 })
  }
}
