"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-config"
import { formatINR } from "@/lib/currency"
import { useState, useRef } from "react"

interface TrendingProduct {
  trending_id: number
  sort_order: number
  product_id: number
  product_name: string
  product_slug: string
  product_image: string
  product_price: number
  product_original_price?: number
  product_featured: boolean
}

export function TrendingProducts() {
  const { data, error, isLoading } = useSWR("/api/trending-products", swrFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000, // 5 minutes
    errorRetryCount: 3,
    errorRetryInterval: 1000
  })

  const products: TrendingProduct[] = data?.products || []

  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const marqueeRef = useRef<HTMLDivElement>(null)

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].pageX)
    if (marqueeRef.current) {
      setScrollLeft(marqueeRef.current.scrollLeft)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.touches[0].pageX
    const walk = (startX - x) * 1.5
    if (marqueeRef.current) {
      marqueeRef.current.scrollLeft = scrollLeft + walk
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Mouse handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX)
    if (marqueeRef.current) {
      setScrollLeft(marqueeRef.current.scrollLeft)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX
    const walk = (startX - x) * 1.5
    if (marqueeRef.current) {
      marqueeRef.current.scrollLeft = scrollLeft + walk
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  if (isLoading) {
    return (
      <section className="py-8 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading trending products...</span>
          </div>
        </div>
      </section>
    )
  }

  if (error || products.length === 0) {
    return null // Don't show section if no products
  }

  // Create extended array for seamless marquee looping
  const extendedProducts = [...products, ...products, ...products]

  return (
    <section className="py-8 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold font-serif mb-2">
            Trending Now
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Discover our most popular spiritual products
          </p>
        </div>
      </div>

      {/* Marquee Container - Edge to Edge */}
      <div className="relative overflow-x-auto overflow-y-hidden">
        <div 
          ref={marqueeRef}
          className="flex gap-4 py-4"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {extendedProducts.map((product, index) => (
            <div
              key={`${product.product_id}-${index}`}
              className="flex-shrink-0 w-64 ml-4"
            >
              <Link href={`/products/${product.product_id}`}>
                <Card className="group cursor-pointer h-full transition-all duration-300 hover:shadow-lg hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-3">
                    {/* Product Image */}
                    <div className="relative mb-3 overflow-hidden rounded-lg bg-muted">
                      <div className="aspect-square relative">
                        <img
                          src={product.product_image || "/placeholder-product.jpg"}
                          alt={product.product_name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-product.jpg"
                          }}
                        />
                        {product.product_featured && (
                          <Badge 
                            variant="default" 
                            className="absolute top-1 left-1 text-xs bg-primary/90 text-primary-foreground"
                          >
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {product.product_name}
                      </h3>
                      
                      {/* Price */}
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-primary">
                          {formatINR(product.product_price)}
                        </span>
                        {product.product_original_price && product.product_original_price > product.product_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatINR(product.product_original_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* View All Button */}
      <div className="container mx-auto px-4">
        <div className="text-center mt-6">
          <Link href="/products">
            <Button variant="outline" size="sm" className="no-transition">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
