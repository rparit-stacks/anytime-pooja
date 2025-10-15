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

interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  sortOrder: number
  isActive: boolean
}

export default function EditCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.id as string

  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: null as File | null,
    sortOrder: "0",
    isActive: true,
  })

  useEffect(() => {
    if (categoryId) {
      fetchCategory()
    }
  }, [categoryId])

  const fetchCategory = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/categories/${categoryId}`)
      if (!response.ok) {
        throw new Error('Category not found')
      }
      
      const data = await response.json()
      const categoryInfo = data.category

      setCategory(categoryInfo)
      setFormData({
        name: categoryInfo.name || "",
        slug: categoryInfo.slug || "",
        description: categoryInfo.description || "",
        image: null,
        sortOrder: categoryInfo.sortOrder?.toString() || "0",
        isActive: categoryInfo.isActive ?? true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load category')
      console.error('Error fetching category:', err)
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

      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        body: formDataToSend
      })

      if (response.ok) {
        toast.success("Category updated successfully!")
        router.push('/admin/categories')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to update category")
      }
    } catch (err) {
      toast.error("Failed to update category")
      console.error("Error updating category:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success("Category deleted successfully")
        router.push('/admin/categories')
      } else {
        toast.error("Failed to delete category")
      }
    } catch (err) {
      toast.error("Failed to delete category")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <LoadingCard text="Loading category details..." />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <Link href="/admin/categories">
          <Button>
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
            Back to Categories
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
              <Link href="/admin/categories">
                <Button variant="ghost" size="sm">
                  <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
                  Back to Categories
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
            Edit Category
          </h1>
          <p className="text-muted-foreground">
            Update category information and settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Crystals & Gemstones"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="e.g., crystals-gemstones"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of the category"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image">Category Image</Label>
                    {category.image && (
                      <div className="w-32 h-32 relative mb-2">
                        <img 
                          src={category.image} 
                          alt="Current category image"
                          className="w-full h-full object-cover rounded-md"
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
                    <Label htmlFor="isActive">Active Category</Label>
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
                  {saving ? 'Saving...' : 'Update Category'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </div>
  )
}
