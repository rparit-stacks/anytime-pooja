import { queryWithFallback } from './database'

interface Setting {
  setting_key: string
  setting_value: string
  setting_type: string
  category: string
}

interface SettingsCache {
  data: Record<string, string> | null
  timestamp: number
  ttl: number // Time to live in milliseconds
}

// Cache settings for 5 minutes
const CACHE_TTL = 5 * 60 * 1000
let settingsCache: SettingsCache = {
  data: null,
  timestamp: 0,
  ttl: CACHE_TTL
}

export async function getSettings(): Promise<Record<string, string>> {
  // Check cache first
  const now = Date.now()
  if (settingsCache.data && (now - settingsCache.timestamp) < settingsCache.ttl) {
    return settingsCache.data
  }

  try {
    const sql = `
      SELECT setting_key, setting_value, setting_type, category
      FROM settings
      WHERE is_active = true
    `
    
    const settings = await queryWithFallback(sql) as Setting[]
    
    // Convert to key-value pairs
    const settingsMap: Record<string, string> = {}
    settings.forEach(setting => {
      settingsMap[setting.setting_key] = setting.setting_value
    })
    
    // Update cache
    settingsCache = {
      data: settingsMap,
      timestamp: now,
      ttl: CACHE_TTL
    }
    
    return settingsMap
  } catch (error) {
    console.error('Error fetching settings:', error)
    // Return fallback settings if database fails
    return getFallbackSettings()
  }
}

export async function getSetting(key: string, defaultValue: string = ''): Promise<string> {
  const settings = await getSettings()
  return settings[key] || defaultValue
}

export async function getSEOSettings() {
  const settings = await getSettings()
  return {
    siteTitle: settings.site_title || 'Anytime Pooja',
    siteDescription: settings.site_description || 'Your spiritual journey begins here',
    siteKeywords: settings.site_keywords || 'pooja items, spiritual products',
    ogTitle: settings.og_title || settings.site_title || 'Anytime Pooja',
    ogDescription: settings.og_description || settings.site_description || 'Your spiritual journey begins here',
    ogImage: settings.og_image || '/images/og-image.jpg',
    twitterCard: settings.twitter_card || 'summary_large_image',
    twitterSite: settings.twitter_site || '',
    canonicalUrl: settings.canonical_url || '',
    robotsTxt: settings.robots_txt || ''
  }
}

export async function getLogoSettings() {
  const settings = await getSettings()
  return {
    logoUrl: settings.logo_url || '/images/logo.png',
    logoWidth: parseInt(settings.logo_width || '200'),
    logoHeight: parseInt(settings.logo_height || '60')
  }
}

export async function getSMTPSettings() {
  const settings = await getSettings()
  return {
    host: settings.smtp_host || 'smtp.gmail.com',
    port: parseInt(settings.smtp_port || '587'),
    secure: settings.smtp_secure === 'true',
    username: settings.smtp_username || '',
    password: settings.smtp_password || '',
    fromName: settings.smtp_from_name || 'Anytime Pooja',
    fromEmail: settings.smtp_from_email || 'noreply@anytimepooja.com',
    replyTo: settings.smtp_reply_to || 'support@anytimepooja.com'
  }
}

export async function getFaviconSettings() {
  const settings = await getSettings()
  return {
    faviconUrl: settings.favicon_url || '/favicon.ico',
    appleTouchIcon: settings.apple_touch_icon || '/images/apple-touch-icon.png'
  }
}

export async function getGeneralSettings() {
  const settings = await getSettings()
  return {
    siteName: settings.site_name || 'Anytime Pooja',
    siteUrl: settings.site_url || 'https://anytimepooja.com',
    contactEmail: settings.contact_email || 'support@anytimepooja.com',
    contactPhone: settings.contact_phone || '+91-9876543210',
    address: settings.address || '123 Spiritual Street, Divine City, India - 110001',
    currency: settings.currency || 'INR',
    timezone: settings.timezone || 'Asia/Kolkata',
    maintenanceMode: settings.maintenance_mode === 'true',
    googleAnalyticsId: settings.google_analytics_id || '',
    facebookPixelId: settings.facebook_pixel_id || '',
    googleTagManagerId: settings.google_tag_manager_id || ''
  }
}

// Fallback settings when database is unavailable
function getFallbackSettings(): Record<string, string> {
  return {
    site_title: 'Anytime Pooja - Your Spiritual Journey',
    site_description: 'Discover authentic spiritual items, pooja essentials, and sacred collections for your spiritual journey.',
    site_keywords: 'pooja items, spiritual products, rudraksha, crystals, mandir, astrology, sacred items',
    og_title: 'Anytime Pooja - Spiritual Products & Pooja Items',
    og_description: 'Shop authentic spiritual products, pooja essentials, and sacred collections online.',
    og_image: '/images/og-image.jpg',
    twitter_card: 'summary_large_image',
    twitter_site: '@anytimepooja',
    canonical_url: 'https://anytimepooja.com',
    logo_url: '/images/logo.png',
    logo_width: '200',
    logo_height: '60',
    favicon_url: '/favicon.ico',
    apple_touch_icon: '/images/apple-touch-icon.png',
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_secure: 'true',
    smtp_username: '',
    smtp_password: '',
    smtp_from_name: 'Anytime Pooja',
    smtp_from_email: 'noreply@anytimepooja.com',
    smtp_reply_to: 'support@anytimepooja.com',
    site_name: 'Anytime Pooja',
    site_url: 'https://anytimepooja.com',
    contact_email: 'support@anytimepooja.com',
    contact_phone: '+91-9876543210',
    address: '123 Spiritual Street, Divine City, India - 110001',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    maintenance_mode: 'false',
    google_analytics_id: '',
    facebook_pixel_id: '',
    google_tag_manager_id: ''
  }
}

// Clear cache (useful for testing or when settings are updated)
export function clearSettingsCache() {
  settingsCache = {
    data: null,
    timestamp: 0,
    ttl: CACHE_TTL
  }
}
