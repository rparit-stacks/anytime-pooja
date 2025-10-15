"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { formatINR } from "@/lib/currency"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
    }
    setLoading(false)
  }, [])

  const shippingCost = totalPrice > 100 ? 0 : 10
  const tax = totalPrice * 0.08
  const finalTotal = totalPrice + shippingCost + tax

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.error('Please login to proceed with checkout')
      window.location.href = '/login'
      return
    }
    // Proceed to checkout
    window.location.href = '/checkout'
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16 md:py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Your Cart is Empty</h1>
              <p className="text-muted-foreground text-lg mb-8">
                Looks like you haven't added anything to your cart yet.
              </p>
              <Link href="/products">
                <Button size="lg">Continue Shopping</Button>
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
      <main>
        {/* Page Header */}
        <section className="bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
              Shopping Cart
            </h1>
            <p className="text-muted-foreground text-lg">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>
        </section>

        {/* Cart Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-card rounded-lg border border-border">
                    {/* Product Image */}
                    <Link
                      href={`/products/${item.id}`}
                      className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden"
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.id}`}>
                        <h3 className="font-medium text-foreground mb-2 hover:text-foreground/80 transition-colors line-clamp-2">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-lg font-bold text-foreground mb-3">{formatINR(item.price)}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-transparent"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total & Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <p className="font-bold text-foreground">{formatINR(item.price * item.quantity)}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-card rounded-lg border border-border p-6">
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatINR(totalPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">{shippingCost === 0 ? "FREE" : formatINR(shippingCost)}</span>
                    </div>
                    {totalPrice <= 100 && (
                      <p className="text-sm text-muted-foreground">
                        Add {formatINR(100 - totalPrice)} more for free shipping
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tax (8%)</span>
                      <span className="font-medium">{formatINR(tax)}</span>
                    </div>
                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-2xl font-bold text-foreground">{formatINR(finalTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full mb-3"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout'}
                  </Button>
                  <Link href="/products">
                    <Button variant="outline" size="lg" className="w-full bg-transparent">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
