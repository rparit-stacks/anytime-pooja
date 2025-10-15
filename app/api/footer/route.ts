import { NextResponse } from "next/server"
import { getFooterSettings } from "@/lib/footer-settings"

export async function GET() {
  try {
    const footerSettings = await getFooterSettings()

    const response = NextResponse.json({ footer: footerSettings })

    // Add cache headers
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300') // 5 minutes cache
    response.headers.set('ETag', `"${Date.now()}"`)
    
    return response
  } catch (error) {
    console.error('Error fetching footer settings:', error)
    return NextResponse.json({ error: 'Failed to fetch footer settings' }, { status: 500 })
  }
}
