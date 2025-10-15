import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.original_price as originalPrice,
        p.image,
        p.rating,
        p.review_count as reviews,
        c.slug as category,
        p.badge,
        p.description,
        p.short_description as shortDescription,
        p.gallery,
        p.stock_quantity as stockQuantity,
        p.material,
        p.origin,
        p.weight,
        p.dimensions,
        p.is_featured as isFeatured,
        p.is_active as isActive,
        p.created_at as createdAt,
        p.updated_at as updatedAt
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `
    
    const { id } = await params
    const products = await query(sql, [id]) as any[]
    
    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    const product = products[0]
    
    // Transform the data to match the expected format
    const transformedProduct = {
      id: product.id.toString(),
      name: product.name,
      price: parseFloat(product.price),
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
      image: product.image,
      rating: parseFloat(product.rating),
      reviews: product.reviews,
      category: product.category,
      badge: product.badge,
      description: product.description,
      shortDescription: product.shortDescription,
      gallery: product.gallery ? JSON.parse(product.gallery) : null,
      stockQuantity: product.stockQuantity,
      material: product.material,
      origin: product.origin,
      weight: product.weight,
      dimensions: product.dimensions,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }
    
    return NextResponse.json({ product: transformedProduct })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const shortDescription = formData.get('shortDescription') as string
    const price = parseFloat(formData.get('price') as string)
    const originalPrice = formData.get('originalPrice') ? parseFloat(formData.get('originalPrice') as string) : null
    const categoryId = formData.get('categoryId') as string
    const stockQuantity = parseInt(formData.get('stockQuantity') as string) || 0
    const isActive = formData.get('isActive') === 'true'
    const isFeatured = formData.get('isFeatured') === 'true'
    const rating = parseFloat(formData.get('rating') as string) || 0
    const reviewCount = parseInt(formData.get('reviewCount') as string) || 0
    const badge = formData.get('badge') as string
    const material = formData.get('material') as string
    const origin = formData.get('origin') as string
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null
    const dimensions = formData.get('dimensions') as string
    
    // Handle main image upload
    const image = formData.get('image') as File
    let imagePath = null
    
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${image.name}`
      const uploadDir = join(process.cwd(), 'public/upload/products')
      const filepath = join(uploadDir, filename)
      
      // Ensure upload directory exists
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (error) {
        // Directory might already exist, ignore error
        console.log('Upload directory already exists or created')
      }
      
      await writeFile(filepath, buffer)
      imagePath = `/upload/products/${filename}`
    }

    // Handle gallery images
    const galleryFiles = formData.getAll('gallery') as File[]
    let galleryPaths: string[] = []

    for (const file of galleryFiles) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const timestamp = Date.now()
        const filename = `${timestamp}-${file.name}`
        const uploadDir = join(process.cwd(), 'public/upload/products')
        const filepath = join(uploadDir, filename)
        
        // Ensure upload directory exists
        try {
          await mkdir(uploadDir, { recursive: true })
        } catch (error) {
          // Directory might already exist, ignore error
          console.log('Upload directory already exists or created')
        }
        
        await writeFile(filepath, buffer)
        galleryPaths.push(`/upload/products/${filename}`)
      }
    }

    // Build update query
    let sql = `
      UPDATE products SET 
        name = ?, slug = ?, description = ?, short_description = ?,
        price = ?, original_price = ?, category_id = ?, stock_quantity = ?,
        is_active = ?, is_featured = ?, rating = ?, review_count = ?,
        badge = ?, material = ?, origin = ?, weight = ?, dimensions = ?,
        updated_at = CURRENT_TIMESTAMP
    `
    
    const params_array = [
      name, slug, description, shortDescription, price, originalPrice,
      categoryId, stockQuantity, isActive, isFeatured, rating, reviewCount,
      badge, material, origin, weight, dimensions
    ]

    // Add image update if new image provided
    if (imagePath) {
      sql += `, image = ?`
      params_array.push(imagePath)
    }

    // Add gallery update if new gallery images provided
    if (galleryPaths.length > 0) {
      // Get existing gallery and merge with new images
      const existingGallerySql = `SELECT gallery FROM products WHERE id = ?`
      const { id } = await params
      const existingResult = await query(existingGallerySql, [id]) as any[]
      
      let existingGallery: string[] = []
      if (existingResult.length > 0 && existingResult[0].gallery) {
        try {
          existingGallery = JSON.parse(existingResult[0].gallery)
        } catch (e) {
          existingGallery = []
        }
      }
      
      const mergedGallery = [...existingGallery, ...galleryPaths]
      sql += `, gallery = ?`
      params_array.push(JSON.stringify(mergedGallery))
    }

    sql += ` WHERE id = ?`
    const { id } = await params
    params_array.push(id)
    
    await query(sql, params_array)
    
    return NextResponse.json({ success: true, message: 'Product updated successfully' })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check if product exists
    const { id } = await params
    const checkSql = 'SELECT id FROM products WHERE id = ?'
    const existingProduct = await query(checkSql, [id]) as any[]
    
    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete the product
    const deleteSql = 'DELETE FROM products WHERE id = ?'
    await query(deleteSql, [id])
    
    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
