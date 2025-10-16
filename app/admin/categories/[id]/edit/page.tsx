"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Upload, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface Category {
  id: number
  name: string
  slug: string
  description: string
  image: string
  is_active: boolean
  sort_order: number
  product_count: number
}

interface CategoryFormData {
  name: string
  slug: string
  description: string
  image: string
  is_active: boolean
  sort_order: string
}

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    image: "",
    is_active: true,
    sort_order: "0"
  })

  useEffect(() => {
    if (categoryId) {
      fetchCategory()
    }
  }, [categoryId])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`)
      const data = await response.json()

      if (data.success) {
        const categoryData = data.category
        setCategory(categoryData)
        setFormData({
          name: categoryData.name || "",
          slug: categoryData.slug || "",
          description: categoryData.description || "",
          image: categoryData.image || "",
          is_active: categoryData.is_active !== false,
          sort_order: categoryData.sort_order?.toString() || "0"
        })
      } else {
        toast.error(data.error || 'Failed to fetch category')
        router.push('/admin/categories')
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      toast.error('Failed to fetch category')
      router.push('/admin/categories')
    }
  }

  const handleInputChange = (field: keyof CategoryFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug from name
    if (field === 'name' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({
        ...prev,
        slug
      }))
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'categories')

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.slug) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          sort_order: parseInt(formData.sort_order)
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Category updated successfully')
        router.push('/admin/categories')
      } else {
        toast.error(data.error || 'Failed to update category')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
    } finally {
      setLoading(false)
    }
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading category...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Category</h1>
          <p className="text-muted-foreground">Update category information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="category-slug"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Category description"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Category Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Category Image</Label>
                  <div className="mt-2">
                    {formData.image ? (
                      <div className="relative w-48 h-48 border rounded-lg overflow-hidden">
                        <img 
                          src={formData.image} 
                          alt="Category image"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="flex gap-2">
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
                                  if (file) handleImageUpload(file)
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
                              onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                              disabled={uploading}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-48 h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          {uploading ? (
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          ) : (
                            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          )}
                          <p className="text-sm text-muted-foreground mb-2">
                            {uploading ? "Uploading..." : "Upload category image"}
                          </p>
                          <p className="text-xs text-muted-foreground">Recommended: 400x400px</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(file)
                            }}
                            className="hidden"
                            disabled={uploading}
                            id="category-image-upload-edit"
                          />
                          <label 
                            htmlFor="category-image-upload-edit"
                            className="absolute inset-0 w-full h-full cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Category Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => handleInputChange('sort_order', e.target.value)}
                    placeholder="0"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Lower numbers appear first in category listings
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked as boolean)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                  <p className="text-sm text-muted-foreground ml-2">
                    Only active categories are visible to customers
                  </p>
                </div>

                {category.product_count > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> This category has {category.product_count} product(s). 
                      If you deactivate it, those products will not be visible in this category.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6">
          <Link href="/admin/categories">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading || uploading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Category
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
