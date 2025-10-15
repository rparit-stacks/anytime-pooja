import { NextResponse } from "next/server"
import { queryDirect } from "@/lib/database"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('Looking for product ID:', id)
    
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
        p.short_description,
        p.gallery,
        p.stock_quantity,
        p.material,
        p.origin,
        p.weight,
        p.dimensions
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = 1
    `
    
    const products = await queryDirect(sql, [id]) as any[]
    console.log('Found products:', products.length, products)
    
    if (products.length === 0) {
      // Check if product exists but is inactive
      const checkSql = `SELECT id, name, is_active FROM products WHERE id = ?`
      const checkProducts = await queryDirect(checkSql, [id]) as any[]
      console.log('Product check (including inactive):', checkProducts)
      
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = products[0] as any

    // Transform the data to match the exact same format as mock data
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
      shortDescription: product.short_description,
      gallery: product.gallery ? (() => {
        try {
          return JSON.parse(product.gallery)
        } catch (error) {
          console.error('Error parsing gallery JSON:', error, 'Raw data:', product.gallery)
          return null
        }
      })() : null,
      stockQuantity: product.stock_quantity,
      material: product.material,
      origin: product.origin,
      weight: product.weight,
      dimensions: product.dimensions
    }

    return NextResponse.json({ product: transformedProduct })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
