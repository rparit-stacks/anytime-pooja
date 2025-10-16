"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Package, 
  Calendar,
  MapPin,
  CreditCard,
  ArrowLeft,
  Truck,
  Download,
  Phone,
  Mail
} from "lucide-react"
import Link from "next/link"

interface Order {
  id: number
  order_number: string
  total_amount: number
  status: string
  payment_status: string
  payment_method: string
  created_at: string
  estimated_delivery?: string
  tracking_number?: string
  order_items: OrderItem[]
  // Billing details
  billing_first_name: string
  billing_last_name: string
  billing_company?: string
  billing_address_line_1: string
  billing_address_line_2?: string
  billing_city: string
  billing_state: string
  billing_postal_code: string
  billing_country: string
  billing_phone?: string
  // Shipping details
  shipping_first_name: string
  shipping_last_name: string
  shipping_company?: string
  shipping_address_line_1: string
  shipping_address_line_2?: string
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  shipping_country: string
  shipping_phone?: string
  // Order totals
  subtotal: number
  shipping_cost: number
  tax_amount: number
  discount_amount: number
}

interface OrderItem {
  id: number
  product_name: string
  product_price: number
  quantity: number
  total_price: number
  image?: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchOrderDetails(params.id as string)
    }
  }, [params.id])

  const fetchOrderDetails = async (orderId: string) => {
    try {
      console.log('🔍 Fetching order details for order ID:', orderId)
      
      const userData = localStorage.getItem('user')
      if (!userData) {
        console.log('❌ No user data in localStorage')
        setError('Please login to view order details')
        return
      }

      const user = JSON.parse(userData)
      const token = localStorage.getItem('token')
      
      console.log('👤 User data:', { id: user.id, email: user.email })
      console.log('🔑 Token exists:', !!token)
      
      // Try with JWT token first, then fallback to userId query param
      let response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('📦 First API call response:', { ok: response.ok, status: response.status })
      
      // If JWT fails, try with userId query param
      if (!response.ok && response.status === 401) {
        console.log('🔄 JWT failed, trying with userId query param')
        response = await fetch(`/api/orders/${orderId}?userId=${user.id}`)
        console.log('📦 Second API call response:', { ok: response.ok, status: response.status })
      }
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Order data received:', data)
        setOrder(data.order)
      } else {
        const errorData = await response.json()
        console.error('❌ Order API error:', errorData)
        setError(`Order not found or access denied: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Error fetching order details:', error)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const downloadInvoice = async () => {
    if (!order) return
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Please login to download invoice')
        return
      }

      const response = await fetch(`/api/orders/${order.id}/invoice`, {
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
          a.download = `invoice-${order.order_number}.html`
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The order you are looking for does not exist.'}</p>
            <Link href="/profile/orders">
              <Button>View All Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-gray-600">Order #{order.order_number}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadInvoice}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Order Status</p>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <Badge className={getPaymentStatusColor(order.payment_status)}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Order Date: {new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span>Payment: {order.payment_method || 'N/A'}</span>
                </div>
                {order.tracking_number && (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-400" />
                    <span>Tracking: {order.tracking_number}</span>
                  </div>
                )}
                {order.estimated_delivery && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Est. Delivery: {new Date(order.estimated_delivery).toLocaleDateString()}</span>
                  </div>
                )}
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
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product_name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Price: ₹{item.product_price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.total_price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">
                  {order.shipping_first_name} {order.shipping_last_name}
                </p>
                {order.shipping_company && <p>{order.shipping_company}</p>}
                <p>{order.shipping_address_line_1}</p>
                {order.shipping_address_line_2 && <p>{order.shipping_address_line_2}</p>}
                <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                <p>{order.shipping_country}</p>
                {order.shipping_phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {order.shipping_phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{order.shipping_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{order.tax_amount.toFixed(2)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{order.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  If you have any questions about this order, please contact our support team.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <span>support@anytimepooja.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>+91-9876543210</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
