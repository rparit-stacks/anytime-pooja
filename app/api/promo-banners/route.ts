import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const sql = `
      SELECT 
        id,
        banner_key,
        banner_title,
        banner_description,
        banner_image,
        button_text,
        button_url,
        banner_order
      FROM promo_banners
      WHERE is_active = TRUE
      ORDER BY banner_order ASC
    `
    const banners = await query(sql) as any[]

    // Add cache-busting headers
    const headers = new Headers()
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    headers.set('Pragma', 'no-cache')
    headers.set('Expires', '0')

    return NextResponse.json({ banners }, { headers })
  } catch (error) {
    console.error('Error fetching promo banners:', error)
    
    // Return fallback data if database fails
    const fallbackBanners = [
      {
        id: 1,
        banner_key: 'banner_1',
        banner_title: 'New Fashion Collection',
        banner_description: 'Elevate your style with our latest arrivals',
        banner_image: '/elegant-fashion-collection-banner.jpg',
        button_text: 'Shop Fashion',
        button_url: '/products?category=fashion',
        banner_order: 1
      },
      {
        id: 2,
        banner_key: 'banner_2',
        banner_title: 'Tech Essentials',
        banner_description: 'Discover cutting-edge electronics',
        banner_image: '/premium-electronics-technology-banner.jpg',
        button_text: 'Explore Tech',
        button_url: '/products?category=electronics',
        banner_order: 2
      }
    ]

    return NextResponse.json({ banners: fallbackBanners })
  }
}
