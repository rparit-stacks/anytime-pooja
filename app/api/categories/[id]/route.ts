import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const sql = `
      SELECT
        id,
        name,
        slug,
        description,
        image,
        sort_order as sortOrder,
        is_active as isActive
      FROM categories
      WHERE id = ? AND is_active = 1
    `

    const categories = await query(sql, [params.id]) as any[]

    if (categories.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ category: categories[0] })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
  }
}
