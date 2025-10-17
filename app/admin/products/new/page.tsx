"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/ui/file-upload"
import { MultiFileUpload } from "@/components/ui/multi-file-upload"
import { 
  ArrowLeft, 
  X, 
  Plus,
  Save,
  Eye,
  Package,
  Image as ImageIcon,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { apiCall, uploadFile } from "@/lib/api-utils"

interface Category {
  id: number
  name: string
}

interface ProductFormData {
  name: string
  slug: string
  description: string
  short_description: string
  price: string
  original_price: string
  category_id: string
  stock_quantity: string
  is_active: boolean
  is_featured: boolean
  badge: string
  weight: string
  dimensions: string
  material: string
  origin: string
  main_image: string
  gallery_images: string[]
}

export default function NewProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [mainImageUploading, setMainImageUploading] = useState(false)
  const [galleryImageUploading, setGalleryImageUploading] = useState(false)
  const [mainImageSuccess, setMainImageSuccess] = useState(false)
  const [galleryImageSuccess, setGalleryImageSuccess] = useState<boolean[]>([])
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: '',
    original_price: '',
    category_id: '',
    stock_quantity: '',
    is_active: true,
    is_featured: false,
    badge: '',
    weight: '',
    dimensions: '',
    material: '',
    origin: '',
    main_image: '',
    gallery_images: []
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = {
      ...prev,
      [field]: value
      }
      
      // Auto-generate slug when name changes
      if (field === 'name' && typeof value === 'string') {
        newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }
      
      return newData
    })
  }

  const handleImageUpload = async (file: File, type: 'main' | 'gallery') => {
    try {
      if (type === 'main') {
        setMainImageUploading(true)
      } else {
        setGalleryImageUploading(true)
      }
      
      const imageUrl = await uploadFile(file, 'product', 'anytime-pooja')
      console.log('Upload response:', imageUrl)
      
      if (type === 'main') {
        setFormData(prev => ({
          ...prev,
          main_image: imageUrl
        }))
        setMainImageSuccess(true)
        setTimeout(() => setMainImageSuccess(false), 2000)
        console.log('Main image set to:', imageUrl)
      } else {
        setFormData(prev => ({
          ...prev,
          gallery_images: [...prev.gallery_images, imageUrl]
        }))
        setGalleryImageSuccess(prev => [...prev, true])
        setTimeout(() => {
          setGalleryImageSuccess(prev => prev.slice(0, -1))
        }, 2000)
        console.log('Gallery image added:', imageUrl)
      }
      
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      })
    } finally {
      if (type === 'main') {
        setMainImageUploading(false)
      } else {
        setGalleryImageUploading(false)
      }
    }
  }

  const handleMultipleImageUpload = async (files: File[]) => {
    if (files.length === 0) return
    
    const remainingSlots = 6 - formData.gallery_images.length
    const filesToUpload = files.slice(0, remainingSlots)
    
    if (filesToUpload.length < files.length) {
      toast({
        title: "Warning",
        description: `Only ${filesToUpload.length} images uploaded. Maximum 6 gallery images allowed.`,
        variant: "destructive"
      })
    }
    
    try {
      setGalleryImageUploading(true)
      
      const uploadPromises = filesToUpload.map(file => 
        uploadFile(file, 'product', 'anytime-pooja')
      )
      
      const imageUrls = await Promise.all(uploadPromises)
      console.log('Multiple upload response:', imageUrls)
      
      setFormData(prev => ({
        ...prev,
        gallery_images: [...prev.gallery_images, ...imageUrls]
      }))
      
      // Set success state for all new images
      setGalleryImageSuccess(prev => [...prev, ...new Array(imageUrls.length).fill(true)])
      setTimeout(() => {
        setGalleryImageSuccess(prev => prev.slice(0, -imageUrls.length))
      }, 2000)
      
      toast({
        title: "Success",
        description: `${imageUrls.length} images uploaded successfully`
      })
    } catch (error) {
      console.error('Error uploading multiple images:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive"
      })
    } finally {
      setGalleryImageUploading(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }))
    setGalleryImageSuccess(prev => prev.filter((_, i) => i !== index))
  }

  const handleFinalSubmit = async () => {
    console.log('=== HANDLE FINAL SUBMIT CALLED ===')
    console.log('Final submit clicked, form data:', formData)
    console.log('Loading state:', loading)
    
    if (!formData.name || !formData.price || !formData.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (!formData.main_image) {
      toast({
        title: "Error",
        description: "Please upload a main image",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      console.log('Starting product creation...')
      
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        short_description: formData.short_description,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        category_id: parseInt(formData.category_id),
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        badge: formData.badge,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions,
        material: formData.material,
        origin: formData.origin,
        image: formData.main_image,
        gallery: formData.gallery_images
      }
      
      console.log('Sending product data:', productData)
      
      const data = await apiCall('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      })
      
      console.log('API response:', data)
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Product created successfully"
        })
        router.push('/admin/products')
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create product",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating product:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Form validation for create button
  const isFormValid = () => {
    return formData.name && 
           formData.slug && 
           formData.description && 
           formData.price && 
           formData.category_id && 
           formData.main_image
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="sm" className="no-transition">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product for your store
          </p>
        </div>
      </div>

      {/* Form Validation Status */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900">Form Status</h3>
            <p className="text-sm text-blue-700">
              {isFormValid() ? '✅ All required fields completed' : '⚠️ Please fill all required fields'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-blue-900">
              {formData.gallery_images.length}/6 Gallery Images
            </p>
            <p className="text-xs text-blue-600">
              {isFormValid() ? 'Ready to create product' : 'Complete required fields to enable create button'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter product name"
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange('category_id', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Product Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="product-slug"
                  required
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly version of the name. Auto-generated from product name.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => handleInputChange('short_description', e.target.value)}
                  placeholder="Brief product description (max 500 characters)"
                  maxLength={500}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.short_description.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter detailed product description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price (₹)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) => handleInputChange('original_price', e.target.value)}
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="badge">Product Badge</Label>
                  <Input
                    id="badge"
                    value={formData.badge}
                    onChange={(e) => handleInputChange('badge', e.target.value)}
                    placeholder="e.g., New, Sale, Limited"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                    <Label htmlFor="active">Product is active</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                    />
                    <Label htmlFor="featured">Featured product</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="0.00"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                    placeholder="e.g., 10x15x5 cm"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={formData.material}
                    onChange={(e) => handleInputChange('material', e.target.value)}
                    placeholder="e.g., Brass, Wood, Stone"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin/Manufacturer</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => handleInputChange('origin', e.target.value)}
                    placeholder="e.g., India, Handmade"
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Images & Actions */}
        <div className="space-y-6">
          {/* Main Image Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Main Product Image *
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload the primary image for your product
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                onFileSelect={(file) => handleImageUpload(file, 'main')}
                disabled={mainImageUploading}
                loading={mainImageUploading}
                showPreview={true}
                currentImage={formData.main_image}
                success={mainImageSuccess}
                onRemove={() => {
                  setFormData(prev => ({ ...prev, main_image: '' }))
                  setMainImageSuccess(false)
                }}
              />
              
              {formData.main_image && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Main image uploaded!</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gallery Images Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Gallery Images
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add additional images (optional)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Multi Upload */}
              {formData.gallery_images.length < 6 && (
                <MultiFileUpload
                  onFilesSelect={handleMultipleImageUpload}
                  disabled={galleryImageUploading}
                  loading={galleryImageUploading}
                  maxFiles={6 - formData.gallery_images.length}
                  className="w-full"
                />
              )}

              {/* Gallery Images Grid */}
              {formData.gallery_images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uploaded Images</span>
                    <span className="text-xs text-muted-foreground">
                      {formData.gallery_images.length}/6
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {formData.gallery_images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square border rounded-lg overflow-hidden relative bg-muted">
                          <img
                            src={image}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Gallery image failed to load:', image)
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          
                          {galleryImageSuccess[index] && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                          )}
                          
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0"
                            onClick={() => removeGalleryImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Product Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-medium text-lg">Ready to Create?</h3>
                  <p className="text-sm text-muted-foreground">
                    {isFormValid() 
                      ? 'All required fields are completed' 
                      : 'Please complete all required fields'
                    }
                  </p>
                </div>
                
                <Button 
                  type="button" 
                  onClick={(e) => {
                    console.log('Create Product button clicked!')
                    e.preventDefault()
                    e.stopPropagation()
                    handleFinalSubmit()
                  }}
                  disabled={!isFormValid() || loading} 
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Product...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Create Product
                    </>
                  )}
                </Button>
                
                {!isFormValid() && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                      Required: Name, Category, Description, Price, Main Image
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}