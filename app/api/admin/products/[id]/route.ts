import { NextRequest, NextResponse } from "next/server"
import { query, queryWithFallback } from "@/lib/database"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let id: string | undefined
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
        c.slug as category,
        c.id as category_id,
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
    
    const { id: productId } = await params
    id = productId
    console.log('Fetching product for edit, ID:', id)
    
    // Validate ID is a number
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }
    
    const products = await queryWithFallback(sql, [id]) as any[]
    console.log('Found product for edit:', products.length, products[0])
    
    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    const product = products[0]
    
    // Transform the data to match the expected format
    const transformedProduct = {
      id: product.id.toString(),
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.price),
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
      image: product.image,
      rating: parseFloat(product.rating),
      reviews: product.reviews,
      category: product.category,
      category_id: product.category_id, // Add category_id for form
      badge: product.badge,
      description: product.description,
      shortDescription: product.shortDescription,
      gallery: product.gallery ? (() => {
        try {
          return JSON.parse(product.gallery)
        } catch (error) {
          console.error('Error parsing gallery JSON:', error, 'Raw data:', product.gallery)
          return null
        }
      })() : null,
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
    
    console.log('Transformed product for edit:', transformedProduct)
    
    return NextResponse.json({ product: transformedProduct })
  } catch (error) {
    console.error('Error fetching product:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      productId: id
    })
    return NextResponse.json({ 
      error: 'Failed to fetch product', 
      details: error instanceof Error ? error.message : 'Unknown error',
      productId: id 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let productId: string | undefined
  try {
    const { id } = await params
    productId = id
    
    // Validate ID
    if (!productId || isNaN(parseInt(productId))) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }
    
    const contentType = request.headers.get('content-type')
    
    let formData: FormData
    if (contentType?.includes('multipart/form-data')) {
      formData = await request.formData()
    } else {
      // Handle JSON data
      const jsonData = await request.json()
      formData = new FormData()
      
      // Convert JSON to FormData
      Object.keys(jsonData).forEach(key => {
        if (jsonData[key] !== null && jsonData[key] !== undefined) {
          formData.append(key, jsonData[key].toString())
        }
      })
    }
    
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
    
    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }
    
    if (!price || price <= 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 })
    }
    
    if (!categoryId || categoryId === '') {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 })
    }
    
    console.log('Updating product:', { productId, name, price, categoryId })
    
    // Handle main image upload
    const image = formData.get('product_image') as File
    let imagePath = null
    
    if (image && image.size > 0) {
      try {
        console.log('Uploading main image to Cloudinary...')
        imagePath = await uploadToCloudinary(image, 'products')
        console.log('Main image uploaded successfully:', imagePath)
      } catch (error) {
        console.error('Main image upload failed:', error)
        return NextResponse.json({ error: 'Failed to upload main image' }, { status: 500 })
      }
    } else {
      console.log('No new main image provided, keeping existing image')
    }

    // Handle gallery images
    const galleryFiles = formData.getAll('gallery_images') as File[]
    let galleryPaths: string[] = []

    console.log('Processing gallery images:', galleryFiles.length)
    for (const file of galleryFiles) {
      if (file && file.size > 0) {
        try {
          console.log('Uploading gallery image to Cloudinary...')
          const imageUrl = await uploadToCloudinary(file, 'products/gallery')
          galleryPaths.push(imageUrl)
          console.log('Gallery image uploaded successfully:', imageUrl)
        } catch (error) {
          console.error('Gallery image upload failed:', error)
          // Continue with other images even if one fails
        }
      }
    }
    console.log('Total gallery images uploaded:', galleryPaths.length)

    // Build update query dynamically
    const updateFields = [
      'name = ?', 'slug = ?', 'description = ?', 'short_description = ?',
      'price = ?', 'original_price = ?', 'category_id = ?', 'stock_quantity = ?',
      'is_active = ?', 'is_featured = ?', 'rating = ?', 'review_count = ?',
      'badge = ?', 'material = ?', 'origin = ?', 'weight = ?', 'dimensions = ?'
    ]
    
    const params_array = [
      name, slug, description, shortDescription, price, originalPrice,
      categoryId, stockQuantity, isActive, isFeatured, rating, reviewCount,
      badge, material, origin, weight, dimensions
    ]

    // Add image update if new image provided
    if (imagePath) {
      updateFields.push('image = ?')
      params_array.push(imagePath)
    }

    // Add gallery update if new gallery images provided
    if (galleryPaths.length > 0) {
      // Get existing gallery and merge with new images
      const existingGallerySql = `SELECT gallery FROM products WHERE id = ?`
      const existingResult = await queryWithFallback(existingGallerySql, [productId]) as any[]
      
      let existingGallery: string[] = []
      if (existingResult.length > 0 && existingResult[0].gallery) {
        try {
          existingGallery = JSON.parse(existingResult[0].gallery)
        } catch (e) {
          existingGallery = []
        }
      }
      
      const mergedGallery = [...existingGallery, ...galleryPaths]
      updateFields.push('gallery = ?')
      params_array.push(JSON.stringify(mergedGallery))
    }

    // Always add updated_at at the end
    updateFields.push('updated_at = CURRENT_TIMESTAMP')

    const sql = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`
    params_array.push(productId)
    
    console.log('Executing update query:', sql)
    console.log('Query parameters:', params_array)
    await queryWithFallback(sql, params_array)
    
    return NextResponse.json({ success: true, message: 'Product updated successfully' })
  } catch (error) {
    console.error('Error updating product:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      productId: productId
    })
    return NextResponse.json({ 
      error: 'Failed to update product', 
      details: error instanceof Error ? error.message : 'Unknown error',
      productId: productId 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let productId: string | undefined
  try {
    const { id } = await params
    productId = id
    
    // Validate ID
    if (!productId || isNaN(parseInt(productId))) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }
    
    // Check if product exists
    const checkSql = 'SELECT id FROM products WHERE id = ?'
    const existingProduct = await queryWithFallback(checkSql, [productId]) as any[]
    
    if (existingProduct.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Delete the product
    const deleteSql = 'DELETE FROM products WHERE id = ?'
    await queryWithFallback(deleteSql, [productId])
    
    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      productId: productId
    })
    return NextResponse.json({ 
      error: 'Failed to delete product', 
      details: error instanceof Error ? error.message : 'Unknown error',
      productId: productId 
    }, { status: 500 })
  }
}
