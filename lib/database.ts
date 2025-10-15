import { Pool } from 'pg'

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Query function
export async function query(text: string, params?: any[]): Promise<any[]> {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result.rows
  } finally {
    client.release()
  }
}

// Direct query function (for compatibility)
export async function queryDirect(text: string, params?: any[]): Promise<any[]> {
  return query(text, params)
}

// Test connection
export async function testConnection(): Promise<boolean> {
  try {
    await query('SELECT NOW()')
    console.log('✅ PostgreSQL connection successful')
    return true
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error)
    return false
  }
}

// Close pool
export async function closePool(): Promise<void> {
  await pool.end()
}

// Fallback data when database is unavailable
const fallbackCategories = [
  {
    id: "1",
    name: "Pooja Items",
    slug: "pooja-items",
    description: "Essential items for daily worship",
    image: "/placeholder.svg",
    sort_order: 1,
    is_active: 1
  },
  {
    id: "2", 
    name: "Rudraksha",
    slug: "rudraksha",
    description: "Sacred beads for spiritual practice",
    image: "/placeholder.svg",
    sort_order: 2,
    is_active: 1
  },
  {
    id: "3",
    name: "Crystals",
    slug: "crystals",
    description: "Healing crystals and gemstones",
    image: "/placeholder.svg",
    sort_order: 3,
    is_active: 1
  }
]

const fallbackProducts = [
  {
    id: "1",
    name: "Premium Rose Quartz Crystal",
    slug: "premium-rose-quartz-crystal",
    description: "Beautiful natural rose quartz crystal for love and healing",
    short_description: "Natural rose quartz crystal for love and healing",
    price: 299.99,
    original_price: 399.99,
    image: "/placeholder.svg",
    gallery: null,
    category_id: 1,
    stock_quantity: 50,
    is_active: 1,
    is_featured: 1,
    rating: 4.80,
    review_count: 234,
    badge: "Trending",
    weight: null,
    dimensions: null,
    material: "Natural Crystal",
    origin: "Brazil"
  },
  {
    id: "2",
    name: "Sacred Ganesha Idol",
    slug: "sacred-ganesha-idol", 
    description: "Handcrafted brass Ganesha idol for home temple",
    short_description: "Handcrafted brass Ganesha idol for prosperity",
    price: 549.99,
    original_price: null,
    image: "/placeholder.svg",
    gallery: null,
    category_id: 3,
    stock_quantity: 25,
    is_active: 1,
    is_featured: 1,
    rating: 4.90,
    review_count: 189,
    badge: null,
    weight: null,
    dimensions: null,
    material: "Brass",
    origin: "India"
  }
]

const fallbackSliders = [
  {
    id: "1",
    title: "Spiritual Collection",
    subtitle: "Discover authentic spiritual items for your spiritual journey",
    cta: "Shop Now",
    link: "/products",
    image: "/placeholder-banner.jpg",
    sort_order: 1,
    is_active: 1
  },
  {
    id: "2", 
    title: "Sacred Collections",
    subtitle: "Explore our curated collection of sacred items",
    cta: "Explore",
    link: "/products?category=pooja-items",
    image: "/placeholder-banner.jpg",
    sort_order: 2,
    is_active: 1
  }
]

// Smart query function with automatic fallback
export async function queryWithFallback(sql: string, params: any[] = []) {
  try {
    return await query(sql, params)
  } catch (error) {
    console.warn('Database unavailable, using fallback data:', error instanceof Error ? error.message : 'Unknown error')
    return getFallbackData(sql)
  }
}

// Direct query function with fallback
export async function queryDirectWithFallback(sql: string, params: any[] = []) {
  try {
    return await queryDirect(sql, params)
  } catch (error) {
    console.warn('Database unavailable, using fallback data:', error instanceof Error ? error.message : 'Unknown error')
    return getFallbackData(sql)
  }
}

// Query with pool function with fallback
export async function queryWithPoolFallback(sql: string, params: any[] = []) {
  try {
    return await query(sql, params)
  } catch (error) {
    console.warn('Database unavailable, using fallback data:', error instanceof Error ? error.message : 'Unknown error')
    return getFallbackData(sql)
  }
}

// Determine fallback data based on SQL query
function getFallbackData(sql: string) {
  const lowerSql = sql.toLowerCase()
  
  // Check for products first (more specific)
  if (lowerSql.includes('from products') && lowerSql.includes('select')) {
    return fallbackProducts
  }
  
  if (lowerSql.includes('from categories') && lowerSql.includes('select')) {
    return fallbackCategories
  }
  
  if (lowerSql.includes('sliders') && lowerSql.includes('select')) {
    return fallbackSliders
  }
  
  if (lowerSql.includes('settings') && lowerSql.includes('select')) {
    return []
  }
  
  if (lowerSql.includes('footer_settings') && lowerSql.includes('select')) {
    return []
  }
  
  if (lowerSql.includes('promo_banners') && lowerSql.includes('select')) {
    return []
  }
  
  return []
}