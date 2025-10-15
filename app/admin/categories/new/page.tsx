"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faSave } from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function AddNewCategoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: null as File | null,
    sortOrder: "0",
    isActive: true,
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

      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        body: formDataToSend
      })

      if (response.ok) {
        toast.success("Category added successfully!")
        router.push('/admin/categories')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to add category")
      }
    } catch (err) {
      toast.error("Failed to add category")
      console.error("Error adding category:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/categories">
              <Button variant="ghost" size="sm">
                <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
            </Link>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-balance">
            Add New Category
          </h1>
          <p className="text-muted-foreground">
            Create a new product category
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
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-2"
                    />
                    {formData.image && (
                      <div className="text-sm text-muted-foreground mt-2">
                        Selected: {formData.image.name}
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
                <Button type="submit" disabled={loading}>
                  <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Category'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
    </div>
  )
}
