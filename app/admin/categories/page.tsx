"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faEdit, faTrash, faEye, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"

// Category Form Component
interface CategoryFormProps {
  onSave: (data: Partial<Category>) => void
  onCancel: () => void
  saving: boolean
  generateSlug: (name: string) => string
  editingCategory?: Category | null
}

function CategoryForm({ onSave, onCancel, saving, generateSlug, editingCategory }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: editingCategory?.name || '',
    slug: editingCategory?.slug || '',
    description: editingCategory?.description || '',
    sortOrder: editingCategory?.sortOrder || 0, // 0 means auto-assign
    isActive: editingCategory?.isActive ?? true
  })

  // Update form data when editingCategory changes
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || '',
        slug: editingCategory.slug || '',
        description: editingCategory.description || '',
        sortOrder: editingCategory.sortOrder || 0,
        isActive: editingCategory.isActive ?? true
      })
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        sortOrder: 0,
        isActive: true
      })
    }
  }, [editingCategory])

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name) // Only auto-generate for new categories
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter category description"
          disabled={saving}
          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sortOrder" className="text-sm font-medium">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
            placeholder={editingCategory ? "Current: " + editingCategory.sortOrder : "Auto-assign"}
            min="0"
            disabled={saving}
            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty or 0 for auto-assignment
          </p>
        </div>
        <div className="flex items-center space-x-3 pt-6">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            disabled={saving}
            className="transition-all duration-200"
          />
          <Label htmlFor="isActive" className="text-sm font-medium">Active Status</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category_image" className="text-sm font-medium">Category Image</Label>
        <Input
          id="category_image"
          name="category_image"
          type="file"
          accept="image/*"
          disabled={saving}
          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
        />
        {editingCategory?.image && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
            <img 
              src={editingCategory.image} 
              alt="Current category"
              className="w-40 h-24 object-cover rounded border shadow-sm"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={saving}
          className="transition-all duration-200 hover:bg-gray-50"
        >
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
              <FontAwesomeIcon icon={faCheck} className="h-4 w-4 mr-2" />
              {editingCategory ? 'Update Category' : 'Create Category'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  sortOrder: number
  isActive: boolean
  productCount: number
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId))
        alert('Category deleted successfully')
      } else {
        alert('Failed to delete category')
      }
    } catch (err) {
      alert('Failed to delete category')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(categories.map(cat => cat.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, categoryId])
    } else {
      setSelectedItems(prev => prev.filter(id => id !== categoryId))
    }
  }

  const handleSave = async (categoryData: Partial<Category>) => {
    setSaving(true)
    try {
      const formData = new FormData()
      
      // Add all form data
      formData.append('name', categoryData.name || '')
      formData.append('slug', categoryData.slug || '')
      formData.append('description', categoryData.description || '')
      formData.append('sortOrder', (categoryData.sortOrder || 0).toString())
      formData.append('isActive', (categoryData.isActive ?? true).toString())

      // Handle image upload
      const categoryImage = document.getElementById('category_image') as HTMLInputElement
      if (categoryImage?.files?.[0]) {
        formData.append('image', categoryImage.files[0])
      }

      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData
      })

      if (response.ok) {
        toast.success(editingCategory ? 'Category updated successfully!' : 'Category created successfully!')
        await fetchCategories()
        setEditingCategory(null)
        setShowAddForm(false)
        // Reset form
        if (categoryImage) {
          categoryImage.value = ''
        }
      } else {
        const errorData = await response.json()
        if (errorData.code === 'DUPLICATE_NAME') {
          toast.error('Category with this name already exists. Please choose a different name.')
        } else if (errorData.code === 'DUPLICATE_SLUG') {
          toast.error('Category with this slug already exists. Please choose a different slug.')
        } else {
          toast.error(errorData.error || 'Failed to save category')
        }
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkActivate = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to activate')
      return
    }

    setBulkActionLoading(true)
    try {
      const promises = selectedItems.map(id => 
        fetch(`/api/admin/categories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: true })
        })
      )

      await Promise.all(promises)
      setCategories(prev => prev.map(cat => 
        selectedItems.includes(cat.id) ? { ...cat, isActive: true } : cat
      ))
      setSelectedItems([])
      alert(`${selectedItems.length} categories activated successfully`)
    } catch (err) {
      alert('Failed to activate categories')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to deactivate')
      return
    }

    setBulkActionLoading(true)
    try {
      const promises = selectedItems.map(id => 
        fetch(`/api/admin/categories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false })
        })
      )

      await Promise.all(promises)
      setCategories(prev => prev.map(cat => 
        selectedItems.includes(cat.id) ? { ...cat, isActive: false } : cat
      ))
      setSelectedItems([])
      alert(`${selectedItems.length} categories deactivated successfully`)
    } catch (err) {
      alert('Failed to deactivate categories')
    } finally {
      setBulkActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">Loading categories...</div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchCategories}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-balance">
                Category Management
              </h1>
              <p className="text-muted-foreground">
                Manage product categories and their settings
              </p>
            </div>
            <div className="flex gap-2">
              {selectedItems.length > 0 && (
                <>
                  <Button 
                    onClick={handleBulkActivate}
                    disabled={bulkActionLoading}
                    variant="outline"
                    size="sm"
                  >
                    <FontAwesomeIcon icon={faCheck} className="mr-2 h-4 w-4" />
                    Activate ({selectedItems.length})
                  </Button>
                  <Button 
                    onClick={handleBulkDeactivate}
                    disabled={bulkActionLoading}
                    variant="outline"
                    size="sm"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2 h-4 w-4" />
                    Deactivate ({selectedItems.length})
                  </Button>
                </>
              )}
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button>
                    <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                    Add New Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Add New Category</DialogTitle>
                  </DialogHeader>
                  <CategoryForm 
                    onSave={handleSave}
                    onCancel={() => setShowAddForm(false)}
                    saving={saving}
                    generateSlug={generateSlug}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedItems.length === categories.length && categories.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(category.id)}
                          onCheckedChange={(checked) => handleSelectItem(category.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-16 h-16 relative">
                          <img 
                            src={category.image || "/placeholder.svg"} 
                            alt={category.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {category.description}
                      </TableCell>
                      <TableCell>{category.sortOrder}</TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {category.productCount || 0} products
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-semibold">Edit Category</DialogTitle>
                              </DialogHeader>
                              <CategoryForm 
                                onSave={handleSave}
                                onCancel={() => setEditingCategory(null)}
                                saving={saving}
                                generateSlug={generateSlug}
                                editingCategory={category}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

    </div>
  )
}
