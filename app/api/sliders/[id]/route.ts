import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const sql = `
      SELECT
        id,
        title,
        subtitle,
        image,
        cta_text as ctaText,
        cta_link as ctaLink,
        sort_order as sortOrder,
        is_active as isActive
      FROM sliders
      WHERE id = ? AND is_active = true
    `

    const sliders = await query(sql, [params.id]) as any[]

    if (sliders.length === 0) {
      return NextResponse.json({ error: "Slider not found" }, { status: 404 })
    }

    return NextResponse.json({ slider: sliders[0] })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to fetch slider' }, { status: 500 })
  }
}
