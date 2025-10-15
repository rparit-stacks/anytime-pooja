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

interface Product {
  id?: string
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  originalPrice: number
  category: string
  category_id?: string
  badge: string
  stockQuantity: number
  weight: number
  dimensions: string
  material: string
  origin: string
  isActive: boolean
  isFeatured: boolean
  image?: string
  gallery?: string[]
}

interface ProductModalProps {
  product?: Product | null
  onClose: () => void
  onSave: () => void
}

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [formData, setFormData] = useState<Product>({
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
  
  const [categories, setCategories] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Update form data when product changes
  useEffect(() => {
    console.log('ProductModal: Product prop changed:', product)
    if (product) {
      const newFormData = {
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        category: product.category_id || product.category || '',
        badge: product.badge || '',
        stockQuantity: product.stockQuantity || 0,
        weight: product.weight || 0,
        dimensions: product.dimensions || '',
        material: product.material || '',
        origin: product.origin || '',
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false
      }
      console.log('ProductModal: Setting form data:', newFormData)
      console.log('ProductModal: Product data received:', {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category_id: product.category_id,
        category: product.category,
        price: product.price,
        description: product.description
      })
      setFormData(newFormData)
      setImagePreview(null)
      setGalleryPreviews([])
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
      setImagePreview(null)
      setGalleryPreviews([])
    }
  }, [product])

  const fetchCategories = async () => {
    try {
      console.log('ProductModal: Fetching categories...')
      const response = await fetch('/api/admin/categories')
      const data = await response.json()
      console.log('ProductModal: Categories fetched:', data.categories?.length, data.categories)
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

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
      slug: product ? prev.slug : generateSlug(name)
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
    if (files.length > 0) {
      const readers = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      })
      
      Promise.all(readers).then(previews => {
        setGalleryPreviews(previews)
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Product name is required')
      setSaving(false)
      return
    }
    
    if (!formData.category) {
      toast.error('Please select a category')
      setSaving(false)
      return
    }
    
    if (!formData.price || formData.price <= 0) {
      toast.error('Please enter a valid price')
      setSaving(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      
      // Add all form data
      formDataToSend.append('name', formData.name)
      formDataToSend.append('slug', formData.slug)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('short_description', formData.shortDescription)
      formDataToSend.append('price', formData.price.toString())
      formDataToSend.append('original_price', formData.originalPrice.toString())
      formDataToSend.append('category_id', formData.category)
      formDataToSend.append('badge', formData.badge)
      formDataToSend.append('stock_quantity', formData.stockQuantity.toString())
      formDataToSend.append('weight', formData.weight.toString())
      formDataToSend.append('dimensions', formData.dimensions)
      formDataToSend.append('material', formData.material)
      formDataToSend.append('origin', formData.origin)
      formDataToSend.append('is_active', formData.isActive.toString())
      formDataToSend.append('is_featured', formData.isFeatured.toString())

      // Handle main image upload
      const imageInput = document.getElementById('product_image') as HTMLInputElement
      if (imageInput?.files?.[0]) {
        formDataToSend.append('product_image', imageInput.files[0])
      }

      // Handle gallery images upload
      const galleryInput = document.getElementById('gallery_images') as HTMLInputElement
      if (galleryInput?.files) {
        Array.from(galleryInput.files).forEach(file => {
          formDataToSend.append('gallery_images', file)
        })
      }

      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: formDataToSend
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(product ? 'Product updated successfully!' : 'Product created successfully!')
        onSave()
      } else {
        if (result.code === 'DUPLICATE_NAME') {
          toast.error('Product with this name already exists. Please choose a different name.')
        } else if (result.code === 'DUPLICATE_SLUG') {
          toast.error('Product with this slug already exists. Please choose a different slug.')
        } else if (result.code === 'MISSING_CATEGORY') {
          toast.error('Please select a category.')
        } else if (result.code === 'MISSING_NAME') {
          toast.error('Product name is required.')
        } else if (result.code === 'INVALID_PRICE') {
          toast.error('Please enter a valid price.')
        } else {
          toast.error(result.error || 'Failed to save product')
        }
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
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
                <Label htmlFor="shortDescription" className="text-sm font-medium">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="Brief description of the product"
                  disabled={saving}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the product"
                  disabled={saving}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Pricing & Inventory</h3>
              
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  disabled={saving}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice" className="text-sm font-medium">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={saving}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity" className="text-sm font-medium">Stock Quantity</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={formData.stockQuantity || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                  disabled={saving}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge" className="text-sm font-medium">Badge</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                  placeholder="e.g., New, Sale, Limited"
                  disabled={saving}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive" className="text-sm font-medium">Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isFeatured" className="text-sm font-medium">Featured</Label>
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Product Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-sm font-medium">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={saving}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions" className="text-sm font-medium">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions}
                  onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                  placeholder="e.g., 10x10x5 cm"
                  disabled={saving}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="material" className="text-sm font-medium">Material</Label>
                <Input
                  id="material"
                  value={formData.material}
                  onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                  placeholder="e.g., Brass, Wood"
                  disabled={saving}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin" className="text-sm font-medium">Origin</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                placeholder="e.g., India, Varanasi"
                disabled={saving}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Images</h3>
            
            <div className="space-y-2">
              <Label htmlFor="product_image">Product Image *</Label>
              <Input
                id="product_image"
                name="product_image"
                type="file"
                accept="image/*"
                required={!product}
                disabled={saving}
                onChange={handleImageChange}
              />
              {(imagePreview || product?.image) && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    {imagePreview ? 'New Image Preview:' : 'Current Image:'}
                  </p>
                  <img 
                    src={imagePreview || product?.image} 
                    alt="Product preview"
                    className="w-32 h-20 object-cover rounded border"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
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
              {(galleryPreviews.length > 0 || (product?.gallery && product.gallery.length > 0)) && (
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
                      product?.gallery?.map((img: string, index: number) => (
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
                  {product ? 'Update Product' : 'Create Product'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
