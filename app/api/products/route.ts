import { NextResponse } from "next/server"
import { queryDirect } from "@/lib/database-postgres"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const category = url.searchParams.get("category")
    const q = url.searchParams.get("q")

    console.log('Products API called with params:', { category, q })

    let sql = `
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
        p.is_featured as isFeatured,
        p.stock_quantity as stockQuantity,
        p.short_description as shortDescription,
        p.description,
        p.material,
        p.origin,
        p.weight,
        p.dimensions,
        p.gallery
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `
    
    const params: any[] = []

    // Filter by category
    if (category) {
      sql += ` AND c.slug = $${params.length + 1}`
      params.push(category)
    }

    // Search by name
    if (q) {
      sql += ` AND p.name LIKE $${params.length + 1}`
      params.push(`%${q}%`)
    }

    sql += ` ORDER BY p.is_featured DESC, p.created_at DESC`

    const products = await queryDirect(sql, params) as any[]
    console.log('Raw products from database:', products.length, products)

    // Transform the data to match the exact same format as mock data
    const transformedProducts = products.map((product: any) => ({
      id: product.id.toString(),
      name: product.name,
      price: parseFloat(product.price),
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice) : null,
      image: product.image,
      rating: parseFloat(product.rating),
      reviews: product.reviews,
      category: product.category,
      badge: product.badge,
      isFeatured: product.isFeatured,
      stockQuantity: product.stockQuantity,
      shortDescription: product.shortDescription,
      description: product.description,
      material: product.material,
      origin: product.origin,
      weight: product.weight,
      dimensions: product.dimensions,
      gallery: product.gallery ? (() => {
        try {
          // If it's already an array, return it directly
          if (Array.isArray(product.gallery)) {
            return product.gallery
          }
          // If it's a string, try to parse it as JSON
          if (typeof product.gallery === 'string') {
            return JSON.parse(product.gallery)
          }
          return product.gallery
        } catch (error) {
          console.error('Error parsing gallery JSON:', error, 'Raw data:', product.gallery)
          return null
        }
      })() : null
    }))

    console.log('Transformed products:', transformedProducts.length, transformedProducts)
    const response = NextResponse.json({ products: transformedProducts })
    
    // Optimized caching headers
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300') // 5 minutes cache
    response.headers.set('ETag', `"products-${Date.now()}"`)
    response.headers.set('Vary', 'Accept-Encoding')
    
    return response
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      products: [] // Return empty array as fallback
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
