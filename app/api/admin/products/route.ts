import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const shortDescription = formData.get('short_description') as string
    const price = parseFloat(formData.get('price') as string)
    const originalPrice = formData.get('original_price') ? parseFloat(formData.get('original_price') as string) : null
    const categoryId = formData.get('category_id') as string
    const stockQuantity = parseInt(formData.get('stock_quantity') as string) || 0
    const isActive = formData.get('is_active') === 'true' || formData.get('isActive') === 'true' || true // Default to true
    const isFeatured = formData.get('is_featured') === 'true' || formData.get('isFeatured') === 'true' || false // Default to false
    const rating = parseFloat(formData.get('rating') as string) || 0
    const reviewCount = parseInt(formData.get('review_count') as string) || 0
    const badge = formData.get('badge') as string
    const material = formData.get('material') as string
    const origin = formData.get('origin') as string
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null
    const dimensions = formData.get('dimensions') as string
    
    // Debug logging
    console.log('Product Data:', {
      name, slug, description, shortDescription, price, originalPrice,
      categoryId, stockQuantity, isActive, isFeatured, rating, reviewCount,
      badge, material, origin, weight, dimensions
    })
    
    // Check for duplicate name
    const existingProduct = await query(
      'SELECT id FROM products WHERE name = ?',
      [name]
    ) as any[]
    
    if (existingProduct.length > 0) {
      return NextResponse.json({ 
        error: 'Product with this name already exists',
        code: 'DUPLICATE_NAME'
      }, { status: 400 })
    }
    
    // Check for duplicate slug
    const existingSlug = await query(
      'SELECT id FROM products WHERE slug = ?',
      [slug]
    ) as any[]
    
    if (existingSlug.length > 0) {
      return NextResponse.json({ 
        error: 'Product with this slug already exists',
        code: 'DUPLICATE_SLUG'
      }, { status: 400 })
    }
    
    // Validate required fields
    if (!categoryId || categoryId === '') {
      return NextResponse.json({ 
        error: 'Category is required',
        code: 'MISSING_CATEGORY'
      }, { status: 400 })
    }
    
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: 'Product name is required',
        code: 'MISSING_NAME'
      }, { status: 400 })
    }
    
    if (!price || price <= 0) {
      return NextResponse.json({ 
        error: 'Valid price is required',
        code: 'INVALID_PRICE'
      }, { status: 400 })
    }
    
    // Handle main image upload
    const image = formData.get('product_image') as File
    let imagePath = '/placeholder.svg'
    
    if (image && image.size > 0) {
      try {
        imagePath = await uploadToCloudinary(image, 'products')
      } catch (error) {
        console.error('Main image upload failed:', error)
        return NextResponse.json({ error: 'Failed to upload main image' }, { status: 500 })
      }
    }

    // Handle gallery images
    const galleryFiles = formData.getAll('gallery_images') as File[]
    const galleryPaths: string[] = []

    for (const file of galleryFiles) {
      if (file && file.size > 0) {
        try {
          const imageUrl = await uploadToCloudinary(file, 'products/gallery')
          galleryPaths.push(imageUrl)
        } catch (error) {
          console.error('Gallery image upload failed:', error)
          // Continue with other images even if one fails
        }
      }
    }

    // Insert product into database
    const sql = `
      INSERT INTO products (
        name, slug, description, short_description, price, original_price,
        image, gallery, category_id, stock_quantity, is_active, is_featured,
        rating, review_count, badge, material, origin, weight, dimensions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    const params = [
      name, slug, description, shortDescription, price, originalPrice,
      imagePath, JSON.stringify(galleryPaths), categoryId, stockQuantity, isActive, isFeatured,
      rating, reviewCount, badge, material, origin, weight, dimensions
    ]
    
    console.log('Inserting product with params:', params)
    await query(sql, params)
    console.log('Product inserted successfully')
    
    return NextResponse.json({ success: true, message: 'Product created successfully' })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const sql = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.original_price as originalPrice,
        p.image,
        p.rating,
        p.review_count as reviews,
        p.badge,
        p.is_active as isActive,
        p.is_featured as isFeatured,
        c.name as categoryName,
        c.slug as categorySlug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `
    
    const products = await query(sql) as any[]
    
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
