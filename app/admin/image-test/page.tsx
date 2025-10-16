"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"

export default function ImageTestPage() {
  const [mainImage, setMainImage] = useState("")
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (file: File, type: 'main' | 'gallery') => {
    try {
      setUploading(true)
      console.log('Uploading image with type:', type)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'test')

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        console.log('Upload successful, type:', type, 'URL:', data.url)
        
        if (type === 'main') {
          setMainImage(data.url)
          console.log('Set main image:', data.url)
        } else {
          setGalleryImages(prev => [...prev, data.url])
          console.log('Added to gallery:', data.url)
        }
        toast.success('Image uploaded successfully')
      } else {
        toast.error(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Image Upload Test</h1>
        <p className="text-muted-foreground">Testing image upload functionality</p>
      </div>

      {/* Main Image */}
      <Card>
        <CardHeader>
          <CardTitle>Main Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Main Image</Label>
            <div className="mt-2">
              {mainImage ? (
                <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                  <img 
                    src={mainImage} 
                    alt="Main image"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = 'image/*'
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) handleImageUpload(file, 'main')
                          }
                          input.click()
                        }}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        ) : (
                          <Upload className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setMainImage("")}
                        disabled={uploading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {uploading ? "Uploading..." : "Upload main image"}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'main')
                      }}
                      className="hidden"
                      disabled={uploading}
                      id="main-image-test"
                    />
                    <label 
                      htmlFor="main-image-test"
                      className="absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Main Image URL: {mainImage || "None"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Images */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Gallery Images</Label>
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.map((image, index) => (
                <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                  <img 
                    src={image} 
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1"
                    onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== index))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {galleryImages.length < 8 && (
                <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-1"></div>
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {uploading ? "Uploading..." : "Add"}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'gallery')
                      }}
                      className="hidden"
                      disabled={uploading}
                      id="gallery-image-test"
                    />
                    <label 
                      htmlFor="gallery-image-test"
                      className="absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Gallery Images: {galleryImages.length} images
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
