import { NextRequest, NextResponse } from "next/server"
import { query, queryWithFallback } from "@/lib/database"
import { handleApiError, validateProductData, AppError } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

    const offset = (page - 1) * limit

    let whereConditions = []
    let queryParams = []
    let paramIndex = 1

    if (search) {
      whereConditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    if (category) {
      whereConditions.push(`p.category_id = $${paramIndex}`)
      queryParams.push(category)
      paramIndex++
    }

    if (status) {
      if (status === 'active') {
        whereConditions.push(`p.is_active = $${paramIndex}`)
        queryParams.push(true)
      } else if (status === 'inactive') {
        whereConditions.push(`p.is_active = $${paramIndex}`)
        queryParams.push(false)
      } else if (status === 'featured') {
        whereConditions.push(`p.is_featured = $${paramIndex}`)
        queryParams.push(true)
      }
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `
    const countResult = await queryWithFallback(countQuery, queryParams) as any[]
    const total = parseInt(countResult[0]?.total || '0')

    // Get products with pagination
    const productsQuery = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    queryParams.push(limit, offset)

    const products = await queryWithFallback(productsQuery, queryParams) as any[]

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      slug,
      description,
      short_description,
      price,
      original_price,
      image,
      gallery,
      category_id,
      stock_quantity,
      is_active,
      is_featured,
      badge,
      weight,
      dimensions,
      material,
      origin
    } = body

    // Validate product data
    validateProductData(body)

    // Generate slug if not provided
    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if slug already exists
    const existingProduct = await query(
      'SELECT id FROM products WHERE slug = $1',
      [productSlug]
    ) as any[]

    if (existingProduct.length > 0) {
      throw new AppError('Product slug already exists', 400, 'SLUG_EXISTS')
    }

    // Insert new product (let PostgreSQL auto-generate the ID)
    let result: any[]
    try {
      result = await query(
        `INSERT INTO products (
          name, slug, description, short_description, price, original_price,
          image, gallery, category_id, stock_quantity, is_active, is_featured,
          badge, weight, dimensions, material, origin
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        ) RETURNING id`,
        [
          name, productSlug, description || '', short_description || '', price, original_price || null,
          image || '', gallery ? JSON.stringify(gallery) : null, category_id, stock_quantity || 0,
          is_active !== false, is_featured || false, badge || '', weight || null,
          dimensions || '', material || '', origin || ''
        ]
      ) as any[]
    } catch (error: any) {
      // If there's a duplicate key error, try to fix the sequence and retry
      if (error.code === '23505' && error.constraint === 'products_pkey') {
        console.log('Fixing sequence for products table...')
        try {
          // Reset the sequence to the correct value
          await query('SELECT setval(\'products_id_seq\', (SELECT COALESCE(MAX(id), 0) + 1 FROM products), false)')
          
          // Retry the insert
          result = await query(
            `INSERT INTO products (
              name, slug, description, short_description, price, original_price,
              image, gallery, category_id, stock_quantity, is_active, is_featured,
              badge, weight, dimensions, material, origin
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
            ) RETURNING id`,
            [
              name, productSlug, description || '', short_description || '', price, original_price || null,
              image || '', gallery ? JSON.stringify(gallery) : null, category_id, stock_quantity || 0,
              is_active !== false, is_featured || false, badge || '', weight || null,
              dimensions || '', material || '', origin || ''
            ]
          ) as any[]
        } catch (retryError) {
          throw new AppError('Failed to create product after sequence fix', 500, 'INSERT_FAILED', retryError)
        }
      } else {
        throw error
      }
    }

    return NextResponse.json({
      success: true,
      productId: result[0]?.id,
      message: 'Product created successfully'
    })

  } catch (error) {
    return handleApiError(error)
  }
}
