"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "@/components/ui/file-upload"
import { 
  Save,
  Settings,
  Store,
  Mail,
  Truck,
  CreditCard,
  Shield,
  Bell
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DatabaseSetting {
  id: number
  setting_key: string
  setting_value: string
  setting_type: string
  category: string
  description: string
  is_active: boolean
}

interface FooterSetting {
  id: number
  section_key: string
  section_value: string
  section_type: string
  section_name: string
  description: string
  is_active: boolean
  sort_order: number
}

interface StoreSettings {
  site_name: string
  site_url: string
  contact_email: string
  contact_phone: string
  address: string
  currency: string
  timezone: string
  maintenance_mode: boolean
  google_analytics_id: string
  facebook_pixel_id: string
  google_tag_manager_id: string
}

interface SEOSettings {
  site_title: string
  site_description: string
  site_keywords: string
  og_title: string
  og_description: string
  og_image: string
  twitter_card: string
  twitter_site: string
  canonical_url: string
  robots_txt: string
}

interface LogoSettings {
  logo_url: string
  favicon_url: string
}

interface SMTPSettings {
  smtp_host: string
  smtp_port: string
  smtp_username: string
  smtp_password: string
  smtp_from_email: string
  smtp_from_name: string
}

interface FooterSettings {
  footer_about_title: string
  footer_about_text: string
  footer_quick_links_title: string
  footer_quick_links: Array<{title: string, url: string}>
  footer_categories_title: string
  footer_categories: Array<{title: string, url: string}>
  footer_contact_title: string
  footer_contact_address: string
  footer_contact_phone: string
  footer_contact_email: string
  footer_social_title: string
  footer_social_links: Array<{platform: string, url: string, icon: string}>
  footer_newsletter_title: string
  footer_newsletter_text: string
  footer_newsletter_placeholder: string
  footer_payment_methods: Array<{name: string, icon: string}>
  footer_copyright: string
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("store")
  const [databaseSettings, setDatabaseSettings] = useState<DatabaseSetting[]>([])
  const [footerSettings, setFooterSettings] = useState<FooterSetting[]>([])

  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    site_name: '',
    site_url: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    maintenance_mode: false,
    google_analytics_id: '',
    facebook_pixel_id: '',
    google_tag_manager_id: ''
  })

  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    site_title: '',
    site_description: '',
    site_keywords: '',
    og_title: '',
    og_description: '',
    og_image: '',
    twitter_card: '',
    twitter_site: '',
    canonical_url: '',
    robots_txt: ''
  })

  const [logoSettings, setLogoSettings] = useState<LogoSettings>({
    logo_url: '',
    favicon_url: ''
  })

  const [smtpSettings, setSmtpSettings] = useState<SMTPSettings>({
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    smtp_from_email: '',
    smtp_from_name: ''
  })

  const [footerData, setFooterData] = useState<FooterSettings>({
    footer_about_title: '',
    footer_about_text: '',
    footer_quick_links_title: '',
    footer_quick_links: [],
    footer_categories_title: '',
    footer_categories: [],
    footer_contact_title: '',
    footer_contact_address: '',
    footer_contact_phone: '',
    footer_contact_email: '',
    footer_social_title: '',
    footer_social_links: [],
    footer_newsletter_title: '',
    footer_newsletter_text: '',
    footer_newsletter_placeholder: '',
    footer_payment_methods: [],
    footer_copyright: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      
      if (data.success) {
        // Store raw database settings
        setDatabaseSettings(data.allSettings || [])
        setFooterSettings(data.footerSettings || [])
        
        // Populate settings from database
        const settingsMap = data.settingsMap || {}
        const footerData = data.footer || {}
        
        // Populate store settings
        setStoreSettings({
          site_name: settingsMap.site_name || '',
          site_url: settingsMap.site_url || '',
          contact_email: settingsMap.contact_email || '',
          contact_phone: settingsMap.contact_phone || '',
          address: settingsMap.address || '',
          currency: settingsMap.currency || 'INR',
          timezone: settingsMap.timezone || 'Asia/Kolkata',
          maintenance_mode: settingsMap.maintenance_mode === 'true',
          google_analytics_id: settingsMap.google_analytics_id || '',
          facebook_pixel_id: settingsMap.facebook_pixel_id || '',
          google_tag_manager_id: settingsMap.google_tag_manager_id || ''
        })
        
        // Populate SEO settings
        setSeoSettings({
          site_title: settingsMap.site_title || '',
          site_description: settingsMap.site_description || '',
          site_keywords: settingsMap.site_keywords || '',
          og_title: settingsMap.og_title || '',
          og_description: settingsMap.og_description || '',
          og_image: settingsMap.og_image || '',
          twitter_card: settingsMap.twitter_card || '',
          twitter_site: settingsMap.twitter_site || '',
          canonical_url: settingsMap.canonical_url || '',
          robots_txt: settingsMap.robots_txt || ''
        })
        
        // Populate logo settings
        setLogoSettings({
          logo_url: settingsMap.logo_url || '',
          favicon_url: settingsMap.favicon_url || ''
        })
        
        // Populate SMTP settings
        setSmtpSettings({
          smtp_host: settingsMap.smtp_host || '',
          smtp_port: settingsMap.smtp_port || '587',
          smtp_username: settingsMap.smtp_username || '',
          smtp_password: settingsMap.smtp_password || '',
          smtp_from_email: settingsMap.smtp_from_email || '',
          smtp_from_name: settingsMap.smtp_from_name || ''
        })
        
        // Populate footer settings
        setFooterData({
          footer_about_title: footerData.footer_about_title || '',
          footer_about_text: footerData.footer_about_text || '',
          footer_quick_links_title: footerData.footer_quick_links_title || '',
          footer_quick_links: footerData.footer_quick_links || [],
          footer_categories_title: footerData.footer_categories_title || '',
          footer_categories: footerData.footer_categories || [],
          footer_contact_title: footerData.footer_contact_title || '',
          footer_contact_address: footerData.footer_contact_address || '',
          footer_contact_phone: footerData.footer_contact_phone || '',
          footer_contact_email: footerData.footer_contact_email || '',
          footer_social_title: footerData.footer_social_title || '',
          footer_social_links: footerData.footer_social_links || [],
          footer_newsletter_title: footerData.footer_newsletter_title || '',
          footer_newsletter_text: footerData.footer_newsletter_text || '',
          footer_newsletter_placeholder: footerData.footer_newsletter_placeholder || '',
          footer_payment_methods: footerData.footer_payment_methods || [],
          footer_copyright: footerData.footer_copyright || ''
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: "Error",
        description: "Failed to fetch settings from database",
        variant: "destructive"
      })
    }
  }

  const handleImageUpload = async (file: File, type: 'logo' | 'favicon') => {
    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'store')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setLogoSettings(prev => ({
          ...prev,
          [type === 'logo' ? 'logo_url' : 'favicon_url']: data.url
        }))
        
        toast({
          title: "Success",
          description: `${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully`
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to upload image",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const saveSettings = async (settingsType: string, settingsData: any) => {
    try {
      setLoading(true)
      
      let requestBody: any = {}
      
      if (settingsType === 'store') {
        // Convert store settings to database format
        const settingsToUpdate = [
          { id: databaseSettings.find(s => s.setting_key === 'site_name')?.id, setting_value: settingsData.site_name },
          { id: databaseSettings.find(s => s.setting_key === 'site_url')?.id, setting_value: settingsData.site_url },
          { id: databaseSettings.find(s => s.setting_key === 'contact_email')?.id, setting_value: settingsData.contact_email },
          { id: databaseSettings.find(s => s.setting_key === 'contact_phone')?.id, setting_value: settingsData.contact_phone },
          { id: databaseSettings.find(s => s.setting_key === 'address')?.id, setting_value: settingsData.address },
          { id: databaseSettings.find(s => s.setting_key === 'currency')?.id, setting_value: settingsData.currency },
          { id: databaseSettings.find(s => s.setting_key === 'timezone')?.id, setting_value: settingsData.timezone },
          { id: databaseSettings.find(s => s.setting_key === 'maintenance_mode')?.id, setting_value: settingsData.maintenance_mode.toString() },
          { id: databaseSettings.find(s => s.setting_key === 'google_analytics_id')?.id, setting_value: settingsData.google_analytics_id },
          { id: databaseSettings.find(s => s.setting_key === 'facebook_pixel_id')?.id, setting_value: settingsData.facebook_pixel_id },
          { id: databaseSettings.find(s => s.setting_key === 'google_tag_manager_id')?.id, setting_value: settingsData.google_tag_manager_id }
        ].filter(s => s.id) // Only include settings that exist in database
        
        requestBody = { type: 'settings', settings: settingsToUpdate }
      } else if (settingsType === 'seo') {
        const settingsToUpdate = [
          { id: databaseSettings.find(s => s.setting_key === 'site_title')?.id, setting_value: settingsData.site_title },
          { id: databaseSettings.find(s => s.setting_key === 'site_description')?.id, setting_value: settingsData.site_description },
          { id: databaseSettings.find(s => s.setting_key === 'site_keywords')?.id, setting_value: settingsData.site_keywords },
          { id: databaseSettings.find(s => s.setting_key === 'og_title')?.id, setting_value: settingsData.og_title },
          { id: databaseSettings.find(s => s.setting_key === 'og_description')?.id, setting_value: settingsData.og_description },
          { id: databaseSettings.find(s => s.setting_key === 'og_image')?.id, setting_value: settingsData.og_image },
          { id: databaseSettings.find(s => s.setting_key === 'twitter_card')?.id, setting_value: settingsData.twitter_card },
          { id: databaseSettings.find(s => s.setting_key === 'twitter_site')?.id, setting_value: settingsData.twitter_site },
          { id: databaseSettings.find(s => s.setting_key === 'canonical_url')?.id, setting_value: settingsData.canonical_url },
          { id: databaseSettings.find(s => s.setting_key === 'robots_txt')?.id, setting_value: settingsData.robots_txt }
        ].filter(s => s.id)
        
        requestBody = { type: 'settings', settings: settingsToUpdate }
      } else if (settingsType === 'logo') {
        const settingsToUpdate = [
          { id: databaseSettings.find(s => s.setting_key === 'logo_url')?.id, setting_value: settingsData.logo_url },
          { id: databaseSettings.find(s => s.setting_key === 'favicon_url')?.id, setting_value: settingsData.favicon_url }
        ].filter(s => s.id)
        
        requestBody = { type: 'settings', settings: settingsToUpdate }
      } else if (settingsType === 'smtp') {
        const settingsToUpdate = [
          { id: databaseSettings.find(s => s.setting_key === 'smtp_host')?.id, setting_value: settingsData.smtp_host },
          { id: databaseSettings.find(s => s.setting_key === 'smtp_port')?.id, setting_value: settingsData.smtp_port },
          { id: databaseSettings.find(s => s.setting_key === 'smtp_username')?.id, setting_value: settingsData.smtp_username },
          { id: databaseSettings.find(s => s.setting_key === 'smtp_password')?.id, setting_value: settingsData.smtp_password },
          { id: databaseSettings.find(s => s.setting_key === 'smtp_from_email')?.id, setting_value: settingsData.smtp_from_email },
          { id: databaseSettings.find(s => s.setting_key === 'smtp_from_name')?.id, setting_value: settingsData.smtp_from_name }
        ].filter(s => s.id)
        
        requestBody = { type: 'settings', settings: settingsToUpdate }
      } else if (settingsType === 'footer') {
        // Convert footer settings to database format
        const footerSettingsToUpdate = footerSettings.map(fs => {
          const key = fs.section_key
          let value = settingsData[key]
          
          // Handle JSON fields
          if (fs.section_type === 'json' && Array.isArray(value)) {
            value = JSON.stringify(value)
          }
          
          return {
            id: fs.id,
            section_value: value || '',
            section_type: fs.section_type,
            description: fs.description,
            is_active: fs.is_active
          }
        })
        
        requestBody = { type: 'footer', footerSettings: footerSettingsToUpdate }
      }
      
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Settings saved successfully"
        })
        // Refresh settings after save
        await fetchSettings()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save settings",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your store settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Store
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Logo
          </TabsTrigger>
          <TabsTrigger value="smtp" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            SMTP
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Footer
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Site Name</Label>
                    <Input
                      id="site_name"
                      value={storeSettings.site_name}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, site_name: e.target.value }))}
                      placeholder="Your Site Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site_url">Site URL</Label>
                    <Input
                      id="site_url"
                      value={storeSettings.site_url}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, site_url: e.target.value }))}
                      placeholder="https://yourstore.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={storeSettings.contact_email}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                      placeholder="contact@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={storeSettings.contact_phone}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={storeSettings.currency}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, currency: e.target.value }))}
                      placeholder="INR"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={storeSettings.timezone}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, timezone: e.target.value }))}
                      placeholder="Asia/Kolkata"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      value={storeSettings.address}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Your business address..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                    <Input
                      id="google_analytics_id"
                      value={storeSettings.google_analytics_id}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, google_analytics_id: e.target.value }))}
                      placeholder="GA-XXXXXXXXX-X"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                    <Input
                      id="facebook_pixel_id"
                      value={storeSettings.facebook_pixel_id}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, facebook_pixel_id: e.target.value }))}
                      placeholder="123456789012345"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google_tag_manager_id">Google Tag Manager ID</Label>
                    <Input
                      id="google_tag_manager_id"
                      value={storeSettings.google_tag_manager_id}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, google_tag_manager_id: e.target.value }))}
                      placeholder="GTM-XXXXXXX"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenance_mode"
                  checked={storeSettings.maintenance_mode}
                  onCheckedChange={(checked) => setStoreSettings(prev => ({ ...prev, maintenance_mode: checked }))}
                />
                <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('store', storeSettings)}
                  disabled={loading}
                  className="no-transition"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Store Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                SEO Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site_title">Site Title</Label>
                    <Input
                      id="site_title"
                      value={seoSettings.site_title}
                      onChange={(e) => setSeoSettings(prev => ({ ...prev, site_title: e.target.value }))}
                      placeholder="Your Site Title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site_description">Site Description</Label>
                    <Textarea
                      id="site_description"
                      value={seoSettings.site_description}
                      onChange={(e) => setSeoSettings(prev => ({ ...prev, site_description: e.target.value }))}
                      placeholder="Your site description for SEO..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site_keywords">Site Keywords</Label>
                    <Input
                      id="site_keywords"
                      value={seoSettings.site_keywords}
                      onChange={(e) => setSeoSettings(prev => ({ ...prev, site_keywords: e.target.value }))}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="canonical_url">Canonical URL</Label>
                    <Input
                      id="canonical_url"
                      value={seoSettings.canonical_url}
                      onChange={(e) => setSeoSettings(prev => ({ ...prev, canonical_url: e.target.value }))}
                      placeholder="https://yourstore.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="og_title">Open Graph Title</Label>
                    <Input
                      id="og_title"
                      value={seoSettings.og_title}
                      onChange={(e) => setSeoSettings(prev => ({ ...prev, og_title: e.target.value }))}
                      placeholder="OG Title for Social Sharing"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og_description">Open Graph Description</Label>
                    <Textarea
                      id="og_description"
                      value={seoSettings.og_description}
                      onChange={(e) => setSeoSettings(prev => ({ ...prev, og_description: e.target.value }))}
                      placeholder="OG Description for Social Sharing..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og_image">Open Graph Image</Label>
                    <Input
                      id="og_image"
                      value={seoSettings.og_image}
                      onChange={(e) => setSeoSettings(prev => ({ ...prev, og_image: e.target.value }))}
                      placeholder="/images/og-image.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter_site">Twitter Handle</Label>
                    <Input
                      id="twitter_site"
                      value={seoSettings.twitter_site}
                      onChange={(e) => setSeoSettings(prev => ({ ...prev, twitter_site: e.target.value }))}
                      placeholder="@yourstore"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="robots_txt">Robots.txt Content</Label>
                <Textarea
                  id="robots_txt"
                  value={seoSettings.robots_txt}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, robots_txt: e.target.value }))}
                  placeholder="User-agent: *&#10;Allow: /&#10;Sitemap: https://yourstore.com/sitemap.xml"
                  rows={4}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('seo', seoSettings)}
                  disabled={loading}
                  className="no-transition"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save SEO Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logo Settings */}
        <TabsContent value="logo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Logo & Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Store Logo</Label>
                    <FileUpload
                      onFileSelect={(file) => handleImageUpload(file, 'logo')}
                      disabled={uploading}
                      showPreview={true}
                      currentImage={logoSettings.logo_url}
                      onRemove={() => setLogoSettings(prev => ({ ...prev, logo_url: '' }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <FileUpload
                      onFileSelect={(file) => handleImageUpload(file, 'favicon')}
                      disabled={uploading}
                      showPreview={true}
                      currentImage={logoSettings.favicon_url}
                      onRemove={() => setLogoSettings(prev => ({ ...prev, favicon_url: '' }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('logo', logoSettings)}
                  disabled={loading}
                  className="no-transition"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Logo Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMTP Settings */}
        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                SMTP Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_host">SMTP Host</Label>
                    <Input
                      id="smtp_host"
                      value={smtpSettings.smtp_host}
                      onChange={(e) => setSmtpSettings(prev => ({ ...prev, smtp_host: e.target.value }))}
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp_port">SMTP Port</Label>
                    <Input
                      id="smtp_port"
                      value={smtpSettings.smtp_port}
                      onChange={(e) => setSmtpSettings(prev => ({ ...prev, smtp_port: e.target.value }))}
                      placeholder="587"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp_username">SMTP Username</Label>
                    <Input
                      id="smtp_username"
                      value={smtpSettings.smtp_username}
                      onChange={(e) => setSmtpSettings(prev => ({ ...prev, smtp_username: e.target.value }))}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp_password">SMTP Password</Label>
                    <Input
                      id="smtp_password"
                      type="password"
                      value={smtpSettings.smtp_password}
                      onChange={(e) => setSmtpSettings(prev => ({ ...prev, smtp_password: e.target.value }))}
                      placeholder="Your app password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp_from_email">From Email</Label>
                    <Input
                      id="smtp_from_email"
                      type="email"
                      value={smtpSettings.smtp_from_email}
                      onChange={(e) => setSmtpSettings(prev => ({ ...prev, smtp_from_email: e.target.value }))}
                      placeholder="noreply@yourstore.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp_from_name">From Name</Label>
                    <Input
                      id="smtp_from_name"
                      value={smtpSettings.smtp_from_name}
                      onChange={(e) => setSmtpSettings(prev => ({ ...prev, smtp_from_name: e.target.value }))}
                      placeholder="Your Store Name"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('smtp', smtpSettings)}
                  disabled={loading}
                  className="no-transition"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save SMTP Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Settings */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Footer Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer_about_title">About Section Title</Label>
                    <Input
                      id="footer_about_title"
                      value={footerData.footer_about_title}
                      onChange={(e) => setFooterData(prev => ({ ...prev, footer_about_title: e.target.value }))}
                      placeholder="About Us"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_about_text">About Section Text</Label>
                    <Textarea
                      id="footer_about_text"
                      value={footerData.footer_about_text}
                      onChange={(e) => setFooterData(prev => ({ ...prev, footer_about_text: e.target.value }))}
                      placeholder="Your company description..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_contact_title">Contact Section Title</Label>
                    <Input
                      id="footer_contact_title"
                      value={footerData.footer_contact_title}
                      onChange={(e) => setFooterData(prev => ({ ...prev, footer_contact_title: e.target.value }))}
                      placeholder="Contact Info"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_contact_address">Contact Address</Label>
                    <Textarea
                      id="footer_contact_address"
                      value={footerData.footer_contact_address}
                      onChange={(e) => setFooterData(prev => ({ ...prev, footer_contact_address: e.target.value }))}
                      placeholder="Your business address..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_contact_phone">Contact Phone</Label>
                    <Input
                      id="footer_contact_phone"
                      value={footerData.footer_contact_phone}
                      onChange={(e) => setFooterData(prev => ({ ...prev, footer_contact_phone: e.target.value }))}
                      placeholder="+91-9876543210"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_contact_email">Contact Email</Label>
                    <Input
                      id="footer_contact_email"
                      type="email"
                      value={footerData.footer_contact_email}
                      onChange={(e) => setFooterData(prev => ({ ...prev, footer_contact_email: e.target.value }))}
                      placeholder="support@yourstore.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="footer_quick_links_title">Quick Links Title</Label>
                    <Input
                      id="footer_quick_links_title"
                      value={footerData.footer_quick_links_title}
                      onChange={(e) => setFooterData(prev => ({ ...prev, footer_quick_links_title: e.target.value }))}
                      placeholder="Quick Links"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_categories_title">Categories Title</Label>
                    <Input
                      id="footer_categories_title"
                      value={footerData.footer_categories_title}
                      onChange={(e) => setFooterData(prev => ({ ...prev, footer_categories_title: e.target.value }))}
                      placeholder="Categories"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_social_title">Social Media Title</Label>
                    <Input
                      id="footer_social_title"
                      value={footerData.footer_social_title}
                      onChange={(e) => setFooterData(prev => ({ ...prev, footer_social_title: e.target.value }))}
                      placeholder="Follow Us"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_newsletter_title">Newsletter Title</Label>
                    <Input
                      id="footer_newsletter_title"
                      value={footerData.footer_newsletter_title}
                      onChange={(e) => setFooterData(prev => ({ ...prev, footer_newsletter_title: e.target.value }))}
                      placeholder="Subscribe to Newsletter"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_newsletter_text">Newsletter Text</Label>
                    <Textarea
                      id="footer_newsletter_text"
                      value={footerData.footer_newsletter_text}
                      onChange={(e) => setFooterData(prev => ({ ...prev, footer_newsletter_text: e.target.value }))}
                      placeholder="Get updates on new products..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_newsletter_placeholder">Newsletter Placeholder</Label>
                    <Input
                      id="footer_newsletter_placeholder"
                      value={footerData.footer_newsletter_placeholder}
                      onChange={(e) => setFooterData(prev => ({ ...prev, footer_newsletter_placeholder: e.target.value }))}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="footer_copyright">Copyright Text</Label>
                    <Input
                      id="footer_copyright"
                      value={footerData.footer_copyright}
                      onChange={(e) => setFooterData(prev => ({ ...prev, footer_copyright: e.target.value }))}
                      placeholder="© 2024 Your Store. All rights reserved."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => saveSettings('footer', footerData)}
                  disabled={loading}
                  className="no-transition"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Footer Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your admin account
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone logs into your admin account
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically log out after 30 minutes of inactivity
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="no-transition">
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}