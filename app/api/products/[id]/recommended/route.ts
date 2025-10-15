import { NextRequest, NextResponse } from "next/server"
import { queryDirect } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // First get the current product's category and price range
    const productSql = `
      SELECT 
        p.category_id,
        p.price,
        c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = true
    `
    
    const productResult = await queryDirect(productSql, [id]) as any[]
    
    if (productResult.length === 0) {
      return NextResponse.json({ products: [] })
    }
    
    const currentProduct = productResult[0]
    const categoryId = currentProduct.category_id
    const currentPrice = parseFloat(currentProduct.price)
    const priceRange = currentPrice * 0.5 // 50% price range
    
    // Get recommended products based on:
    // 1. Same category (priority)
    // 2. Similar price range
    // 3. Featured products
    // 4. High rated products
    const recommendedSql = `
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
        p.is_active as isActive
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id != ? 
        AND p.is_active = true
        AND (
          p.category_id = ? 
          OR p.is_featured = true 
          OR (p.price BETWEEN ? AND ?)
          OR p.rating >= 4.0
        )
      ORDER BY 
        CASE WHEN p.category_id = ? THEN 1 ELSE 2 END,
        p.is_featured DESC,
        p.rating DESC,
        p.review_count DESC
      LIMIT 8
    `
    
    const recommendedProducts = await queryDirect(recommendedSql, [
      id,
      categoryId,
      currentPrice - priceRange,
      currentPrice + priceRange,
      categoryId
    ]) as any[]
    
    // Transform the data
    const transformedProducts = recommendedProducts.map((product: any) => ({
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
      isActive: product.isActive
    }))
    
    return NextResponse.json({ products: transformedProducts })
  } catch (error) {
    console.error('Error fetching recommended products:', error)
    return NextResponse.json({ error: 'Failed to fetch recommended products' }, { status: 500 })
  }
}
