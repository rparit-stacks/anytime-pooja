"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Edit, Trash2, Plus, Search, Eye, Check, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  category: string
  badge?: string
  isActive: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredProducts.map(product => product.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, productId])
    } else {
      setSelectedItems(prev => prev.filter(id => id !== productId))
    }
  }

  const handleSave = async (productData: Partial<Product>) => {
    setSaving(true)
    try {
      const formData = new FormData()
      
      // Add all form data
      formData.append('name', productData.name || '')
      formData.append('price', (productData.price || 0).toString())
      formData.append('originalPrice', (productData.originalPrice || 0).toString())
      formData.append('category', productData.category || '')
      formData.append('badge', productData.badge || '')
      formData.append('isActive', (productData.isActive ?? true).toString())

      // Handle image upload
      const productImage = document.getElementById('product_image') as HTMLInputElement
      if (productImage?.files?.[0]) {
        formData.append('image', productImage.files[0])
      }

      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products'
      
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formData
      })

      if (response.ok) {
        alert(editingProduct ? 'Product updated successfully' : 'Product created successfully')
        await fetchProducts()
        setEditingProduct(null)
        setShowAddForm(false)
        // Reset form
        if (productImage) {
          productImage.value = ''
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to save product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
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
        fetch(`/api/admin/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: true })
        })
      )

      await Promise.all(promises)
      setProducts(prev => prev.map(product => 
        selectedItems.includes(product.id) ? { ...product, isActive: true } : product
      ))
      setSelectedItems([])
      alert(`${selectedItems.length} products activated successfully`)
    } catch (err) {
      alert('Failed to activate products')
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
        fetch(`/api/admin/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false })
        })
      )

      await Promise.all(promises)
      setProducts(prev => prev.map(product => 
        selectedItems.includes(product.id) ? { ...product, isActive: false } : product
      ))
      setSelectedItems([])
      alert(`${selectedItems.length} products deactivated successfully`)
    } catch (err) {
      alert('Failed to deactivate products')
    } finally {
      setBulkActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">Loading products...</div>
    )
  }

  return (
    <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-balance">
                Product Management
              </h1>
              <p className="text-muted-foreground">
                Manage your astrology products
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
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Activate ({selectedItems.length})
                  </Button>
                  <Button 
                    onClick={handleBulkDeactivate}
                    disabled={bulkActionLoading}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Deactivate ({selectedItems.length})
                  </Button>
                </>
              )}
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {showAddForm ? 'Cancel' : 'Add Product'}
              </Button>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedItems.length === filteredProducts.length && filteredProducts.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(product.id)}
                          onCheckedChange={(checked) => handleSelectItem(product.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-16 h-16 relative">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {product.badge}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatPrice(product.price)}</div>
                          {product.originalPrice && (
                            <div className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.originalPrice)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">⭐ {product.rating}</span>
                          <span className="text-xs text-muted-foreground">
                            ({product.reviews})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/products/${product.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
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

        {/* Add/Edit Product Form */}
        {(showAddForm || editingProduct) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingProduct(null)
                    setShowAddForm(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                
                const productData = {
                  name: formData.get('name') as string,
                  price: parseFloat(formData.get('price') as string) || 0,
                  originalPrice: parseFloat(formData.get('originalPrice') as string) || 0,
                  category: formData.get('category') as string,
                  badge: formData.get('badge') as string,
                  isActive: formData.get('isActive') === 'on'
                }
                
                handleSave(productData)
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingProduct?.name || ''}
                      placeholder="Enter product name"
                      required
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      defaultValue={editingProduct?.category || ''}
                      placeholder="Enter category"
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.price || ''}
                      placeholder="0.00"
                      required
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                    <Input
                      id="originalPrice"
                      name="originalPrice"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.originalPrice || ''}
                      placeholder="0.00"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="badge">Badge (Optional)</Label>
                    <Input
                      id="badge"
                      name="badge"
                      defaultValue={editingProduct?.badge || ''}
                      placeholder="e.g., New, Sale, Featured"
                      disabled={saving}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      name="isActive"
                      defaultChecked={editingProduct?.isActive ?? true}
                      disabled={saving}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="product_image">Product Image</Label>
                  <Input
                    id="product_image"
                    name="product_image"
                    type="file"
                    accept="image/*"
                    disabled={saving}
                  />
                  {editingProduct?.image && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
                      <img 
                        src={editingProduct.image} 
                        alt="Current product"
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
                  <Check className="h-4 w-4 mr-2" />
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
