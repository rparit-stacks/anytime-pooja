"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Check, X } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id?: string
  name: string
  slug: string
  description: string
  sortOrder: number
  isActive: boolean
  image?: string
}

interface CategoryModalProps {
  category?: Category | null
  onClose: () => void
  onSave: () => void
}

export default function CategoryModal({ category, onClose, onSave }: CategoryModalProps) {
  const [formData, setFormData] = useState<Category>({
    name: '',
    slug: '',
    description: '',
    sortOrder: 0,
    isActive: true
  })
  
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Update form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        sortOrder: category.sortOrder || 0,
        isActive: category.isActive ?? true
      })
      setImagePreview(null)
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        sortOrder: 0,
        isActive: true
      })
      setImagePreview(null)
    }
  }, [category])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: category ? prev.slug : generateSlug(name)
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      setSaving(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      
      // Add all form data
      formDataToSend.append('name', formData.name)
      formDataToSend.append('slug', formData.slug)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('sortOrder', formData.sortOrder.toString())
      formDataToSend.append('isActive', formData.isActive.toString())

      // Handle image upload
      const imageInput = document.getElementById('category_image') as HTMLInputElement
      if (imageInput?.files?.[0]) {
        formDataToSend.append('image', imageInput.files[0])
      }

      const url = category ? `/api/admin/categories/${category.id}` : '/api/admin/categories'
      const method = category ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formDataToSend
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(category ? 'Category updated successfully!' : 'Category created successfully!')
        onSave()
      } else {
        if (result.code === 'DUPLICATE_NAME') {
          toast.error('Category with this name already exists. Please choose a different name.')
        } else if (result.code === 'DUPLICATE_SLUG') {
          toast.error('Category with this slug already exists. Please choose a different slug.')
        } else {
          toast.error(result.error || 'Failed to save category')
        }
      }
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {category ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter category name"
                  required
                  disabled={saving}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="category-slug"
                  required
                  disabled={saving}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this category"
                  disabled={saving}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder" className="text-sm font-medium">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  placeholder={category ? "Current: " + category.sortOrder : "Auto-assign"}
                  min="0"
                  disabled={saving}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty or 0 for auto-assignment
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive" className="text-sm font-medium">Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Category Image</h3>
              
              <div className="space-y-2">
                <Label htmlFor="category_image">Category Image</Label>
                <Input
                  id="category_image"
                  name="category_image"
                  type="file"
                  accept="image/*"
                  disabled={saving}
                  onChange={handleImageChange}
                />
                {(imagePreview || category?.image) && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      {imagePreview ? 'New Image Preview:' : 'Current Image:'}
                    </p>
                    <img 
                      src={imagePreview || category?.image} 
                      alt="Category preview"
                      className="w-40 h-24 object-cover rounded border shadow-sm"
                      onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                    />
                  </div>
                )}
              </div>

              {category?.image && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
                  <img 
                    src={category.image} 
                    alt="Current category"
                    className="w-40 h-24 object-cover rounded border shadow-sm"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="transition-all duration-200"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="transition-all duration-200 hover:bg-blue-600 min-w-[140px]"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {category ? 'Update Category' : 'Create Category'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
