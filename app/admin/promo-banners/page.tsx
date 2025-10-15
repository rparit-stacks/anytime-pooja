"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingButton, LoadingSaveButton, LoadingDeleteButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { LoadingCard, LoadingSpinner } from "@/components/ui/loading"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faSave, 
  faTimes,
  faImage,
  faEye,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons"
import { toast } from "sonner"
import Link from "next/link"

interface PromoBanner {
  id: number
  banner_key: string
  banner_title: string
  banner_description: string
  banner_image: string
  button_text: string
  button_url: string
  banner_order: number
  is_active: boolean
}

export default function PromoBannersPage() {
  const [banners, setBanners] = useState<PromoBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/promo-banners')
      const data = await response.json()
      setBanners(data.banners || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
      toast.error('Failed to fetch promo banners')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (bannerData: Partial<PromoBanner>) => {
    console.log('handleSave called with:', bannerData)
    setSaving(true)
    try {
      const formData = new FormData()
      
      // Add all form data
      formData.append('banner_title', bannerData.banner_title || '')
      formData.append('banner_description', bannerData.banner_description || '')
      formData.append('button_text', bannerData.button_text || '')
      formData.append('button_url', bannerData.button_url || '')
      formData.append('banner_order', (bannerData.banner_order || 1).toString())
      formData.append('is_active', (bannerData.is_active ?? true).toString())

      // Handle image upload
      const bannerImage = document.getElementById('banner_image') as HTMLInputElement
      if (bannerImage?.files?.[0]) {
        formData.append('banner_image', bannerImage.files[0])
        console.log('Image file added:', bannerImage.files[0].name)
      }

      const url = editingBanner 
        ? `/api/admin/promo-banners/${editingBanner.id}`
        : '/api/admin/promo-banners'
      
      const method = editingBanner ? 'PUT' : 'POST'

      console.log('Making API call:', { url, method })

      const response = await fetch(url, {
        method,
        body: formData
      })

      console.log('API response:', response.status, response.statusText)

      if (response.ok) {
        toast.success(editingBanner ? 'Banner updated successfully' : 'Banner created successfully')
        await fetchBanners()
        setEditingBanner(null)
        setShowAddForm(false)
        // Reset form
        if (bannerImage) {
          bannerImage.value = ''
        }
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        toast.error(errorData.error || 'Failed to save banner')
      }
    } catch (error) {
      console.error('Error saving banner:', error)
      toast.error('Failed to save banner')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      const response = await fetch(`/api/admin/promo-banners/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Banner deleted successfully')
        await fetchBanners()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to delete banner')
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast.error('Failed to delete banner')
    }
  }

  const toggleActive = async (banner: PromoBanner) => {
    try {
      const formData = new FormData()
      formData.append('banner_title', banner.banner_title)
      formData.append('banner_description', banner.banner_description)
      formData.append('button_text', banner.button_text)
      formData.append('button_url', banner.button_url)
      formData.append('banner_order', banner.banner_order.toString())
      formData.append('is_active', (!banner.is_active).toString())

      const response = await fetch(`/api/admin/promo-banners/${banner.id}`, {
        method: 'PUT',
        body: formData
      })

      if (response.ok) {
        toast.success(`Banner ${!banner.is_active ? 'activated' : 'deactivated'}`)
        await fetchBanners()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update banner')
      }
    } catch (error) {
      console.error('Error updating banner:', error)
      toast.error('Failed to update banner')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingCard text="Loading promo banners..." />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Promo Banners</h1>
        <p className="text-muted-foreground">Manage promotional banners displayed on the homepage</p>
      </div>

      <div className="mb-6">
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
          disabled={saving}
        >
          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
          Add New Banner
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingBanner) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingBanner(null)
                  setShowAddForm(false)
                  // Reset form
                  const bannerImage = document.getElementById('banner_image') as HTMLInputElement
                  if (bannerImage) {
                    bannerImage.value = ''
                  }
                }}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              console.log('Form submitted!')
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              
              // Validate required fields
              const banner_title = formData.get('banner_title') as string
              const banner_description = formData.get('banner_description') as string
              const button_text = formData.get('button_text') as string
              const button_url = formData.get('button_url') as string
              
              console.log('Form data:', {
                banner_title,
                banner_description,
                button_text,
                button_url,
                editingBanner: editingBanner?.id
              })
              
              if (!banner_title.trim()) {
                toast.error('Banner title is required')
                return
              }
              if (!banner_description.trim()) {
                toast.error('Banner description is required')
                return
              }
              if (!button_text.trim()) {
                toast.error('Button text is required')
                return
              }
              if (!button_url.trim()) {
                toast.error('Button URL is required')
                return
              }
              
              // Validate URL format
              if (!button_url.startsWith('/') && !button_url.startsWith('http')) {
                toast.error('Button URL must start with / or http')
                return
              }
              
              const bannerData = {
                banner_title: banner_title.trim(),
                banner_description: banner_description.trim(),
                button_text: button_text.trim(),
                button_url: button_url.trim(),
                banner_order: parseInt(formData.get('banner_order') as string) || 1,
                is_active: formData.get('is_active') === 'on'
              }
              
              console.log('Calling handleSave with:', bannerData)
              handleSave(bannerData)
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="banner_title">Banner Title</Label>
                  <Input
                    id="banner_title"
                    name="banner_title"
                    defaultValue={editingBanner?.banner_title || ''}
                    placeholder="Enter banner title"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="button_text">Button Text</Label>
                  <Input
                    id="button_text"
                    name="button_text"
                    defaultValue={editingBanner?.button_text || ''}
                    placeholder="Enter button text"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="banner_description">Banner Description</Label>
                <Textarea
                  id="banner_description"
                  name="banner_description"
                  defaultValue={editingBanner?.banner_description || ''}
                  placeholder="Enter banner description"
                  rows={3}
                  required
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="button_url">Button URL</Label>
                  <Input
                    id="button_url"
                    name="button_url"
                    defaultValue={editingBanner?.button_url || ''}
                    placeholder="Enter button URL"
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="banner_order">Display Order</Label>
                  <Input
                    id="banner_order"
                    name="banner_order"
                    type="number"
                    defaultValue={editingBanner?.banner_order || 1}
                    min="1"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="banner_image">Banner Image</Label>
                {editingBanner?.banner_image && (
                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
                    <img 
                      src={editingBanner.banner_image} 
                      alt="Current banner"
                      className="w-32 h-20 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-banner.jpg'
                      }}
                    />
                  </div>
                )}
                <Input
                  id="banner_image"
                  name="banner_image"
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {editingBanner ? 'Upload a new image to replace the current one' : 'Upload banner image'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingBanner?.is_active ?? true}
                  disabled={saving}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <Button 
                type="submit"
                disabled={saving} 
                className="w-full"
                onClick={() => {
                  console.log('Button clicked!')
                }}
              >
                <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
                {editingBanner ? 'Update Banner' : 'Create Banner'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={banner.banner_image}
                alt={banner.banner_title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-banner.jpg'
                }}
              />
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant={banner.is_active ? "default" : "secondary"}
                  onClick={() => toggleActive(banner)}
                >
                  <FontAwesomeIcon 
                    icon={banner.is_active ? faEye : faEyeSlash} 
                    className="h-3 w-3" 
                  />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{banner.banner_title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {banner.banner_description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Order: {banner.banner_order}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingBanner(banner)
                      setShowAddForm(false)
                    }}
                    disabled={saving}
                  >
                    <FontAwesomeIcon icon={faEdit} className="h-3 w-3" />
                  </Button>
                  <LoadingDeleteButton
                    size="sm"
                    onClick={() => handleDelete(banner.id)}
                    disabled={saving}
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                  </LoadingDeleteButton>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {banners.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FontAwesomeIcon icon={faImage} className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Promo Banners</h3>
            <p className="text-muted-foreground mb-4">
              Create your first promotional banner to showcase your products
            </p>
            <Button onClick={() => setShowAddForm(true)} disabled={saving}>
              <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
              Add First Banner
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
