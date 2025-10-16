"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  ShoppingCart,
  User,
  MapPin,
  CreditCard,
  Package,
  Calendar,
  Phone,
  Mail,
  Truck
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_price: number
  quantity: number
  total_price: number
  product_image?: string
}

interface Order {
  id: number
  order_number: string
  user_id?: number
  email: string
  phone: string
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
  subtotal: number
  shipping_cost: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: string
  payment_reference?: string
  tracking_number?: string
  estimated_delivery?: string
  notes?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
}

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string)
    }
  }, [params.id])

  const fetchOrder = async (orderId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/orders/${orderId}`)
      const data = await response.json()
      
      if (data.success) {
        setOrder(data.order)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch order details",
          variant: "destructive"
        })
        router.push('/admin/orders')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive"
      })
      router.push('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="no-transition">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/orders')} className="no-transition">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Order not found</h3>
            <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/orders')} className="no-transition">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order #{order.order_number}</h1>
            <p className="text-muted-foreground">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={statusColors[order.status]} variant="secondary">
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
          <Badge className={paymentStatusColors[order.payment_status]} variant="secondary">
            Payment {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    {item.product_image && (
                      <div className="w-16 h-16 border rounded overflow-hidden">
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Product ID: {item.product_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Qty: {item.quantity}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.product_price)} each
                      </p>
                      <p className="font-medium">
                        {formatCurrency(item.total_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.shipping_cost > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shipping_cost)}</span>
                  </div>
                )}
                {order.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax_amount)}</span>
                  </div>
                )}
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer & Address Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{order.email}</span>
              </div>
              {order.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.phone}</span>
                </div>
              )}
              {order.user_id && (
                <div className="text-sm text-muted-foreground">
                  User ID: {order.user_id}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">
                  {order.billing_first_name} {order.billing_last_name}
                </p>
                {order.billing_company && (
                  <p className="text-sm text-muted-foreground">{order.billing_company}</p>
                )}
                <p>{order.billing_address_line_1}</p>
                {order.billing_address_line_2 && (
                  <p>{order.billing_address_line_2}</p>
                )}
                <p>
                  {order.billing_city}, {order.billing_state} {order.billing_postal_code}
                </p>
                <p>{order.billing_country}</p>
                {order.billing_phone && (
                  <p className="text-sm text-muted-foreground">
                    Phone: {order.billing_phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">
                  {order.shipping_first_name} {order.shipping_last_name}
                </p>
                {order.shipping_company && (
                  <p className="text-sm text-muted-foreground">{order.shipping_company}</p>
                )}
                <p>{order.shipping_address_line_1}</p>
                {order.shipping_address_line_2 && (
                  <p>{order.shipping_address_line_2}</p>
                )}
                <p>
                  {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                </p>
                <p>{order.shipping_country}</p>
                {order.shipping_phone && (
                  <p className="text-sm text-muted-foreground">
                    Phone: {order.shipping_phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Method</span>
                <span>{order.payment_method || 'N/A'}</span>
              </div>
              {order.payment_reference && (
                <div className="flex justify-between">
                  <span>Reference</span>
                  <span className="text-sm font-mono">{order.payment_reference}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Status</span>
                <Badge className={paymentStatusColors[order.payment_status]} variant="secondary">
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Order ID</span>
                <span className="font-mono">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Number</span>
                <span className="font-mono">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Created</span>
                <span className="text-sm">{formatDate(order.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span className="text-sm">{formatDate(order.updated_at)}</span>
              </div>
              {order.tracking_number && (
                <div className="flex justify-between">
                  <span>Tracking</span>
                  <span className="font-mono">{order.tracking_number}</span>
                </div>
              )}
              {order.estimated_delivery && (
                <div className="flex justify-between">
                  <span>Est. Delivery</span>
                  <span className="text-sm">{formatDate(order.estimated_delivery)}</span>
                </div>
              )}
              {order.notes && (
                <div>
                  <span className="text-sm font-medium">Notes:</span>
                  <p className="text-sm text-muted-foreground mt-1">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
