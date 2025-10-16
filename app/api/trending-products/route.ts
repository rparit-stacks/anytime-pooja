import { NextResponse } from "next/server"
import { queryWithFallback } from "@/lib/database"

export async function GET() {
  try {
    const sql = `
      SELECT 
        tp.id as trending_id,
        tp.sort_order,
        p.id as product_id,
        p.name as product_name,
        p.slug as product_slug,
        p.image as product_image,
        p.price as product_price,
        p.original_price as product_original_price,
        p.is_featured as product_featured
      FROM trending_products tp
      JOIN products p ON tp.product_id = p.id
      WHERE tp.is_active = true AND p.is_active = true
      ORDER BY tp.sort_order ASC
    `
    
    const trendingProducts = await queryWithFallback(sql) as any[]
    
    // Add cache headers for better performance
    const response = NextResponse.json({ 
      success: true,
      products: trendingProducts 
    })
    
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300') // 5 minutes cache
    response.headers.set('ETag', `"${Date.now()}"`)
    
    return response
  } catch (error) {
    console.error('Error fetching trending products:', error)
    
    // Return fallback data if database fails
    const fallbackProducts = [
      {
        trending_id: 1,
        sort_order: 1,
        product_id: 1,
        product_name: "Premium Rudraksha Mala",
        product_slug: "premium-rudraksha-mala",
        product_image: "/placeholder-product.jpg",
        product_price: 1299,
        product_original_price: 1599,
        product_featured: true
      },
      {
        trending_id: 2,
        sort_order: 2,
        product_name: "Sacred Crystal Set",
        product_slug: "sacred-crystal-set",
        product_image: "/placeholder-product.jpg",
        product_price: 899,
        product_original_price: 1199,
        product_featured: true
      },
      {
        trending_id: 3,
        sort_order: 3,
        product_name: "Divine Incense Collection",
        product_slug: "divine-incense-collection",
        product_image: "/placeholder-product.jpg",
        product_price: 599,
        product_original_price: 799,
        product_featured: false
      },
      {
        trending_id: 4,
        sort_order: 4,
        product_name: "Golden Pooja Thali",
        product_slug: "golden-pooja-thali",
        product_image: "/placeholder-product.jpg",
        product_price: 1999,
        product_original_price: 2499,
        product_featured: true
      },
      {
        trending_id: 5,
        sort_order: 5,
        product_name: "Spiritual Candles Pack",
        product_slug: "spiritual-candles-pack",
        product_image: "/placeholder-product.jpg",
        product_price: 399,
        product_original_price: 499,
        product_featured: false
      }
    ]

    return NextResponse.json({ 
      success: true,
      products: fallbackProducts 
    })
  }
}
