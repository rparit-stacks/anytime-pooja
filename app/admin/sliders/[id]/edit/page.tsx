"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FileUpload } from "@/components/ui/file-upload"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface SliderFormData {
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  image: string
  is_active: boolean
  sort_order: number
}

interface Slider {
  id: number
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  image: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export default function EditSliderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [slider, setSlider] = useState<Slider | null>(null)

  const [formData, setFormData] = useState<SliderFormData>({
    title: '',
    subtitle: '',
    cta_text: '',
    cta_link: '',
    image: '',
    is_active: true,
    sort_order: 0
  })

  useEffect(() => {
    fetchSlider()
  }, [params.id])

  const fetchSlider = async () => {
    try {
      setFetching(true)
      const response = await fetch(`/api/admin/sliders/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setSlider(data.slider)
        setFormData({
          title: data.slider.title,
          subtitle: data.slider.subtitle,
          cta_text: data.slider.cta_text,
          cta_link: data.slider.cta_link,
          image: data.slider.image,
          is_active: data.slider.is_active,
          sort_order: data.slider.sort_order
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch slider",
          variant: "destructive"
        })
        router.push('/admin/sliders')
      }
    } catch (error) {
      console.error('Error fetching slider:', error)
      toast({
        title: "Error",
        description: "Failed to fetch slider",
        variant: "destructive"
      })
      router.push('/admin/sliders')
    } finally {
      setFetching(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'sliders')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          image: data.url
        }))
        
        toast({
          title: "Success",
          description: "Image uploaded successfully"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive"
      })
      return
    }

    if (!formData.cta_text.trim()) {
      toast({
        title: "Error",
        description: "CTA text is required",
        variant: "destructive"
      })
      return
    }

    if (!formData.cta_link.trim()) {
      toast({
        title: "Error",
        description: "CTA link is required",
        variant: "destructive"
      })
      return
    }

    if (!formData.image.trim()) {
      toast({
        title: "Error",
        description: "Image is required",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch(`/api/admin/sliders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Slider updated successfully"
        })
        router.push('/admin/sliders')
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update slider",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating slider:', error)
      toast({
        title: "Error",
        description: "Failed to update slider",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading slider...</span>
      </div>
    )
  }

  if (!slider) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Slider not found</h2>
        <Link href="/admin/sliders">
          <Button className="no-transition">Back to Sliders</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/sliders">
          <Button variant="ghost" size="sm" className="no-transition">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sliders
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Slider</h1>
          <p className="text-muted-foreground">
            Update slider: {slider.title}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Slider Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter slider title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Enter slider subtitle"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta_text">CTA Text *</Label>
                    <Input
                      id="cta_text"
                      value={formData.cta_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                      placeholder="e.g., Shop Now, Learn More"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cta_link">CTA Link *</Label>
                    <Input
                      id="cta_link"
                      value={formData.cta_link}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta_link: e.target.value }))}
                      placeholder="e.g., /products, /about"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-sm text-muted-foreground">
                    Lower numbers appear first in the slider
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Slider Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FileUpload
                    onFileSelect={handleImageUpload}
                    disabled={uploading}
                    showPreview={true}
                    currentImage={formData.image}
                    onRemove={() => setFormData(prev => ({ ...prev, image: '' }))}
                    accept="image/*"
                  />
                  <p className="text-sm text-muted-foreground">
                    Recommended size: 1920x700px or similar aspect ratio
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Show this slider on the homepage
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full no-transition"
                    disabled={loading || uploading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Slider
                      </>
                    )}
                  </Button>
                  <Link href="/admin/sliders" className="block">
                    <Button variant="outline" className="w-full no-transition">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
