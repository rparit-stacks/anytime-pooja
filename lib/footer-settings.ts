import { queryWithFallback } from './database'

interface FooterSetting {
  section_key: string
  section_value: string
  section_type: string
  section_name: string
}

interface FooterSettingsCache {
  data: Record<string, any> | null
  timestamp: number
  ttl: number
}

// Cache footer settings for 5 minutes
const CACHE_TTL = 5 * 60 * 1000
let footerCache: FooterSettingsCache = {
  data: null,
  timestamp: 0,
  ttl: CACHE_TTL
}

export async function getFooterSettings(): Promise<Record<string, any>> {
  // Check cache first
  const now = Date.now()
  if (footerCache.data && (now - footerCache.timestamp) < footerCache.ttl) {
    return footerCache.data
  }

  try {
    const sql = `
      SELECT section_key, section_value, section_type, section_name
      FROM footer_settings
      WHERE is_active = true
      ORDER BY sort_order ASC
    `
    
    const settings = await queryWithFallback(sql) as FooterSetting[]
    
    // Convert to structured object
    const footerData: Record<string, any> = {}
    settings.forEach(setting => {
      if (setting.section_type === 'json') {
        try {
          footerData[setting.section_key] = JSON.parse(setting.section_value)
        } catch (e) {
          footerData[setting.section_key] = []
        }
      } else {
        footerData[setting.section_key] = setting.section_value
      }
    })
    
    // Update cache
    footerCache = {
      data: footerData,
      timestamp: now,
      ttl: CACHE_TTL
    }
    
    return footerData
  } catch (error) {
    console.error('Error fetching footer settings:', error)
    return getFallbackFooterSettings()
  }
}

export async function getFooterSetting(key: string, defaultValue: any = ''): Promise<any> {
  const settings = await getFooterSettings()
  return settings[key] || defaultValue
}

// Fallback footer settings when database is unavailable
function getFallbackFooterSettings(): Record<string, any> {
  return {
    footer_about_title: 'About Anytime Pooja',
    footer_about_text: 'Your trusted destination for authentic spiritual products, pooja essentials, and sacred collections.',
    footer_quick_links_title: 'Quick Links',
    footer_quick_links: [
      { title: 'Home', url: '/' },
      { title: 'About Us', url: '/about' },
      { title: 'Products', url: '/products' },
      { title: 'Contact', url: '/contact' }
    ],
    footer_categories_title: 'Categories',
    footer_categories: [
      { title: 'Pooja Items', url: '/products?category=pooja-items' },
      { title: 'Rudraksha', url: '/products?category=rudraksha' },
      { title: 'Crystals', url: '/products?category=crystals' },
      { title: 'Mandir Items', url: '/products?category=mandir' }
    ],
    footer_contact_title: 'Contact Info',
    footer_contact_address: '123 Spiritual Street, Divine City, India - 110001',
    footer_contact_phone: '+91-9876543210',
    footer_contact_email: 'support@anytimepooja.com',
    footer_social_title: 'Follow Us',
    footer_social_links: [
      { platform: 'Facebook', url: 'https://facebook.com/anytimepooja', icon: 'fa-facebook' },
      { platform: 'Instagram', url: 'https://instagram.com/anytimepooja', icon: 'fa-instagram' },
      { platform: 'Twitter', url: 'https://twitter.com/anytimepooja', icon: 'fa-twitter' },
      { platform: 'YouTube', url: 'https://youtube.com/anytimepooja', icon: 'fa-youtube' }
    ],
    footer_newsletter_title: 'Subscribe to Newsletter',
    footer_newsletter_text: 'Get updates on new products and spiritual insights.',
    footer_newsletter_placeholder: 'Enter your email address',
    footer_payment_methods: [
      { name: 'Visa', icon: 'fa-cc-visa' },
      { name: 'Mastercard', icon: 'fa-cc-mastercard' },
      { name: 'PayPal', icon: 'fa-paypal' },
      { name: 'UPI', icon: 'fa-mobile-alt' }
    ],
    footer_copyright: '© 2024 Anytime Pooja. All rights reserved.'
  }
}

// Clear cache (useful for testing or when settings are updated)
export function clearFooterCache() {
  footerCache = {
    data: null,
    timestamp: 0,
    ttl: CACHE_TTL
  }
}
