"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FileUpload } from "@/components/ui/file-upload"
import { 
  ArrowLeft, 
  Save,
  Tags,
  Image as ImageIcon
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface CategoryFormData {
  name: string
  description: string
  is_active: boolean
  image: string
}

export default function NewCategoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    is_active: true,
    image: ''
  })

  const handleInputChange = (field: keyof CategoryFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Generate slug preview
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive"
        })
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive"
        })
        return
      }
      
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('type', 'category')
      formDataUpload.append('folder', 'categories')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Upload failed with status: ${response.status}`
        
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }
      
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
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    // Comprehensive validation
    if (!formData.name || formData.name.trim() === '') {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive"
      })
      return
    }

    if (formData.name.length > 100) {
      toast({
        title: "Error",
        description: "Category name must be less than 100 characters",
        variant: "destructive"
      })
      return
    }

    if (formData.description && formData.description.length > 1000) {
      toast({
        title: "Error",
        description: "Description must be less than 1000 characters",
        variant: "destructive"
      })
      return
    }

    // Generate slug
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    if (!slug || slug.length === 0) {
      toast({
        title: "Error",
        description: "Unable to generate valid slug from category name",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: slug,
          description: formData.description?.trim() || '',
          image: formData.image,
          is_active: formData.is_active,
          sort_order: 0
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Request failed with status: ${response.status}`
        
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Category created successfully"
        })
        router.push('/admin/categories')
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create category",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create category",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="ghost" size="sm" className="no-transition">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Category</h1>
          <p className="text-muted-foreground">
            Create a new product category
          </p>
        </div>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Category Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter category name"
                    maxLength={100}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.name.length}/100 characters
                  </p>
                  {formData.name && (
                    <div className="p-2 bg-muted rounded text-sm">
                      <span className="text-muted-foreground">Slug: </span>
                      <span className="font-mono">{generateSlug(formData.name)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter category description"
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.description.length}/1000 characters
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="active">Category is active</Label>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Category Image</Label>
                <FileUpload
                  onFileSelect={handleImageUpload}
                  disabled={uploading}
                  loading={uploading}
                  showPreview={true}
                  currentImage={formData.image}
                  onRemove={() => setFormData(prev => ({ ...prev, image: '' }))}
                />
                <p className="text-sm text-muted-foreground">
                  Upload an image to represent this category. Recommended size: 400x400px
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/categories">
                <Button type="button" variant="outline" className="no-transition">
                  Cancel
                </Button>
              </Link>
              <Button type="button" onClick={handleSubmit} disabled={loading || uploading} className="no-transition">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Category
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}