import { executeQuery, executeWithPool } from './db-connectionless'

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
    name: "Sacred Rudraksha Mala",
    price: 299,
    original_price: 399,
    image: "/placeholder.svg",
    rating: 4.5,
    review_count: 12,
    category: "rudraksha",
    badge: "Popular",
    is_featured: 1,
    stock_quantity: 10,
    short_description: "Authentic 108 bead Rudraksha mala for meditation",
    description: "This sacred Rudraksha mala is made from genuine Rudraksha beads and is perfect for meditation and spiritual practices.",
    material: "Rudraksha beads",
    origin: "Nepal",
    weight: "50g",
    dimensions: "108 beads"
  },
  {
    id: "2",
    name: "Crystal Healing Set",
    price: 599,
    original_price: 799,
    image: "/placeholder.svg", 
    rating: 4.8,
    review_count: 8,
    category: "crystals",
    badge: "New",
    is_featured: 1,
    stock_quantity: 5,
    short_description: "Complete crystal healing collection",
    description: "A beautiful set of healing crystals including amethyst, rose quartz, and clear quartz.",
    material: "Natural crystals",
    origin: "Brazil",
    weight: "200g",
    dimensions: "Various sizes"
  }
]

const fallbackSliders = [
  {
    id: "1",
    title: "Welcome to Anytime Pooja",
    subtitle: "Your spiritual journey begins here",
    cta_text: "Shop Now",
    cta_link: "/products",
    image: "/placeholder.svg",
    sort_order: 1,
    is_active: 1
  },
  {
    id: "2", 
    title: "Sacred Collections",
    subtitle: "Discover authentic spiritual items",
    cta_text: "Explore",
    cta_link: "/products?category=pooja-items",
    image: "/placeholder.svg",
    sort_order: 2,
    is_active: 1
  }
]

// Smart query function with automatic fallback
export async function query(sql: string, params: any[] = []) {
  try {
    return await executeQuery(sql, params)
  } catch (error) {
    console.warn('Database unavailable, using fallback data:', error instanceof Error ? error.message : 'Unknown error')
    return getFallbackData(sql)
  }
}

export async function queryDirect(sql: string, params: any[] = []) {
  try {
    return await executeQuery(sql, params)
  } catch (error) {
    console.warn('Database unavailable, using fallback data:', error instanceof Error ? error.message : 'Unknown error')
    return getFallbackData(sql)
  }
}

export async function queryWithPool(sql: string, params: any[] = []) {
  try {
    return await executeWithPool(sql, params)
  } catch (error) {
    console.warn('Database unavailable, using fallback data:', error instanceof Error ? error.message : 'Unknown error')
    return getFallbackData(sql)
  }
}

// Determine fallback data based on SQL query
function getFallbackData(sql: string) {
  const lowerSql = sql.toLowerCase()
  
  if (lowerSql.includes('categories') && lowerSql.includes('select')) {
    return fallbackCategories
  }
  
  if (lowerSql.includes('products') && lowerSql.includes('select')) {
    return fallbackProducts
  }
  
  if (lowerSql.includes('sliders') && lowerSql.includes('select')) {
    return fallbackSliders
  }
  
  if (lowerSql.includes('reviews') && lowerSql.includes('select')) {
    return [] // No reviews in fallback
  }
  
  // Default fallback
  return []
}

export async function getConnection() {
  throw new Error('getConnection not supported in connectionless mode')
}

// Add connection pool status monitoring
export function getPoolStatus() {
  return {
    mode: 'connectionless',
    message: 'Using connectionless database approach',
    timestamp: new Date().toISOString()
  }
}

export default { query, queryDirect, queryWithPool }
