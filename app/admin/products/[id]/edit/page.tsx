"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { LoadingCard, LoadingOverlay, LoadingSpinner } from "@/components/ui/loading"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faArrowLeft, 
  faSave, 
  faUpload, 
  faEdit,
  faTrash,
  faEye,
  faCheck,
  faTimes
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  originalPrice?: number
  image: string
  categoryId: string
  stockQuantity: number
  isActive: boolean
  isFeatured: boolean
  rating: number
  reviewCount: number
  badge?: string
  material?: string
  origin?: string
  weight?: number
  dimensions?: string
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    price: "",
    originalPrice: "",
    categoryId: "",
    stockQuantity: "",
    isActive: true,
    isFeatured: false,
    rating: "0",
    reviewCount: "0",
    badge: "",
    material: "",
    origin: "",
    weight: "",
    dimensions: "",
    image: null as File | null,
    gallery: [] as File[]
  })

  useEffect(() => {
    if (productId) {
      fetchData()
    }
  }, [productId])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch categories
      const categoriesResponse = await fetch('/api/admin/categories')
      const categoriesData = await categoriesResponse.json()
      setCategories(categoriesData.categories || [])

      // Fetch product details
      const productResponse = await fetch(`/api/admin/products/${productId}`)
      if (!productResponse.ok) {
        throw new Error('Product not found')
      }
      const productData = await productResponse.json()
      const productInfo = productData.product

      setProduct(productInfo)
      setFormData({
        name: productInfo.name || "",
        slug: productInfo.slug || "",
        description: productInfo.description || "",
        shortDescription: productInfo.shortDescription || "",
        price: productInfo.price?.toString() || "",
        originalPrice: productInfo.originalPrice?.toString() || "",
        categoryId: productInfo.categoryId || "",
        stockQuantity: productInfo.stockQuantity?.toString() || "",
        isActive: productInfo.isActive ?? true,
        isFeatured: productInfo.isFeatured ?? false,
        rating: productInfo.rating?.toString() || "0",
        reviewCount: productInfo.reviewCount?.toString() || "0",
        badge: productInfo.badge || "",
        material: productInfo.material || "",
        origin: productInfo.origin || "",
        weight: productInfo.weight?.toString() || "",
        dimensions: productInfo.dimensions || "",
        image: null
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product')
      console.error('Error fetching data:', err)
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

  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...fileArray]
      }))
    }
  }

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const formDataToSend = new FormData()
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'image' && key !== 'gallery' && value !== null) {
          formDataToSend.append(key, value.toString())
        }
      })

      // Add main image if selected
      if (formData.image) {
        formDataToSend.append('image', formData.image)
      }

      // Add gallery images
      formData.gallery.forEach((file, index) => {
        formDataToSend.append('gallery', file)
      })

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        body: formDataToSend
      })

      if (response.ok) {
        setSuccess('Product updated successfully')
        setTimeout(() => {
          router.push('/admin/products')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update product')
      }
    } catch (err) {
      setError('Failed to update product')
      console.error('Error updating product:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('Product deleted successfully')
        setTimeout(() => {
          router.push('/admin/products')
        }, 2000)
      } else {
        setError('Failed to delete product')
      }
    } catch (err) {
      setError('Failed to delete product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <LoadingCard text="Loading product details..." />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link href="/admin/products">
          <Button>
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {saving && <LoadingOverlay text="Saving changes..." />}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/products">
              <Button variant="ghost" size="sm">
                <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-balance">
                Edit Product
              </h1>
              <p className="text-muted-foreground">
                Update product information and settings
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/products/${productId}`}>
                <Button variant="outline" size="sm">
                  <FontAwesomeIcon icon={faEye} className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </Link>
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
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faCheck} className="h-4 w-4" />
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Premium Rose Quartz Crystal"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="e.g., premium-rose-quartz-crystal"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Textarea
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                      placeholder="Brief description for product cards"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Full Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Detailed product description"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="299.99"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice">Original Price (₹)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                        placeholder="399.99"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stockQuantity">Stock Quantity</Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        value={formData.stockQuantity}
                        onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                        placeholder="50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="categoryId">Category *</Label>
                      <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="badge">Badge</Label>
                      <Input
                        id="badge"
                        value={formData.badge}
                        onChange={(e) => handleInputChange('badge', e.target.value)}
                        placeholder="e.g., Trending, Best Seller"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="material">Material</Label>
                      <Input
                        id="material"
                        value={formData.material}
                        onChange={(e) => handleInputChange('material', e.target.value)}
                        placeholder="e.g., Natural Crystal, Brass"
                      />
                    </div>
                    <div>
                      <Label htmlFor="origin">Origin</Label>
                      <Input
                        id="origin"
                        value={formData.origin}
                        onChange={(e) => handleInputChange('origin', e.target.value)}
                        placeholder="e.g., India, Brazil"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight">Weight (g)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        placeholder="100.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Input
                        id="dimensions"
                        value={formData.dimensions}
                        onChange={(e) => handleInputChange('dimensions', e.target.value)}
                        placeholder="e.g., 10x10x5 cm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUpload} className="h-5 w-5" />
                    Product Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {product.image && (
                      <div className="w-full h-48 relative border border-border rounded-lg overflow-hidden">
                        <img 
                          src={product.image} 
                          alt="Current product image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="image">Update Main Image</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mt-2"
                      />
                      {formData.image && (
                        <div className="text-sm text-muted-foreground mt-1">
                          New image selected: {formData.image.name}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="gallery">Add Gallery Images</Label>
                      <Input
                        id="gallery"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Select multiple images to add to the gallery
                      </p>
                    </div>

                    {formData.gallery.length > 0 && (
                      <div className="space-y-2">
                        <Label>New Gallery Images ({formData.gallery.length})</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {formData.gallery.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <span className="text-sm truncate">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeGalleryImage(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isActive">Active</Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isFeatured">Featured/Trending</Label>
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ratings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => handleInputChange('rating', e.target.value)}
                      placeholder="4.8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviewCount">Review Count</Label>
                    <Input
                      id="reviewCount"
                      type="number"
                      value={formData.reviewCount}
                      onChange={(e) => handleInputChange('reviewCount', e.target.value)}
                      placeholder="234"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
                    Update Product
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
    </div>
  )
}
