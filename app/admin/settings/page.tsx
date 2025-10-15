"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSaveButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingCard, LoadingSpinner } from "@/components/ui/loading"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faSave, 
  faSearch,
  faImage,
  faEnvelope,
  faGlobe,
  faList
} from "@fortawesome/free-solid-svg-icons"
import { toast } from "sonner"

interface Setting {
  id: string
  setting_key: string
  setting_value: string
  setting_type: string
  category: string
  description: string
  is_active: boolean
}

interface SettingsData {
  seo?: Setting[]
  logo?: Setting[]
  smtp?: Setting[]
  favicon?: Setting[]
  general?: Setting[]
}

interface FooterSetting {
  id: string
  section_key: string
  section_value: string
  section_type: string
  section_name: string
  description: string
  is_active: boolean
}

interface FooterSettingsData {
  about?: FooterSetting[]
  quick_links?: FooterSetting[]
  categories?: FooterSetting[]
  contact?: FooterSetting[]
  social?: FooterSetting[]
  newsletter?: FooterSetting[]
  payment?: FooterSetting[]
  copyright?: FooterSetting[]
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({})
  const [footerSettings, setFooterSettings] = useState<FooterSettingsData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("seo")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const [settingsResponse, footerResponse] = await Promise.all([
        fetch('/api/admin/settings'),
        fetch('/api/admin/footer')
      ])
      
      const settingsData = await settingsResponse.json()
      const footerData = await footerResponse.json()
      
