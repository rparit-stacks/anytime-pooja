import { NextRequest, NextResponse } from "next/server"
import { query, queryWithFallback } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const range = url.searchParams.get("range") || "30"
    
    // Calculate date range
    const days = parseInt(range)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Get current period data
    const currentPeriodSql = `
      SELECT 
        COUNT(DISTINCT o.id) as totalOrders,
        COALESCE(SUM(o.total_amount), 0) as totalRevenue,
        COUNT(DISTINCT o.user_id) as totalCustomers
      FROM orders o
      WHERE o.created_at >= ? AND o.status != 'cancelled'
    `
    
    const currentData = await queryWithFallback(currentPeriodSql, [startDate.toISOString()]) as any[]
    
    // Get previous period data for comparison
    const previousStartDate = new Date()
    previousStartDate.setDate(previousStartDate.getDate() - (days * 2))
    
    const previousPeriodSql = `
      SELECT 
        COUNT(DISTINCT o.id) as totalOrders,
        COALESCE(SUM(o.total_amount), 0) as totalRevenue,
        COUNT(DISTINCT o.user_id) as totalCustomers
      FROM orders o
      WHERE o.order_date >= ? AND o.order_date < ? AND o.order_status != 'cancelled'
    `
    
    const previousData = await queryWithFallback(previousPeriodSql, [previousStartDate.toISOString(), startDate.toISOString()]) as any[]
    
    // Get total products
    const productsSql = `SELECT COUNT(*) as totalProducts FROM products WHERE is_active = true`
    const productsData = await queryWithFallback(productsSql) as any[]
    
    // Get top products
    const topProductsSql = `
      SELECT 
        p.id,
        p.name,
        COUNT(oi.id) as sales,
        SUM(oi.price_at_purchase * oi.quantity) as revenue
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= ? AND o.status != 'cancelled'
      GROUP BY p.id, p.name
      ORDER BY sales DESC
      LIMIT 5
    `
    
    const topProducts = await queryWithFallback(topProductsSql, [startDate.toISOString()]) as any[]
    
    // Get recent orders
    const recentOrdersSql = `
      SELECT 
        o.id,
        CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as customerName,
        o.total_amount as total,
        o.order_date as date
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.order_date >= ?
      ORDER BY o.order_date DESC
      LIMIT 5
    `
    
    const recentOrders = await queryWithFallback(recentOrdersSql, [startDate.toISOString()]) as any[]
    
    // Calculate growth percentages
    const current = currentData[0] || { totalOrders: 0, totalRevenue: 0, totalCustomers: 0 }
    const previous = previousData[0] || { totalOrders: 0, totalRevenue: 0, totalCustomers: 0 }
    
    const revenueGrowth = previous.totalRevenue > 0 
      ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 
      : 0
    
    const ordersGrowth = previous.totalOrders > 0 
      ? ((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100 
      : 0
    
    const customersGrowth = previous.totalCustomers > 0 
      ? ((current.totalCustomers - previous.totalCustomers) / previous.totalCustomers) * 100 
      : 0
    
    const analytics = {
      totalRevenue: current.totalRevenue,
      totalOrders: current.totalOrders,
      totalCustomers: current.totalCustomers,
      totalProducts: productsData[0]?.totalProducts || 0,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
      ordersGrowth: Math.round(ordersGrowth * 100) / 100,
      customersGrowth: Math.round(customersGrowth * 100) / 100,
      topProducts: topProducts,
      recentOrders: recentOrders
    }
    
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}