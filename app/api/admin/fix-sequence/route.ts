import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { handleApiError } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  try {
        // Fix sequences for all tables that might have the same issue
        await query('SELECT setval(\'products_id_seq\', (SELECT COALESCE(MAX(id), 0) + 1 FROM products), false)')
        await query('SELECT setval(\'categories_id_seq\', (SELECT COALESCE(MAX(id), 0) + 1 FROM categories), false)')
        await query('SELECT setval(\'sliders_id_seq\', (SELECT COALESCE(MAX(id), 0) + 1 FROM sliders), false)')
        await query('SELECT setval(\'users_id_seq\', (SELECT COALESCE(MAX(id), 0) + 1 FROM users), false)')
        await query('SELECT setval(\'orders_id_seq\', (SELECT COALESCE(MAX(id), 0) + 1 FROM orders), false)')
        await query('SELECT setval(\'order_items_id_seq\', (SELECT COALESCE(MAX(id), 0) + 1 FROM order_items), false)')
        await query('SELECT setval(\'user_addresses_id_seq\', (SELECT COALESCE(MAX(id), 0) + 1 FROM user_addresses), false)')
    
    return NextResponse.json({
      success: true,
      message: 'Database sequences have been fixed'
    })
  } catch (error) {
    return handleApiError(error)
  }
}
