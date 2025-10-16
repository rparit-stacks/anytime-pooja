"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Package, ArrowLeft, Download } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { formatINR } from "@/lib/currency"

interface OrderData {
  id: number
  order_number: string
  status: string
  payment_status: string
  payment_method: string
  total_amount: number
  created_at: string
  order_items: OrderItem[]
  billing_first_name: string
  billing_last_name: string
  billing_address_line_1: string
  billing_city: string
  billing_state: string
  billing_postal_code: string
  billing_country: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_address_line_1: string
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  shipping_country: string
}

interface OrderItem {
  id: number
  product_name: string
  product_price: number
  quantity: number
  total_price: number
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    } else {
      setLoading(false)
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      })
      const data = await response.json()
      
      if (data.success) {
        setOrder(data.order)
      } else {
        toast.error('Order not found')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Failed to fetch order details')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to download invoice')
        return
      }

      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Get the HTML content
        const htmlContent = await response.text()
        
        // Method 1: Try blob download first
        try {
          const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `invoice-${order?.order_number || 'order'}.html`
          a.style.display = 'none'
          
          document.body.appendChild(a)
          a.click()
          
          setTimeout(() => {
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
          }, 100)
          
          toast.success('Invoice downloaded successfully!')
        } catch (blobError) {
          // Method 2: Fallback to new window
          console.log('Blob download failed, trying new window method')
          const newWindow = window.open('', '_blank')
          if (newWindow) {
            newWindow.document.write(htmlContent)
            newWindow.document.close()
            newWindow.print()
            toast.success('Invoice opened in new window!')
          } else {
            toast.error('Please allow popups to download invoice')
          }
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to download invoice')
      }
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast.error('Failed to download invoice')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Order Placed Successfully!</h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase. Your order has been confirmed and payment received.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Order Number:</span>
                      <span className="font-mono text-sm">{order.order_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Order Date:</span>
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Status:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Payment Status:</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Payment Method:</span>
                      <span className="capitalize">{order.payment_method}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                          <Image
                            src="/placeholder.svg"
                            alt={item.product_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product_name}</h4>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatINR(item.total_price)}</p>
                          <p className="text-sm text-muted-foreground">{formatINR(item.product_price)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Billing Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Billing Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="font-medium">{order.billing_first_name} {order.billing_last_name}</p>
                      <p>{order.billing_address_line_1}</p>
                      <p>{order.billing_city}, {order.billing_state} {order.billing_postal_code}</p>
                      <p>{order.billing_country}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="font-medium">{order.shipping_first_name} {order.shipping_last_name}</p>
                      <p>{order.shipping_address_line_1}</p>
                      <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                      <p>{order.shipping_country}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Order Total & Actions */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Total</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{formatINR(order.total_amount)}</p>
                    <p className="text-sm text-muted-foreground">Total Amount Paid</p>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={handleDownloadInvoice}
                      variant="outline" 
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </Button>
                    <Button 
                      onClick={() => router.push('/profile/orders')}
                      className="w-full"
                    >
                      View All Orders
                    </Button>
                    <Button 
                      onClick={() => router.push('/')}
                      variant="outline" 
                      className="w-full"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Continue Shopping
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground text-center">
                      You will receive an email confirmation shortly with your order details and tracking information.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}