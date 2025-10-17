"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ProductCard } from "@/components/product-card"
import { ImageZoom } from "@/components/image-zoom"
import { 
  ShoppingCart, 
  Heart, 
  Truck, 
  Shield, 
  RotateCcw, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  Minus,
  Plus,
  Share2,
  ArrowLeft
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import useSWR from "swr"
import { formatINR } from "@/lib/currency"
import { useCart } from "@/lib/cart-context"
import { swrFetcher } from "@/lib/swr-config"

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const { addItem } = useCart()
  const { data: productResp, error, isLoading } = useSWR(`/api/products/${productId}`, swrFetcher)
  const { data: reviewsResp } = useSWR(`/api/products/${productId}/reviews`, swrFetcher)
  
  const productRow = productResp?.product
  const product = productRow
    ? {
        id: productRow.id,
        name: productRow.name,
        price: Number(productRow.price),
        originalPrice: productRow.originalPrice ? Number(productRow.originalPrice) : null,
        image: productRow.image,
        gallery: productRow.gallery || [productRow.image],
        rating: productRow.rating || 0,
        reviews: productRow.reviews || 0,
        category: productRow.category || "All",
        badge: productRow.badge,
        description: productRow.description || "",
        shortDescription: productRow.shortDescription || "",
        stockQuantity: productRow.stockQuantity || 0,
        material: productRow.material || "",
        origin: productRow.origin || "",
        weight: productRow.weight || "",
        dimensions: productRow.dimensions || "",
      }
    : null

  const reviews = reviewsResp?.reviews || []

  const { data: relatedResp } = useSWR(
    () => (product?.category ? `/api/products?category=${encodeURIComponent(product.category)}` : null),
    swrFetcher,
  )
  
  const { data: recommendedResp } = useSWR(
    () => productId ? `/api/products/${productId}/recommended` : null,
    swrFetcher,
  )
  
  const relatedProducts = (relatedResp?.products || [])
    .filter((p: any) => p.id !== productId)
    .slice(0, 4)
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
      image: p.image,
      rating: p.rating || 0,
      reviews: p.reviews || 0,
      badge: p.badge || undefined,
    }))

  const recommendedProducts = (recommendedResp?.products || [])
    .filter((p: any) => p.id !== productId)
    .slice(0, 6)
    .map((p: any) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
      image: p.image,
      rating: p.rating || 0,
      reviews: p.reviews || 0,
      badge: p.badge || undefined,
    }))

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (product?.gallery && product.gallery.length > 1) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          prevImage()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          nextImage()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [product?.gallery])

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const nextImage = () => {
    if (product?.gallery) {
      setSelectedImage((prev) => (prev + 1) % product.gallery.length)
    }
  }

  const prevImage = () => {
    if (product?.gallery) {
      setSelectedImage((prev) => (prev - 1 + product.gallery.length) % product.gallery.length)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      addItem(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        },
        quantity,
      )
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stockQuantity || 10)) {
      setQuantity(newQuantity)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <div className="aspect-square bg-muted rounded-lg"></div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-20 h-20 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-12 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
              <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
              <Link href="/products">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Products
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-foreground">Products</Link>
            <span>/</span>
            <Link href={`/products?category=${product.category}`} className="hover:text-foreground capitalize">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <ImageZoom
                  src={product.gallery[selectedImage] || product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full"
                />
                
                {/* Navigation arrows */}
                {product.gallery && product.gallery.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background backdrop-blur-sm"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background backdrop-blur-sm"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    {/* Image counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      {selectedImage + 1} / {product.gallery.length}
                    </div>
                  </>
                )}

                {/* Badge */}
                {product.badge && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    {product.badge}
                  </Badge>
                )}

                {/* Discount badge */}
                {discount > 0 && (
                  <Badge variant="destructive" className="absolute top-4 right-4">
                    {discount}% OFF
                  </Badge>
                )}
              </div>

              {/* Thumbnail images */}
              {product.gallery && product.gallery.length > 1 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">Gallery Images</h3>
                    <span className="text-xs text-muted-foreground">
                      {selectedImage + 1} of {product.gallery.length}
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.gallery.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                          selectedImage === index 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    {product.gallery && product.gallery.length === 1 
                      ? 'Only main image available' 
                      : 'No additional images available'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({product.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold">{formatINR(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
              </div>

              {product.shortDescription && (
                <p className="text-muted-foreground text-lg">{product.shortDescription}</p>
              )}

              {/* Stock status */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${product.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">
                  {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
                </span>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stockQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">On orders over ₹500</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Easy Returns</p>
                    <p className="text-xs text-muted-foreground">30-day return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">100% secure checkout</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mb-16">
            <Card>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Description */}
                  {product.description && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Description</h3>
                      <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                    </div>
                  )}

                  {/* Specifications */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.material && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Material</span>
                          <span className="text-muted-foreground">{product.material}</span>
                        </div>
                      )}
                      {product.origin && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Origin</span>
                          <span className="text-muted-foreground">{product.origin}</span>
                        </div>
                      )}
                      {product.weight && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Weight</span>
                          <span className="text-muted-foreground">{product.weight}</span>
                        </div>
                      )}
                      {product.dimensions && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium">Dimensions</span>
                          <span className="text-muted-foreground">{product.dimensions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews Section */}
          <div className="mb-16">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-6">Customer Reviews</h3>
                
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{review.userName}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              {review.isVerified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {review.title && (
                          <h5 className="font-medium mb-2">{review.title}</h5>
                        )}
                        
                        {review.comment && (
                          <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommended Products */}
          {recommendedProducts.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8">Recommended for You</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {recommendedProducts.map((recommendedProduct: any) => (
                  <ProductCard key={recommendedProduct.id} {...recommendedProduct} />
                ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-8">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct: any) => (
                  <ProductCard key={relatedProduct.id} {...relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}