      setSettings(settingsData.settings)
      setFooterSettings(footerData.footerSettings)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (category: string, key: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: prev[category]?.map(setting => 
        setting.setting_key === key 
          ? { ...setting, setting_value: value.toString() }
          : setting
      ) || []
    }))
  }

  const handleFooterSettingChange = (section: string, key: string, value: string) => {
    setFooterSettings(prev => ({
      ...prev,
      [section]: prev[section]?.map(setting => 
        setting.section_key === key 
          ? { ...setting, section_value: value }
          : setting
      ) || []
    }))
  }

  const saveSettings = async (category: string) => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('category', category)
      
      const settingsData: Record<string, string> = {}
      if (settings[category as keyof SettingsData]) {
        settings[category as keyof SettingsData]!.forEach(setting => {
          settingsData[setting.setting_key] = setting.setting_value
        })
      }
      formData.append('settings', JSON.stringify(settingsData))
      
      const fileInputs = document.querySelectorAll(`input[type="file"][data-category="${category}"]`) as NodeListOf<HTMLInputElement>
      fileInputs.forEach(input => {
        if (input.files && input.files[0]) {
          formData.append(input.name, input.files[0])
        }
      })
      
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        toast.success(`${category.toUpperCase()} settings saved successfully`)
        await fetchSettings()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const saveFooterSettings = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      
      const footerData: Record<string, string> = {}
      Object.values(footerSettings).forEach(sectionSettings => {
        sectionSettings?.forEach(setting => {
          footerData[setting.section_key] = setting.section_value
        })
      })
      
      formData.append('settings', JSON.stringify(footerData))
      
      const response = await fetch('/api/admin/footer', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        toast.success('Footer settings saved successfully')
        await fetchSettings()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save footer settings')
      }
    } catch (error) {
      console.error('Error saving footer settings:', error)
      toast.error('Failed to save footer settings')
    } finally {
      setSaving(false)
    }
  }

  const getSettingValue = (category: string, key: string): string => {
    return settings[category as keyof SettingsData]?.find(s => s.setting_key === key)?.setting_value || ''
  }

  const getFooterSettingValue = (section: string, key: string): string => {
    return footerSettings[section as keyof FooterSettingsData]?.find(s => s.section_key === key)?.section_value || ''
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingCard text="Loading settings..." />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">Manage your site's SEO, logo, SMTP, and other settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faImage} className="h-4 w-4" />
            Logo
          </TabsTrigger>
          <TabsTrigger value="smtp" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
            SMTP
          </TabsTrigger>
          <TabsTrigger value="favicon" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faGlobe} className="h-4 w-4" />
            Favicon
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faList} className="h-4 w-4" />
            Footer
          </TabsTrigger>
        </TabsList>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="site_title">Site Title</Label>
                  <Input
                    id="site_title"
                    value={getSettingValue('seo', 'site_title')}
                    onChange={(e) => handleSettingChange('seo', 'site_title', e.target.value)}
                    placeholder="Your site title"
                  />
                </div>
                <div>
                  <Label htmlFor="site_keywords">Keywords</Label>
                  <Input
                    id="site_keywords"
                    value={getSettingValue('seo', 'site_keywords')}
                    onChange={(e) => handleSettingChange('seo', 'site_keywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={getSettingValue('seo', 'site_description')}
                  onChange={(e) => handleSettingChange('seo', 'site_description', e.target.value)}
                  placeholder="Your site description"
                  rows={3}
                />
              </div>

              <LoadingSaveButton 
                onClick={() => saveSettings('seo')} 
                disabled={saving}
                className="w-full"
                loadingText="Saving SEO Settings..."
              >
                <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
                Save SEO Settings
              </LoadingSaveButton>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logo Settings */}
        <TabsContent value="logo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="logo">Upload Logo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  data-category="logo"
                  name="logo"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="logo_width">Logo Width (px)</Label>
                  <Input
                    id="logo_width"
                    type="number"
                    value={getSettingValue('logo', 'logo_width')}
                    onChange={(e) => handleSettingChange('logo', 'logo_width', e.target.value)}
                    placeholder="200"
                  />
                </div>
                <div>
                  <Label htmlFor="logo_height">Logo Height (px)</Label>
                  <Input
                    id="logo_height"
                    type="number"
                    value={getSettingValue('logo', 'logo_height')}
                    onChange={(e) => handleSettingChange('logo', 'logo_height', e.target.value)}
                    placeholder="60"
                  />
                </div>
              </div>

              <LoadingSaveButton 
                onClick={() => saveSettings('logo')} 
                disabled={saving}
                className="w-full"
                loadingText="Saving Logo Settings..."
              >
                <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
                Save Logo Settings
              </LoadingSaveButton>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMTP Settings */}
        <TabsContent value="smtp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="smtp_host">SMTP Host</Label>
                  <Input
                    id="smtp_host"
                    value={getSettingValue('smtp', 'smtp_host')}
                    onChange={(e) => handleSettingChange('smtp', 'smtp_host', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_port">SMTP Port</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={getSettingValue('smtp', 'smtp_port')}
                    onChange={(e) => handleSettingChange('smtp', 'smtp_port', e.target.value)}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input
                    id="smtp_username"
                    type="email"
                    value={getSettingValue('smtp', 'smtp_username')}
                    onChange={(e) => handleSettingChange('smtp', 'smtp_username', e.target.value)}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={getSettingValue('smtp', 'smtp_password')}
                    onChange={(e) => handleSettingChange('smtp', 'smtp_password', e.target.value)}
                    placeholder="Your app password"
                  />
                </div>
              </div>

              <LoadingSaveButton 
                onClick={() => saveSettings('smtp')} 
                disabled={saving}
                className="w-full"
                loadingText="Saving SMTP Settings..."
              >
                <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
                Save SMTP Settings
              </LoadingSaveButton>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favicon Settings */}
        <TabsContent value="favicon" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Favicon Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="favicon">Upload Favicon</Label>
                <Input
                  type="file"
                  accept="image/*"
                  data-category="favicon"
                  name="favicon"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 32x32 or 16x16 pixels, .ico format
                </p>
              </div>

              <div>
                <Label htmlFor="apple_touch_icon">Upload Apple Touch Icon</Label>
                <Input
                  type="file"
                  accept="image/*"
                  data-category="favicon"
                  name="apple_touch_icon"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 180x180 pixels, .png format
                </p>
              </div>

              <LoadingSaveButton 
                onClick={() => saveSettings('favicon')} 
                disabled={saving}
                className="w-full"
                loadingText="Saving Favicon Settings..."
              >
                <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
                Save Favicon Settings
              </LoadingSaveButton>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Settings */}
        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Footer Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* About Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">About Section</h3>
                <div>
                  <Label htmlFor="footer_about_title">About Title</Label>
                  <Input
                    id="footer_about_title"
                    value={getFooterSettingValue('about', 'footer_about_title')}
                    onChange={(e) => handleFooterSettingChange('about', 'footer_about_title', e.target.value)}
                    placeholder="About Anytime Pooja"
                  />
                </div>
                <div>
                  <Label htmlFor="footer_about_text">About Text</Label>
                  <Textarea
                    id="footer_about_text"
                    value={getFooterSettingValue('about', 'footer_about_text')}
                    onChange={(e) => handleFooterSettingChange('about', 'footer_about_text', e.target.value)}
                    placeholder="Your trusted destination for authentic spiritual products..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Contact Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="footer_contact_title">Contact Title</Label>
                    <Input
                      id="footer_contact_title"
                      value={getFooterSettingValue('contact', 'footer_contact_title')}
                      onChange={(e) => handleFooterSettingChange('contact', 'footer_contact_title', e.target.value)}
                      placeholder="Contact Info"
                    />
                  </div>
                  <div>
                    <Label htmlFor="footer_contact_phone">Phone</Label>
                    <Input
                      id="footer_contact_phone"
                      value={getFooterSettingValue('contact', 'footer_contact_phone')}
                      onChange={(e) => handleFooterSettingChange('contact', 'footer_contact_phone', e.target.value)}
                      placeholder="+91-9876543210"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="footer_contact_email">Email</Label>
                  <Input
                    id="footer_contact_email"
                    type="email"
                    value={getFooterSettingValue('contact', 'footer_contact_email')}
                    onChange={(e) => handleFooterSettingChange('contact', 'footer_contact_email', e.target.value)}
                    placeholder="support@anytimepooja.com"
                  />
                </div>
                <div>
                  <Label htmlFor="footer_contact_address">Address</Label>
                  <Textarea
                    id="footer_contact_address"
                    value={getFooterSettingValue('contact', 'footer_contact_address')}
                    onChange={(e) => handleFooterSettingChange('contact', 'footer_contact_address', e.target.value)}
                    placeholder="123 Spiritual Street, Divine City, India - 110001"
                    rows={2}
                  />
                </div>
              </div>

              {/* Copyright Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Copyright</h3>
                <div>
                  <Label htmlFor="footer_copyright">Copyright Text</Label>
                  <Input
                    id="footer_copyright"
                    value={getFooterSettingValue('copyright', 'footer_copyright')}
                    onChange={(e) => handleFooterSettingChange('copyright', 'footer_copyright', e.target.value)}
                    placeholder="© 2024 Anytime Pooja. All rights reserved."
                  />
                </div>
              </div>

              <LoadingSaveButton 
                onClick={saveFooterSettings} 
                disabled={saving}
                className="w-full"
                loadingText="Saving Footer Settings..."
              >
                <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
                Save Footer Settings
              </LoadingSaveButton>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
