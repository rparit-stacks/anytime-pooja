"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { XCircle, RefreshCw, ArrowLeft, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { useCart } from "@/lib/cart-context"

export default function CheckoutFailedPage() {
  const [retrying, setRetrying] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items, totalPrice } = useCart()
  
  const errorMessage = searchParams.get('error') || 'Payment failed'
  const orderId = searchParams.get('order_id')
  const paymentId = searchParams.get('payment_id')

  const handleRetryPayment = async () => {
    setRetrying(true)
    try {
      // Redirect back to checkout to retry payment
      router.push('/checkout')
    } catch (error) {
      console.error('Error retrying payment:', error)
      toast.error('Failed to retry payment. Please try again.')
    } finally {
      setRetrying(false)
    }
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleViewCart = () => {
    router.push('/cart')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Failed Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-2">Payment Failed</h1>
            <p className="text-lg text-muted-foreground">
              We're sorry, but your payment could not be processed at this time.
            </p>
          </div>

          <div className="space-y-6">
            {/* Error Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  <Badge variant="destructive">Failed</Badge>
                </div>
                
                {orderId && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Order ID:</span>
                    <span className="font-mono text-sm">{orderId}</span>
                  </div>
                )}
                
                {paymentId && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Payment ID:</span>
                    <span className="font-mono text-sm">{paymentId}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">Error:</span>
                  <span className="text-sm text-red-600">{errorMessage}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            {items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button 
                    onClick={handleRetryPayment}
                    disabled={retrying}
                    className="w-full"
                    size="lg"
                  >
                    {retrying ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Retry Payment
                      </>
                    )}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handleViewCart}
                      variant="outline"
                      className="w-full"
                    >
                      View Cart
                    </Button>
                    <Button 
                      onClick={handleGoHome}
                      variant="outline"
                      className="w-full"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go Home
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Check your payment method details</p>
                  <p>• Ensure you have sufficient funds</p>
                  <p>• Try a different payment method</p>
                  <p>• Contact support if the issue persists</p>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
