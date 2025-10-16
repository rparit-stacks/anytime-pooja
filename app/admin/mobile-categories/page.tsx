"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"
import { toast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Eye, ArrowUp, ArrowDown, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import { uploadFile } from "@/lib/api-utils"

interface MobileCategory {
  mobile_category_id: number
  sort_order: number
  mobile_category_active: boolean
  mobile_category_created_at: string
  mobile_category_image: string
  category_id: number
  category_name: string
  category_slug: string
  category_image: string
  category_active: boolean
}

interface Category {
  id: number
  name: string
  slug: string
  image: string
  is_active: boolean
}

export default function MobileCategoriesPage() {
  const [mobileCategories, setMobileCategories] = useState<MobileCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<MobileCategory | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    category_id: '',
    sort_order: 0,
    is_active: true,
    mobile_category_image: ''
  })
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch mobile categories
      const mobileCategoriesResponse = await fetch('/api/admin/mobile-categories')
      const mobileCategoriesData = await mobileCategoriesResponse.json()
      
      if (mobileCategoriesData.success) {
        setMobileCategories(mobileCategoriesData.categories)
      }

      // Fetch all categories for dropdown
      const categoriesResponse = await fetch('/api/categories')
      const categoriesData = await categoriesResponse.json()
      
      console.log('Categories response:', categoriesData)
      
      if (categoriesData.success && categoriesData.categories) {
        setCategories(categoriesData.categories)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.category_id) {
      errors.category_id = 'Please select a category'
    }
    
    if (formData.sort_order < 0) {
      errors.sort_order = 'Sort order must be 0 or greater'
    }
    
    if (!formData.mobile_category_image) {
      errors.mobile_category_image = 'Please upload an image'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      setFormErrors({})
      
      const url = editingCategory 
        ? `/api/admin/mobile-categories/${editingCategory.mobile_category_id}`
        : '/api/admin/mobile-categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const requestBody = {
        category_id: parseInt(formData.category_id),
        sort_order: parseInt(formData.sort_order.toString()),
        is_active: formData.is_active,
        mobile_category_image: formData.mobile_category_image
      }
      
      console.log('Submitting:', requestBody)
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      const data = await response.json()
      console.log('Response:', data)
      
      if (data.success) {
        toast({
          title: "Success",
          description: editingCategory ? "Mobile category updated successfully" : "Mobile category created successfully"
        })
        setIsDialogOpen(false)
        setEditingCategory(null)
        setFormData({
          category_id: '',
          sort_order: 0,
          is_active: true,
          mobile_category_image: ''
        })
        setFormErrors({})
        await fetchData()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save mobile category",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving mobile category:', error)
      toast({
        title: "Error",
        description: "Failed to save mobile category",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (category: MobileCategory) => {
    setEditingCategory(category)
    setFormData({
      category_id: category.category_id.toString(),
      sort_order: category.sort_order,
      is_active: category.mobile_category_active,
      mobile_category_image: category.mobile_category_image || ''
    })
    setFormErrors({})
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this mobile category?')) {
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch(`/api/admin/mobile-categories/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Mobile category deleted successfully"
        })
        await fetchData()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete mobile category",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting mobile category:', error)
      toast({
        title: "Error",
        description: "Failed to delete mobile category",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 20
        })
      }, 200)

      const url = await uploadFile(file, 'mobile-categories')
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setFormData(prev => ({ ...prev, mobile_category_image: url }))
      
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 1000)
      
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      setIsUploading(false)
      setUploadProgress(0)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      })
    }
  }

  const handleSortOrderChange = async (id: number, newSortOrder: number) => {
    try {
      const response = await fetch(`/api/admin/mobile-categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sort_order: newSortOrder })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchData()
      }
    } catch (error) {
      console.error('Error updating sort order:', error)
    }
  }

  if (loading && mobileCategories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mobile Categories</h1>
          <p className="text-muted-foreground">
            Manage categories displayed in mobile marquee
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null)
              setFormData({
                category_id: '',
                sort_order: 0,
                is_active: true,
                mobile_category_image: ''
              })
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Mobile Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Mobile Category' : 'Add Mobile Category'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category_id">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, category_id: value }))
                    if (formErrors.category_id) {
                      setFormErrors(prev => ({ ...prev, category_id: '' }))
                    }
                  }}
                  disabled={!!editingCategory}
                >
                  <SelectTrigger className={formErrors.category_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(cat => !mobileCategories.some(mc => mc.category_id === cat.id && mc.mobile_category_id !== editingCategory?.mobile_category_id))
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <img 
                              src={category.image || "/placeholder.jpg"} 
                              alt={category.name}
                              className="w-6 h-6 rounded object-cover"
                            />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formErrors.category_id && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.category_id}</p>
                )}
                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">No categories available. Create categories first.</p>
                )}
              </div>

              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    setFormData(prev => ({ ...prev, sort_order: value }))
                    if (formErrors.sort_order) {
                      setFormErrors(prev => ({ ...prev, sort_order: '' }))
                    }
                  }}
                  placeholder="0"
                  className={formErrors.sort_order ? 'border-red-500' : ''}
                />
                {formErrors.sort_order && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.sort_order}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
              </div>

              <div>
                <Label htmlFor="mobile_category_image">Mobile Category Image *</Label>
                <FileUpload
                  onFileSelect={handleImageUpload}
                  accept="image/*"
                  maxSize={5 * 1024 * 1024} // 5MB
                  disabled={isUploading}
                />
                {formErrors.mobile_category_image && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.mobile_category_image}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Recommended: 64x64px, max 5MB</p>
                
                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Upload className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Uploading...</span>
                      <span className="text-sm font-medium">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Image Preview */}
                {formData.mobile_category_image && !isUploading && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-muted-foreground">Preview:</p>
                    <div className="flex items-center space-x-4">
                      <img
                        src={formData.mobile_category_image}
                        alt="Preview"
                        className="w-16 h-16 rounded-xl object-cover border-2 border-border/20 shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.jpg"
                        }}
                      />
                      <div>
                        <p className="text-xs text-muted-foreground">Mobile Category Image</p>
                        <p className="text-xs text-green-600">✓ Image uploaded successfully</p>
                        <p className="text-xs text-blue-600 break-all">{formData.mobile_category_image}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <p className="text-xs text-muted-foreground">Only active categories will be shown in mobile marquee</p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setFormErrors({})
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isUploading}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingCategory ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingCategory ? 'Update' : 'Create'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {mobileCategories.map((category) => (
          <Card key={category.mobile_category_id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Mobile Category Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted border-2 border-border/20 shadow-sm">
                    <img
                      src={category.mobile_category_image || category.category_image || "/placeholder.jpg"}
                      alt={category.category_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">{category.category_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Sort Order: {category.sort_order}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={category.mobile_category_active ? "default" : "secondary"}>
                        {category.mobile_category_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Sort Order Controls */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSortOrderChange(category.mobile_category_id, category.sort_order - 1)}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSortOrderChange(category.mobile_category_id, category.sort_order + 1)}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>

                  {/* Action Buttons */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(category)}
                    title="Edit mobile category"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(category.mobile_category_id)}
                    title="Delete mobile category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mobileCategories.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No mobile categories found</p>
        </div>
      )}
    </div>
  )
}
