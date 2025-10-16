"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
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
  Save,
  Eye,
  Package,
  Image as ImageIcon,
  X,
  Plus,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { uploadFile } from "@/lib/api-utils"

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  description: string
  price: number
  category_id: number
  category_name?: string
  stock_quantity: number
  is_active: boolean
  image: string
  gallery?: string | string[]
  created_at: string
  updated_at: string
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

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { toast } = useToast()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [initialLoading, setInitialLoading] = useState(true)
  
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
    if (productId) {
      fetchProduct()
      fetchCategories()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setInitialLoading(true)
      const response = await fetch(`/api/admin/products/${productId}`)
      const data = await response.json()

      if (data.success) {
        const productData = data.product
        setProduct(productData)
        
        // Parse gallery images if it's a string
        let galleryImages = []
        if (productData.gallery) {
          if (typeof productData.gallery === 'string') {
            try {
              galleryImages = JSON.parse(productData.gallery)
            } catch (e) {
              galleryImages = []
            }
          } else if (Array.isArray(productData.gallery)) {
            galleryImages = productData.gallery
          }
        }

        setFormData({
          name: productData.name || '',
          slug: productData.slug || '',
          description: productData.description || '',
          short_description: productData.short_description || '',
          price: productData.price?.toString() || '',
          original_price: productData.original_price?.toString() || '',
          category_id: productData.category_id?.toString() || '',
          stock_quantity: productData.stock_quantity?.toString() || '0',
          is_active: productData.is_active !== false,
          is_featured: productData.is_featured || false,
          badge: productData.badge || '',
          weight: productData.weight?.toString() || '',
          dimensions: productData.dimensions || '',
          material: productData.material || '',
          origin: productData.origin || '',
          main_image: productData.image || '',
          gallery_images: galleryImages
        })
      } else {
        toast({
          title: "Error",
          description: data.error || 'Failed to fetch product',
          variant: "destructive"
        })
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast({
        title: "Error",
        description: 'Failed to fetch product',
        variant: "destructive"
      })
      router.push('/admin/products')
    } finally {
      setInitialLoading(false)
    }
  }

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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = async (file: File, type: 'main' | 'gallery', galleryIndex?: number) => {
    try {
      setUploading(true)
      if (type === 'gallery' && galleryIndex !== undefined) {
        setUploadingIndex(galleryIndex)
      }
      
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
      setUploadingIndex(null)
    }
  }

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }))
    toast({
      title: "Success",
      description: "Image removed from gallery"
    })
  }

  const replaceGalleryImage = async (file: File, index: number) => {
    try {
      setUploading(true)
      setUploadingIndex(index)
      
      const data = await uploadFile(file, 'product', 'anytime-pooja')
      
      setFormData(prev => ({
        ...prev,
        gallery_images: prev.gallery_images.map((img, i) => 
          i === index ? data.url : img
        )
      }))
      
      toast({
        title: "Success",
        description: "Image replaced successfully"
      })
    } catch (error) {
      console.error('Error replacing image:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to replace image",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      setUploadingIndex(null)
    }
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
      
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
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
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Product updated successfully"
        })
        router.push('/admin/products')
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update product",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToStep2 = formData.name && formData.description && formData.price && formData.category_id
  const canProceedToStep3 = canProceedToStep2 && formData.main_image

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
          </div>
          <div>
            <p className="text-lg font-semibold">Loading Product...</p>
            <p className="text-sm text-muted-foreground">Please wait while we fetch the product details</p>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Package className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <p className="text-lg font-semibold">Product Not Found</p>
            <p className="text-sm text-muted-foreground">The product you're looking for doesn't exist</p>
          </div>
          <Link href="/admin/products">
            <Button className="no-transition">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">
            Update "{product.name}" information
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
              ${currentStep >= step 
                ? 'bg-primary text-primary-foreground scale-110' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {step}
            </div>
            <div className="ml-2 text-sm">
              {step === 1 && 'Basic Info'}
              {step === 2 && 'Images'}
              {step === 3 && 'Review'}
            </div>
            {step < 3 && (
              <div className={`
                w-12 h-0.5 ml-4 transition-all duration-300
                ${currentStep > step ? 'bg-primary' : 'bg-muted'}
              `} />
            )}
          </div>
        ))}
      </div>

      <div>
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="animate-in slide-in-from-right-5 duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter product name"
                      required
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => handleInputChange('category_id', value)}
                    >
                      <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
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
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter product description"
                    rows={4}
                    required
                    className="transition-all duration-200 focus:scale-[1.01]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      required
                      className="transition-all duration-200 focus:scale-[1.02]"
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
                      className="transition-all duration-200 focus:scale-[1.02]"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="active">Product is active</Label>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedToStep2}
                    className="no-transition transition-all duration-200 hover:scale-105"
                  >
                    Next: Update Images
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Images */}
        {currentStep === 2 && (
          <div className="animate-in slide-in-from-right-5 duration-300">
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
                  <div className="relative">
                    {uploading && uploadingIndex === null ? (
                      <div className="w-full h-64 border-2 border-dashed border-primary rounded-lg flex items-center justify-center bg-primary/5">
                        <div className="text-center space-y-3">
                          <div className="relative">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
                          </div>
                          <p className="text-sm font-medium text-primary">Uploading main image...</p>
                          <div className="w-32 h-1 bg-muted rounded-full mx-auto overflow-hidden">
                            <div className="h-full bg-primary rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <FileUpload
                        onFileSelect={(file) => handleImageUpload(file, 'main')}
                        disabled={uploading}
                        showPreview={true}
                        currentImage={formData.main_image}
                        onRemove={() => setFormData(prev => ({ ...prev, main_image: '' }))}
                      />
                    )}
                  </div>
                </div>

                {/* Gallery Images */}
                <div className="space-y-4">
                  <Label>Gallery Images (Optional)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.gallery_images.map((image, index) => (
                      <div key={index} className="relative group">
                        {uploading && uploadingIndex === index ? (
                          <div className="w-full h-32 border-2 border-dashed border-primary rounded-lg flex items-center justify-center bg-primary/5">
                            <div className="text-center space-y-2">
                              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                              <p className="text-xs text-primary font-medium">Replacing...</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-32 border rounded-lg overflow-hidden transition-all duration-200 hover:scale-105">
                            <img
                              src={image}
                              alt={`Gallery image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                              <div className="flex gap-1">
                                <FileUpload
                                  onFileSelect={(file) => replaceGalleryImage(file, index)}
                                  disabled={uploading}
                                >
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="no-transition"
                                  >
                                    Replace
                                  </Button>
                                </FileUpload>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeGalleryImage(index)}
                                  className="no-transition"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {formData.gallery_images.length < 6 && (
                      <div className="relative">
                        {uploading && uploadingIndex === -1 ? (
                          <div className="w-full h-32 border-2 border-dashed border-primary rounded-lg flex items-center justify-center bg-primary/5">
                            <div className="text-center space-y-2">
                              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                              <p className="text-xs text-primary font-medium">Adding...</p>
                            </div>
                          </div>
                        ) : (
                          <FileUpload
                            onFileSelect={(file) => {
                              setUploadingIndex(-1)
                              handleImageUpload(file, 'gallery')
                            }}
                            disabled={uploading}
                            className="w-full h-32"
                          >
                            <div className="w-full h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all duration-200 hover:scale-105 hover:bg-primary/5">
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
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep} 
                    className="no-transition transition-all duration-200 hover:scale-105"
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedToStep3}
                    className="no-transition transition-all duration-200 hover:scale-105"
                  >
                    Next: Review Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="animate-in slide-in-from-right-5 duration-300">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Review Changes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Product Name</Label>
                      <p className="font-medium">{formData.name}</p>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Category</Label>
                      <p className="font-medium">
                        {categories.find(c => c.id.toString() === formData.category_id)?.name}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Price</Label>
                      <p className="font-medium text-lg">₹{formData.price}</p>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Stock Quantity</Label>
                      <p className="font-medium">{formData.stock_quantity || 0}</p>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <Badge variant={formData.is_active ? "default" : "secondary"} className="mt-1">
                        {formData.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground">Description</Label>
                      <p className="text-sm mt-1">{formData.description}</p>
                    </div>
                    
                    {formData.main_image && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <Label className="text-sm text-muted-foreground">Main Image</Label>
                        <div className="w-32 h-32 border rounded-lg overflow-hidden mt-2 transition-all duration-200 hover:scale-105">
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
                            <div key={index} className="w-16 h-16 border rounded overflow-hidden transition-all duration-200 hover:scale-110">
                              <img
                                src={image}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {formData.gallery_images.length > 4 && (
                            <div className="w-16 h-16 border rounded flex items-center justify-center bg-muted">
                              <span className="text-xs text-muted-foreground font-medium">
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep} 
                    className="no-transition transition-all duration-200 hover:scale-105"
                  >
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleFinalSubmit}
                    disabled={loading || uploading} 
                    className="no-transition transition-all duration-200 hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating Product...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Product
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}