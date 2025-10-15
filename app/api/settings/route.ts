import { NextResponse } from "next/server"
import { getSettings, getSEOSettings, getLogoSettings, getSMTPSettings, getFaviconSettings, getGeneralSettings } from "@/lib/settings"

export async function GET() {
  try {
    const [allSettings, seoSettings, logoSettings, smtpSettings, faviconSettings, generalSettings] = await Promise.all([
      getSettings(),
      getSEOSettings(),
      getLogoSettings(),
      getSMTPSettings(),
      getFaviconSettings(),
      getGeneralSettings()
    ])

    const response = NextResponse.json({
      all: allSettings,
      seo: seoSettings,
      logo: logoSettings,
      smtp: smtpSettings,
      favicon: faviconSettings,
      general: generalSettings
    })

    // Add cache headers
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300') // 5 minutes cache
    response.headers.set('ETag', `"${Date.now()}"`)
    
    return response
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}
