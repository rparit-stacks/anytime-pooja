import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { handleApiError, validateProductData, AppError } from '@/lib/error-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const products = await query(
      `SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1`,
      [id]
    ) as any[]

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = products[0]
    
    // Parse gallery if it exists
    if (product.gallery) {
      try {
        // If it's already an array, use it directly
        if (Array.isArray(product.gallery)) {
          // Already an array, no need to parse
        } else if (typeof product.gallery === 'string') {
          product.gallery = JSON.parse(product.gallery)
        }
      } catch (e) {
        console.error('Error parsing gallery:', e)
        product.gallery = []
      }
    } else {
      product.gallery = []
    }

    return NextResponse.json({
      success: true,
      product
    })

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Check if product exists
    const existingProduct = await query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    ) as any[]

    if (existingProduct.length === 0) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND')
    }

    // Generate slug if not provided
    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    // Check if slug already exists for different product
    const slugCheck = await query(
      'SELECT id FROM products WHERE slug = $1 AND id != $2',
      [productSlug, id]
    ) as any[]

    if (slugCheck.length > 0) {
      throw new AppError('Product slug already exists', 400, 'SLUG_EXISTS')
    }

    // Update product
    await query(
      `UPDATE products SET
        name = $1, slug = $2, description = $3, short_description = $4,
        price = $5, original_price = $6, image = $7, gallery = $8,
        category_id = $9, stock_quantity = $10, is_active = $11, is_featured = $12,
        badge = $13, weight = $14, dimensions = $15, material = $16, origin = $17,
        updated_at = NOW()
      WHERE id = $18`,
      [
        name, productSlug, description || '', short_description || '', price, original_price || null,
        image || '', gallery ? JSON.stringify(gallery) : null, category_id, stock_quantity || 0,
        is_active !== false, is_featured || false, badge || '', weight || null,
        dimensions || '', material || '', origin || '', id
      ]
    )

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully'
    })

  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if product exists
    const existingProduct = await query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    ) as any[]

    if (existingProduct.length === 0) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND')
    }

    // Build dynamic update query based on provided fields
    const updateFields = []
    const updateValues = []
    let paramIndex = 1

    // List of allowed fields for partial updates
    const allowedFields = [
      'name', 'slug', 'description', 'short_description', 'price', 'original_price',
      'image', 'gallery', 'category_id', 'stock_quantity', 'is_active', 'is_featured',
      'badge', 'weight', 'dimensions', 'material', 'origin'
    ]

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'slug') {
          // Check if slug already exists for different product
          const slugCheck = await query(
            'SELECT id FROM products WHERE slug = $1 AND id != $2',
            [value, id]
          ) as any[]
          
          if (slugCheck.length > 0) {
            throw new AppError('Product slug already exists', 400, 'SLUG_EXISTS')
          }
        }
        
        if (key === 'gallery' && Array.isArray(value)) {
          updateFields.push(`${key} = $${paramIndex}`)
          updateValues.push(JSON.stringify(value))
        } else {
          updateFields.push(`${key} = $${paramIndex}`)
          updateValues.push(value)
        }
        paramIndex++
      }
    }

    if (updateFields.length === 0) {
      throw new AppError('No valid fields to update', 400, 'NO_FIELDS_TO_UPDATE')
    }

    // Add updated_at field
    updateFields.push(`updated_at = NOW()`)
    updateValues.push(id)

    // Execute update
    const updateQuery = `
      UPDATE products 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await query(updateQuery, updateValues) as any[]
    const updatedProduct = result[0]

    // Parse gallery if it exists
    if (updatedProduct.gallery) {
      try {
        // If it's already an array, use it directly
        if (Array.isArray(updatedProduct.gallery)) {
          // Already an array, no need to parse
        } else if (typeof updatedProduct.gallery === 'string') {
          updatedProduct.gallery = JSON.parse(updatedProduct.gallery)
        }
      } catch (e) {
        console.error('Error parsing gallery:', e)
        updatedProduct.gallery = []
      }
    } else {
      updatedProduct.gallery = []
    }

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully'
    })

  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if product exists
    const existingProduct = await query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    ) as any[]

    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product is in any orders
    const orderItems = await query(
      'SELECT id FROM order_items WHERE product_id = $1',
      [id]
    ) as any[]

    if (orderItems.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete product. It is associated with existing orders.' 
      }, { status: 400 })
    }

    // Delete product
    await query('DELETE FROM products WHERE id = $1', [id])

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
