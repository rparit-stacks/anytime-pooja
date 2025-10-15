"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { LoadingCard, LoadingOverlay, LoadingSpinner } from "@/components/ui/loading"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faSave, faTrash } from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import { toast } from "sonner"

interface Slider {
  id: string
  title: string
  subtitle: string
  image: string
  ctaText: string
  ctaLink: string
  sortOrder: number
  isActive: boolean
}

export default function EditSliderPage() {
  const params = useParams()
  const router = useRouter()
  const sliderId = params.id as string

  const [slider, setSlider] = useState<Slider | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: null as File | null,
    ctaText: "",
    ctaLink: "",
    sortOrder: "0",
    isActive: true,
  })

  useEffect(() => {
    if (sliderId) {
      fetchSlider()
    }
  }, [sliderId])

  const fetchSlider = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/sliders/${sliderId}`)
      if (!response.ok) {
        throw new Error('Slider not found')
      }
      
      const data = await response.json()
      const sliderInfo = data.slider

      setSlider(sliderInfo)
      setFormData({
        title: sliderInfo.title || "",
        subtitle: sliderInfo.subtitle || "",
        image: null,
        ctaText: sliderInfo.ctaText || "",
        ctaLink: sliderInfo.ctaLink || "",
        sortOrder: sliderInfo.sortOrder?.toString() || "0",
        isActive: sliderInfo.isActive ?? true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load slider')
      console.error('Error fetching slider:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const formDataToSend = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'image' && value !== null) {
          formDataToSend.append(key, value.toString())
        }
      })

      // Add image if selected
      if (formData.image) {
        formDataToSend.append('image', formData.image)
      }

      const response = await fetch(`/api/admin/sliders/${sliderId}`, {
        method: 'PUT',
        body: formDataToSend
      })

      if (response.ok) {
        toast.success("Slider updated successfully!")
        router.push('/admin/sliders')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to update slider")
      }
    } catch (err) {
      toast.error("Failed to update slider")
      console.error("Error updating slider:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this slider? This action cannot be undone.')) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/sliders/${sliderId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success("Slider deleted successfully")
        router.push('/admin/sliders')
      } else {
        toast.error("Failed to delete slider")
      }
    } catch (err) {
      toast.error("Failed to delete slider")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <LoadingCard text="Loading slider details..." />
      </div>
    )
  }

  if (!slider) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Slider Not Found</h1>
        <Link href="/admin/sliders">
          <Button>
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
            Back to Sliders
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {saving && <LoadingOverlay text="Saving changes..." />}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/sliders">
                <Button variant="ghost" size="sm">
                  <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
                  Back to Sliders
                </Button>
              </Link>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDelete}
              disabled={saving}
            >
              <FontAwesomeIcon icon={faTrash} className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-balance">
            Edit Slider
          </h1>
          <p className="text-muted-foreground">
            Update slider information and settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Slider Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Sacred Mandir Collection"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Textarea
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e) => handleInputChange('subtitle', e.target.value)}
                      placeholder="Brief description of the slider"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ctaText">Call to Action Text</Label>
                    <Input
                      id="ctaText"
                      value={formData.ctaText}
                      onChange={(e) => handleInputChange('ctaText', e.target.value)}
                      placeholder="e.g., Explore Now"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ctaLink">Call to Action Link</Label>
                    <Input
                      id="ctaLink"
                      value={formData.ctaLink}
                      onChange={(e) => handleInputChange('ctaLink', e.target.value)}
                      placeholder="e.g., /products?category=mandir"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image">Slider Image</Label>
                    {slider.image && (
                      <div className="w-full h-48 relative mb-2">
                        <img 
                          src={slider.image || "/placeholder-banner.jpg"} 
                          alt="Current slider image"
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-banner.jpg"
                          }}
                        />
                      </div>
                    )}
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-2"
                    />
                    {formData.image && (
                      <div className="text-sm text-muted-foreground mt-2">
                        New image selected: {formData.image.name}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => handleInputChange('sortOrder', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive">Active Slider</Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Update Slider'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </div>
  )
}
