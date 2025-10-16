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
import { 
  ArrowLeft, 
  X, 
  Plus,
  Save,
  Eye,
  Package,
  Image as ImageIcon
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
  const [currentStep, setCurrentStep] = useState(1)
  
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
      setUploading(true)
      
      const data = await uploadFile(file, 'product', 'anytime-pooja')
      
      if (type === 'main') {
        setFormData(prev => ({
          ...prev,
          main_image: data.url
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          gallery_images: [...prev.gallery_images, data.url]
        }))
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
      setUploading(false)
    }
  }

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }))
  }

  const handleFinalSubmit = async () => {
    if (!formData.name || !formData.price || !formData.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      const data = await apiCall('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify({
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
        })
      })
      
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

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToStep2 = formData.name && formData.slug && formData.description && formData.price && formData.category_id
  const canProceedToStep3 = canProceedToStep2
  const canProceedToStep4 = canProceedToStep3 && formData.main_image

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

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep >= step 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {step}
            </div>
            <div className="ml-2 text-sm">
              {step === 1 && 'Basic Info'}
              {step === 2 && 'Details'}
              {step === 3 && 'Images'}
              {step === 4 && 'Review'}
            </div>
            {step < 4 && (
              <div className={`
                w-12 h-0.5 ml-4
                ${currentStep > step ? 'bg-primary' : 'bg-muted'}
              `} />
            )}
          </div>
        ))}
      </div>

      <div>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
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

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedToStep2}
                  className="no-transition"
                >
                  Next: Product Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Product Details */}
        {currentStep === 2 && (
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

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep} className="no-transition">
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="no-transition"
                >
                  Next: Add Images
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Images */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Image */}
              <div className="space-y-4">
                <Label>Main Image *</Label>
                <FileUpload
                  onFileSelect={(file) => handleImageUpload(file, 'main')}
                  disabled={uploading}
                  loading={uploading}
                  showPreview={true}
                  currentImage={formData.main_image}
                  onRemove={() => setFormData(prev => ({ ...prev, main_image: '' }))}
                />
              </div>

              {/* Gallery Images */}
              <div className="space-y-4">
                <Label>Gallery Images (Optional)</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                  {formData.gallery_images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full h-32 border rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity no-transition"
                        onClick={() => removeGalleryImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {formData.gallery_images.length < 6 && (
                    <FileUpload
                      onFileSelect={(file) => handleImageUpload(file, 'gallery')}
                      disabled={uploading}
                      loading={uploading}
                      className="w-full h-32"
                    >
                      <div className="w-full h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all duration-200 hover:scale-105">
                        <div className="text-center">
                          <Plus className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">
                            Add Image
                          </p>
                        </div>
                      </div>
                    </FileUpload>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep} className="no-transition">
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedToStep4}
                  className="no-transition"
                >
                  Next: Review Product
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Review Product
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Product Name</Label>
                    <p className="font-medium">{formData.name}</p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Slug</Label>
                    <p className="font-medium text-sm font-mono">{formData.slug}</p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Category</Label>
                    <p className="font-medium">
                      {categories.find(c => c.id.toString() === formData.category_id)?.name}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Pricing</Label>
                    <div className="space-y-1">
                      <p className="font-medium text-lg">₹{formData.price}</p>
                      {formData.original_price && (
                        <p className="text-sm text-muted-foreground line-through">
                          Original: ₹{formData.original_price}
                        </p>
                      )}
                  </div>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Stock & Status</Label>
                    <div className="space-y-2">
                      <p className="font-medium">Stock: {formData.stock_quantity || 0}</p>
                      <div className="flex gap-2">
                    <Badge variant={formData.is_active ? "default" : "secondary"}>
                      {formData.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                        {formData.is_featured && (
                          <Badge variant="outline">Featured</Badge>
                        )}
                        {formData.badge && (
                          <Badge variant="secondary">{formData.badge}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {formData.short_description && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Short Description</Label>
                      <p className="text-sm mt-1">{formData.short_description}</p>
                    </div>
                  )}
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Label className="text-sm text-muted-foreground">Full Description</Label>
                    <p className="text-sm mt-1">{formData.description}</p>
                  </div>
                  
                  {(formData.weight || formData.dimensions || formData.material || formData.origin) && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Product Details</Label>
                      <div className="space-y-1 mt-2 text-sm">
                        {formData.weight && <p><span className="font-medium">Weight:</span> {formData.weight} kg</p>}
                        {formData.dimensions && <p><span className="font-medium">Dimensions:</span> {formData.dimensions}</p>}
                        {formData.material && <p><span className="font-medium">Material:</span> {formData.material}</p>}
                        {formData.origin && <p><span className="font-medium">Origin:</span> {formData.origin}</p>}
                      </div>
                    </div>
                  )}
                  
                  {formData.main_image && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Main Image</Label>
                      <div className="w-32 h-32 border rounded-lg overflow-hidden mt-2">
                        <img
                          src={formData.main_image}
                          alt="Main product image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {formData.gallery_images.length > 0 && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">
                        Gallery Images ({formData.gallery_images.length})
                      </Label>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {formData.gallery_images.slice(0, 4).map((image, index) => (
                          <div key={index} className="w-16 h-16 border rounded overflow-hidden">
                            <img
                              src={image}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {formData.gallery_images.length > 4 && (
                          <div className="w-16 h-16 border rounded flex items-center justify-center bg-muted">
                            <span className="text-xs text-muted-foreground">
                              +{formData.gallery_images.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep} className="no-transition">
                  Previous
                </Button>
                <Button 
                  type="button" 
                  onClick={handleFinalSubmit}
                  disabled={loading} 
                  className="no-transition"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Product
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}