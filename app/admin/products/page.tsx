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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Edit, Trash2, Plus, Search, Eye, Check, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Product Form Component
interface ProductFormProps {
  onSave: (data: Partial<Product>) => void
  onCancel: () => void
  saving: boolean
  generateSlug: (name: string) => string
  editingProduct?: Product | null
  categories: any[]
}

function ProductForm({ onSave, onCancel, saving, generateSlug, editingProduct, categories }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: editingProduct?.name || '',
    slug: editingProduct?.slug || '',
    description: editingProduct?.description || '',
    shortDescription: editingProduct?.shortDescription || '',
    price: editingProduct?.price || 0,
    originalPrice: editingProduct?.originalPrice || 0,
    category: editingProduct?.category || '',
    badge: editingProduct?.badge || '',
    stockQuantity: editingProduct?.stockQuantity || 0,
    weight: editingProduct?.weight || 0,
    dimensions: editingProduct?.dimensions || '',
    material: editingProduct?.material || '',
    origin: editingProduct?.origin || '',
    isActive: editingProduct?.isActive ?? true,
    isFeatured: editingProduct?.isFeatured ?? false
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])

  // Update form data when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        slug: editingProduct.slug || '',
        description: editingProduct.description || '',
        shortDescription: editingProduct.shortDescription || '',
        price: editingProduct.price || 0,
        originalPrice: editingProduct.originalPrice || 0,
        category: editingProduct.category_id?.toString() || editingProduct.category || '',
        badge: editingProduct.badge || '',
        stockQuantity: editingProduct.stockQuantity || 0,
        weight: editingProduct.weight || 0,
        dimensions: editingProduct.dimensions || '',
        material: editingProduct.material || '',
        origin: editingProduct.origin || '',
        isActive: editingProduct.isActive ?? true,
        isFeatured: editingProduct.isFeatured ?? false
      })
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        shortDescription: '',
        price: 0,
        originalPrice: 0,
        category: '',
        badge: '',
        stockQuantity: 0,
        weight: 0,
        dimensions: '',
        material: '',
        origin: '',
        isActive: true,
        isFeatured: false
      })
    }
  }, [editingProduct])

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingProduct ? prev.slug : generateSlug(name) // Only auto-generate for new products
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

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const previews: string[] = []
    
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        previews.push(e.target?.result as string)
        if (previews.length === files.length) {
          setGalleryPreviews(previews)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter product name"
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
            placeholder="product-slug"
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
          placeholder="Enter product description"
          disabled={saving}
          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDescription" className="text-sm font-medium">Short Description</Label>
        <Input
          id="shortDescription"
          value={formData.shortDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
          placeholder="Enter short description"
          disabled={saving}
          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            required
            disabled={saving}
            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="originalPrice" className="text-sm font-medium">Original Price</Label>
          <Input
            id="originalPrice"
            type="number"
            step="0.01"
            value={formData.originalPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            disabled={saving}
            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stockQuantity" className="text-sm font-medium">Stock Quantity</Label>
          <Input
            id="stockQuantity"
            type="number"
            value={formData.stockQuantity}
            onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
            placeholder="0"
            disabled={saving}
            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            required
            disabled={saving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="badge" className="text-sm font-medium">Badge</Label>
          <Input
            id="badge"
            value={formData.badge}
            onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
            placeholder="e.g., New, Sale, Featured"
            disabled={saving}
            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.01"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
            placeholder="0.00"
            disabled={saving}
          />
        </div>
        <div>
          <Label htmlFor="dimensions">Dimensions</Label>
          <Input
            id="dimensions"
            value={formData.dimensions}
            onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
            placeholder="e.g., 10x10x5 cm"
            disabled={saving}
          />
        </div>
        <div>
          <Label htmlFor="material">Material</Label>
          <Input
            id="material"
            value={formData.material}
            onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
            placeholder="e.g., Brass, Wood"
            disabled={saving}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="origin">Origin</Label>
        <Input
          id="origin"
          value={formData.origin}
          onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
          placeholder="e.g., India, China"
          disabled={saving}
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            disabled={saving}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isFeatured"
            checked={formData.isFeatured}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
            disabled={saving}
          />
          <Label htmlFor="isFeatured">Featured</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="product_image">Product Image *</Label>
        <Input
          id="product_image"
          name="product_image"
          type="file"
          accept="image/*"
          required={!editingProduct}
          disabled={saving}
          onChange={handleImageChange}
        />
        {(imagePreview || editingProduct?.image) && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">
              {imagePreview ? 'New Image Preview:' : 'Current Image:'}
            </p>
            <img 
              src={imagePreview || editingProduct?.image} 
              alt="Product preview"
              className="w-32 h-20 object-cover rounded border"
              onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="gallery_images">Gallery Images (Multiple)</Label>
        <Input
          id="gallery_images"
          name="gallery_images"
          type="file"
          accept="image/*"
          multiple
          disabled={saving}
          onChange={handleGalleryChange}
        />
        {(galleryPreviews.length > 0 || (editingProduct?.gallery && editingProduct.gallery.length > 0)) && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">
              {galleryPreviews.length > 0 ? 'New Gallery Preview:' : 'Current Gallery:'}
            </p>
            <div className="flex gap-2 flex-wrap">
              {galleryPreviews.length > 0 ? (
                galleryPreviews.map((preview, index) => (
                  <img 
                    key={`new-${index}`}
                    src={preview} 
                    alt={`New gallery ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                  />
                ))
              ) : (
                editingProduct?.gallery?.map((img: string, index: number) => (
                  <img 
                    key={`current-${index}`}
                    src={img} 
                    alt={`Gallery ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                  />
                ))
              )}
            </div>
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
              <Check className="h-4 w-4 mr-2" />
              {editingProduct ? 'Update Product' : 'Create Product'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  price: number
  originalPrice?: number
  image: string
  gallery?: string[]
  category: string
  category_id?: number
  stockQuantity?: number
  weight?: number
  dimensions?: string
  material?: string
  origin?: string
  rating: number
  reviews: number
  badge?: string
  isActive: boolean
  isFeatured?: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
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
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

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
      formData.append('slug', productData.slug || '')
      formData.append('description', productData.description || '')
      formData.append('short_description', productData.shortDescription || '')
      formData.append('price', (productData.price || 0).toString())
      formData.append('original_price', (productData.originalPrice || 0).toString())
      formData.append('category_id', productData.category || '')
      formData.append('badge', productData.badge || '')
      formData.append('stock_quantity', (productData.stockQuantity || 0).toString())
      formData.append('weight', (productData.weight || 0).toString())
      formData.append('dimensions', productData.dimensions || '')
      formData.append('material', productData.material || '')
      formData.append('origin', productData.origin || '')
      formData.append('is_active', (productData.isActive ?? true).toString())
      formData.append('is_featured', (productData.isFeatured ?? false).toString())

      // Handle main image upload
      const productImage = document.getElementById('product_image') as HTMLInputElement
      if (productImage?.files?.[0]) {
        formData.append('image', productImage.files[0])
      }

      // Handle gallery images
      const galleryImages = document.getElementById('gallery_images') as HTMLInputElement
      if (galleryImages?.files) {
        for (let i = 0; i < galleryImages.files.length; i++) {
          formData.append('gallery', galleryImages.files[i])
        }
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
        toast.success(editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
        await fetchProducts()
        setEditingProduct(null)
        setShowAddForm(false)
        // Reset form
        if (productImage) {
          productImage.value = ''
        }
        if (galleryImages) {
          galleryImages.value = ''
        }
      } else {
        const errorData = await response.json()
        if (errorData.code === 'DUPLICATE_NAME') {
          toast.error('Product with this name already exists. Please choose a different name.')
        } else if (errorData.code === 'DUPLICATE_SLUG') {
          toast.error('Product with this slug already exists. Please choose a different slug.')
        } else if (errorData.code === 'MISSING_CATEGORY') {
          toast.error('Please select a category for the product.')
        } else if (errorData.code === 'MISSING_NAME') {
          toast.error('Product name is required.')
        } else if (errorData.code === 'INVALID_PRICE') {
          toast.error('Please enter a valid price greater than 0.')
        } else {
          toast.error(errorData.error || 'Failed to save product')
        }
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
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Add New Product</DialogTitle>
                  </DialogHeader>
                  <ProductForm 
                    onSave={handleSave}
                    onCancel={() => setShowAddForm(false)}
                    saving={saving}
                    generateSlug={generateSlug}
                    categories={categories}
                  />
                </DialogContent>
              </Dialog>
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-semibold">Edit Product</DialogTitle>
                              </DialogHeader>
                              <ProductForm 
                                onSave={handleSave}
                                onCancel={() => setEditingProduct(null)}
                                saving={saving}
                                generateSlug={generateSlug}
                                editingProduct={product}
                                categories={categories}
                              />
                            </DialogContent>
                          </Dialog>
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

    </div>
  )
}
