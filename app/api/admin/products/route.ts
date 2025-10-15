import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { writeFile } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
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
    let imagePath = '/placeholder.svg'
    
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${image.name}`
      const filepath = join(process.cwd(), 'public/upload/products', filename)
      
      await writeFile(filepath, buffer)
      imagePath = `/upload/products/${filename}`
    }

    // Handle gallery images
    const galleryFiles = formData.getAll('gallery') as File[]
    const galleryPaths: string[] = []

    for (const file of galleryFiles) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const timestamp = Date.now()
        const filename = `${timestamp}-${file.name}`
        const filepath = join(process.cwd(), 'public/upload/products', filename)
        
        await writeFile(filepath, buffer)
        galleryPaths.push(`/upload/products/${filename}`)
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
    
    await query(sql, params)
    
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
