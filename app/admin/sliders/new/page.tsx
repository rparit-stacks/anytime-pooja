"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Upload, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewSliderPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    cta: "",
    link: "",
    isActive: true,
    sortOrder: "1",
    image: null as File | null
  })

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
    setLoading(true)

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

      const response = await fetch('/api/admin/sliders', {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        router.push('/admin/sliders')
      } else {
        console.error('Error creating slider')
      }
    } catch (error) {
      console.error('Error creating slider:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/sliders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sliders
              </Button>
            </Link>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-balance">
            Add New Slider
          </h1>
          <p className="text-muted-foreground">
            Create a new hero slider banner
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Slider Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      placeholder="e.g., Beautiful idols, bells, and temple essentials for your home"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cta">CTA Text *</Label>
                      <Input
                        id="cta"
                        value={formData.cta}
                        onChange={(e) => handleInputChange('cta', e.target.value)}
                        placeholder="e.g., Explore Mandir"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="link">CTA Link *</Label>
                      <Input
                        id="link"
                        value={formData.link}
                        onChange={(e) => handleInputChange('link', e.target.value)}
                        placeholder="e.g., /products?category=mandir"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => handleInputChange('sortOrder', e.target.value)}
                      placeholder="1"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Slider Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="image">Upload Image *</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mt-2"
                        required
                      />
                    </div>
                    {formData.image && (
                      <div className="text-sm text-muted-foreground">
                        Selected: {formData.image.name}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Recommended size: 1920x600px or similar aspect ratio
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Slider Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive">Active</Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Slider'}
              </Button>
            </div>
          </div>
        </form>
    </div>
  )
}
