import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary'
import { handleApiError, validateFileUpload, AppError } from '@/lib/error-handler'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'upload'
    const folder = formData.get('folder') as string || 'anytime-pooja'

    // Validate file upload
    validateFileUpload(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      required: true
    })

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `${folder}/${type}`,
          resource_type: 'auto',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(new AppError('Failed to upload file to storage', 500, 'UPLOAD_FAILED', error))
          } else {
            resolve(result)
          }
        }
      ).end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: (result as any).secure_url,
      public_id: (result as any).public_id,
      filename: file.name,
      size: file.size,
      type: file.type,
      message: 'File uploaded successfully'
    })

  } catch (error) {
    return handleApiError(error)
  }
}