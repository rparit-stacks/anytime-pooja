import { NextRequest, NextResponse } from 'next/server'

export interface ApiError {
  error: string
  code?: string
  details?: any
  statusCode: number
}

export class AppError extends Error {
  public statusCode: number
  public code?: string
  public details?: any

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        details: error.details
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('validation')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.message
        },
        { status: 400 }
      )
    }

    if (error.message.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Resource not found'
        },
        { status: 404 }
      )
    }

    if (error.message.includes('unauthorized') || error.message.includes('permission')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized access'
        },
        { status: 401 }
      )
    }

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }

  // Unknown error type
  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred'
    },
    { status: 500 }
  )
}

export function validateRequiredFields(data: any, requiredFields: string[]): void {
  const missingFields = requiredFields.filter(field => {
    const value = data[field]
    return value === undefined || value === null || value === ''
  })

  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(', ')}`,
      400,
      'VALIDATION_ERROR',
      { missingFields }
    )
  }
}

export function validateFileUpload(file: File, options: {
  maxSize?: number
  allowedTypes?: string[]
  required?: boolean
} = {}): void {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    required = true
  } = options

  if (required && !file) {
    throw new AppError('No file provided', 400, 'NO_FILE')
  }

  if (file) {
    if (file.size > maxSize) {
      throw new AppError(
        `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
        400,
        'FILE_TOO_LARGE',
        { maxSize, actualSize: file.size }
      )
    }

    if (!allowedTypes.includes(file.type)) {
      throw new AppError(
        `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        400,
        'INVALID_FILE_TYPE',
        { allowedTypes, actualType: file.type }
      )
    }
  }
}

export function validateProductData(data: any): void {
  validateRequiredFields(data, ['name', 'price', 'category_id'])

  if (data.price && (isNaN(parseFloat(data.price)) || parseFloat(data.price) < 0)) {
    throw new AppError('Price must be a valid positive number', 400, 'INVALID_PRICE')
  }

  if (data.stock_quantity && (isNaN(parseInt(data.stock_quantity)) || parseInt(data.stock_quantity) < 0)) {
    throw new AppError('Stock quantity must be a valid non-negative number', 400, 'INVALID_STOCK')
  }

  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
    throw new AppError('Slug can only contain lowercase letters, numbers, and hyphens', 400, 'INVALID_SLUG')
  }
}

export function withErrorHandler(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleApiError(error)
    }
  }
}
