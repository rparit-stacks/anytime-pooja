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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faEdit, faTrash, faEye, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"

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
      formData.append('sortOrder', (categoryData.sortOrder || 1).toString())
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
        alert(editingCategory ? 'Category updated successfully' : 'Category created successfully')
        await fetchCategories()
        setEditingCategory(null)
        setShowAddForm(false)
        // Reset form
        if (categoryImage) {
          categoryImage.value = ''
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to save category')
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
              <Button onClick={() => setShowAddForm(!showAddForm)}>
                <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                {showAddForm ? 'Cancel' : 'Add New Category'}
              </Button>
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
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingCategory(category)}
                          >
                            <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                          </Button>
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

        {/* Add/Edit Category Form */}
        {(showAddForm || editingCategory) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingCategory(null)
                    setShowAddForm(false)
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                
                const categoryData = {
                  name: formData.get('name') as string,
                  slug: formData.get('slug') as string,
                  description: formData.get('description') as string,
                  sortOrder: parseInt(formData.get('sortOrder') as string) || 1,
                  isActive: formData.get('isActive') === 'on'
                }
                
                handleSave(categoryData)
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingCategory?.name || ''}
                      placeholder="Enter category name"
                      required
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      name="slug"
                      defaultValue={editingCategory?.slug || ''}
                      placeholder="category-slug"
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingCategory?.description || ''}
                    placeholder="Enter category description"
                    disabled={saving}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      name="sortOrder"
                      type="number"
                      defaultValue={editingCategory?.sortOrder || 1}
                      min="1"
                      disabled={saving}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      name="isActive"
                      defaultChecked={editingCategory?.isActive ?? true}
                      disabled={saving}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="category_image">Category Image</Label>
                  <Input
                    id="category_image"
                    name="category_image"
                    type="file"
                    accept="image/*"
                    disabled={saving}
                  />
                  {editingCategory?.image && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
                      <img 
                        src={editingCategory.image} 
                        alt="Current category"
                        className="w-32 h-20 object-cover rounded border"
                        onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                      />
                    </div>
                  )}
                </div>

                <Button 
                  type="submit"
                  disabled={saving} 
                  className="w-full"
                >
                  <FontAwesomeIcon icon={faCheck} className="h-4 w-4 mr-2" />
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
