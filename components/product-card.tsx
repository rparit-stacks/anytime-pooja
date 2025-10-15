"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { formatINR } from "@/lib/currency"
import { toast } from "sonner"

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  badge?: string
}

export function ProductCard({ id, name, price, originalPrice, image, rating, reviews, badge }: ProductCardProps) {
  const { addItem } = useCart()

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please login to add items to cart')
      window.location.href = '/login'
      return
    }
    
    addItem({ id, name, price, image })
    toast.success('Item added to cart!')
  }

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please login to add items to wishlist')
      window.location.href = '/login'
      return
    }
    
    // TODO: Add to wishlist functionality
    toast.success('Item added to wishlist!')
  }

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image Container */}
      <Link href={`/products/${id}`} className="block relative aspect-square overflow-hidden bg-muted">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg"
          }}
        />
        {badge && <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">{badge}</Badge>}
        {discount > 0 && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">-{discount}%</Badge>
        )}
        <button
          onClick={handleAddToWishlist}
          className="absolute top-3 right-3 p-2 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </button>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${id}`}>
          <h3 className="font-medium text-foreground mb-2 line-clamp-2 hover:text-foreground/80 transition-colors text-pretty">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(rating) ? "text-yellow-500 fill-yellow-500" : "text-muted fill-muted"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({reviews})</span>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">{formatINR(price)}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">{formatINR(originalPrice)}</span>
            )}
          </div>
          <Button size="sm" className="gap-2" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
