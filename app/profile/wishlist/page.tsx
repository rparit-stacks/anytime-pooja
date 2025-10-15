"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  ShoppingCart,
  Trash2,
  Star,
  Eye
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface WishlistItem {
  id: number
  product_id: number
  created_at: string
  product: {
    id: number
    name: string
    slug: string
    price: number
    original_price?: number
    image: string
    rating: number
    review_count: number
    is_active: boolean
    stock_quantity: number
  }
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removingItems, setRemovingItems] = useState<number[]>([])

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      const response = await fetch(`/api/user/wishlist?userId=${user.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setWishlistItems(data.wishlist || [])
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (wishlistId: number) => {
    setRemovingItems(prev => [...prev, wishlistId])
    
    try {
      const response = await fetch(`/api/user/wishlist/${wishlistId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.id !== wishlistId))
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    } finally {
      setRemovingItems(prev => prev.filter(id => id !== wishlistId))
    }
  }

  const addToCart = async (productId: number) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        }),
      })
      
      if (response.ok) {
        // Show success message or handle cart update
        console.log('Added to cart successfully')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600">Items you've saved for later</p>
        </div>
        <div className="text-sm text-gray-600">
          {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Save items you love to your wishlist</p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFromWishlist(item.id)}
                      disabled={removingItems.includes(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {item.product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {item.product.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          ({item.product.review_count} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">
                          ₹{item.product.price.toFixed(2)}
                        </span>
                        {item.product.original_price && item.product.original_price > item.product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₹{item.product.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Badge variant={item.product.stock_quantity > 0 ? "default" : "destructive"}>
                        {item.product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        className="flex-1" 
                        size="sm"
                        onClick={() => addToCart(item.product.id)}
                        disabled={item.product.stock_quantity === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/products/${item.product.slug}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500">
                      Added on {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {wishlistItems.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Quick Actions</h3>
                <p className="text-sm text-gray-600">Manage your wishlist items</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
                <Button asChild>
                  <Link href="/cart">View Cart</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



