import { NextRequest, NextResponse } from "next/server"
import { query, queryWithFallback } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const offset = (page - 1) * limit

    let whereConditions = []
    let queryParams = []
    let paramIndex = 1

    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    if (status) {
      if (status === 'active') {
        whereConditions.push(`is_active = $${paramIndex}`)
        queryParams.push(true)
      } else if (status === 'inactive') {
        whereConditions.push(`is_active = $${paramIndex}`)
        queryParams.push(false)
      }
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM categories ${whereClause}`
    const countResult = await queryWithFallback(countQuery, queryParams) as any[]
    const total = parseInt(countResult[0]?.total || '0')

    // Get categories with pagination
    const categoriesQuery = `
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    queryParams.push(limit, offset)

    const categories = await queryWithFallback(categoriesQuery, queryParams) as any[]

    return NextResponse.json({
      success: true,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse JSON with error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON data' 
      }, { status: 400 })
    }

    const {
      name,
      slug,
      description,
      image,
      is_active,
      sort_order
    } = body

    // Comprehensive validation
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        success: false, 
        error: 'Category name is required' 
      }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category name must be less than 100 characters' 
      }, { status: 400 })
    }

    // Generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    if (!categorySlug || categorySlug.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unable to generate valid slug from category name' 
      }, { status: 400 })
    }

    if (categorySlug.length > 100) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category slug must be less than 100 characters' 
      }, { status: 400 })
    }

    // Check if name already exists
    const existingName = await query(
      'SELECT id FROM categories WHERE name = $1',
      [name.trim()]
    ) as any[]

    if (existingName.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category name already exists' 
      }, { status: 400 })
    }

    // Check if slug already exists
    const existingSlug = await query(
      'SELECT id FROM categories WHERE slug = $1',
      [categorySlug]
    ) as any[]

    if (existingSlug.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Category slug already exists' 
      }, { status: 400 })
    }

    // Validate description length
    if (description && description.length > 1000) {
      return NextResponse.json({ 
        success: false, 
        error: 'Description must be less than 1000 characters' 
      }, { status: 400 })
    }

    // Validate sort_order
    const sortOrder = parseInt(sort_order) || 0
    if (isNaN(sortOrder) || sortOrder < 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sort order must be a non-negative number' 
      }, { status: 400 })
    }

    // Insert new category with error handling and sequence fix
    let result: any[]
    try {
      result = await query(
        `INSERT INTO categories (
          name, slug, description, image, is_active, sort_order
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        ) RETURNING id`,
        [
          name.trim(), 
          categorySlug, 
          description?.trim() || '', 
          image || '', 
          is_active !== false, 
          sortOrder
        ]
      ) as any[]
    } catch (dbError: any) {
      console.error('Database error creating category:', dbError)
      
      // Handle specific database errors
      if (dbError.code === '23505') { // Unique constraint violation
        if (dbError.constraint === 'categories_pkey') {
          // Sequence issue - fix it and retry
          console.log('Fixing sequence for categories table...')
          try {
            // Get current max ID and reset sequence properly
            const maxIdResult = await query('SELECT COALESCE(MAX(id), 0) as max_id FROM categories') as any[]
            const maxId = maxIdResult[0]?.max_id || 0
            const nextId = maxId + 1
            
            console.log(`Current max ID: ${maxId}, Setting sequence to: ${nextId}`)
            
            // Reset the sequence to the correct value
            await query(`SELECT setval('categories_id_seq', ${nextId}, false)`)
            
            // Verify the sequence is set correctly
            const seqResult = await query('SELECT last_value FROM categories_id_seq') as any[]
            console.log(`Sequence now set to: ${seqResult[0]?.last_value}`)
            
            // Retry the insert
            result = await query(
              `INSERT INTO categories (
                name, slug, description, image, is_active, sort_order
              ) VALUES (
                $1, $2, $3, $4, $5, $6
              ) RETURNING id`,
              [
                name.trim(), 
                categorySlug, 
                description?.trim() || '', 
                image || '', 
                is_active !== false, 
                sortOrder
              ]
            ) as any[]
            
            console.log('Category created successfully after sequence fix:', result[0]?.id)
          } catch (retryError: any) {
            console.error('Retry failed, trying manual ID generation:', retryError)
            
            // Last resort: manually generate ID
            try {
              const manualMaxIdResult = await query('SELECT COALESCE(MAX(id), 0) as max_id FROM categories') as any[]
              const manualMaxId = manualMaxIdResult[0]?.max_id || 0
              const manualNextId = manualMaxId + 1
              
              console.log(`Manual ID generation: using ID ${manualNextId}`)
              
              result = await query(
                `INSERT INTO categories (
                  id, name, slug, description, image, is_active, sort_order
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7
                ) RETURNING id`,
                [
                  manualNextId,
                  name.trim(), 
                  categorySlug, 
                  description?.trim() || '', 
                  image || '', 
                  is_active !== false, 
                  sortOrder
                ]
              ) as any[]
              
              // Update sequence to match
              await query(`SELECT setval('categories_id_seq', ${manualNextId + 1}, false)`)
              
              console.log('Category created successfully with manual ID:', result[0]?.id)
            } catch (manualError: any) {
              console.error('Manual ID generation also failed:', manualError)
              return NextResponse.json({ 
                success: false, 
                error: `Failed to create category: ${manualError.message}` 
              }, { status: 500 })
            }
          }
        } else if (dbError.constraint === 'categories_name_key') {
          return NextResponse.json({ 
            success: false, 
            error: 'Category name already exists' 
          }, { status: 400 })
        } else if (dbError.constraint === 'categories_slug_key') {
          return NextResponse.json({ 
            success: false, 
            error: 'Category slug already exists' 
          }, { status: 400 })
        }
      }
      
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create category due to database error' 
      }, { status: 500 })
    }

    if (!result || result.length === 0 || !result[0]?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create category - no ID returned' 
      }, { status: 500 })
    }

    console.log('Category created successfully:', {
      categoryId: result[0].id,
      name: name.trim(),
      slug: categorySlug
    })

    return NextResponse.json({
      success: true,
      categoryId: result[0].id,
      message: 'Category created successfully'
    })

  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create category' 
    }, { status: 500 })
  }
}
