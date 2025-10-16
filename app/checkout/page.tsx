"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/lib/cart-context"
import { MapPin, CreditCard, Package, Plus, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { AuthGuard } from "@/components/auth-guard"
import { formatINR } from "@/lib/currency"

interface UserData {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
}

interface Address {
  id: number
  type: 'billing' | 'shipping'
  first_name: string
  last_name: string
  company: string
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
  is_default: boolean
}

interface PaymentMethod {
  id: number
  payment_type: 'card' | 'upi' | 'wallet' | 'netbanking'
  card_number?: string
  card_holder_name?: string
  expiry_month?: string
  expiry_year?: string
  upi_id?: string
  wallet_type?: string
  bank_name?: string
  is_default: boolean
  is_active: boolean
}

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any
  }
}

function CheckoutPageContent() {
  const { items, totalPrice, clearCart } = useCart()
  const [user, setUser] = useState<UserData | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<number | null>(null)
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<number | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null)
  const [useRazorpay, setUseRazorpay] = useState(true)
  const [useSameAddress, setUseSameAddress] = useState(true)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false)
  const router = useRouter()

  // Calculate totals
  const subtotal = totalPrice
  const shippingCost = subtotal > 1000 ? 0 : 50
  const tax = subtotal * 0.18 // 18% GST
  const finalTotal = subtotal + shippingCost + tax

  useEffect(() => {
    fetchUserData()
    fetchAddresses()
    fetchPaymentMethods()
    loadRazorpayScript()
  }, [])

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const fetchUserData = async () => {
    try {
      // First try to get user from localStorage
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          console.log('User loaded from localStorage:', userData)
        } catch (e) {
          console.error('Error parsing saved user:', e)
        }
      }

      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
        }
      } else {
        console.log('API call failed, using localStorage user data')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      // If API fails, try to use localStorage data
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        } catch (e) {
          console.error('Error parsing saved user:', e)
        }
      }
    }
    setLoading(false)
  }

  const fetchAddresses = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      const response = await fetch(`/api/user/addresses?userId=${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setAddresses(data.addresses)
        // Auto-select default addresses
        const defaultBilling = data.addresses.find((addr: Address) => addr.is_default && addr.type === 'billing')
        const defaultShipping = data.addresses.find((addr: Address) => addr.is_default && addr.type === 'shipping')
        
        if (defaultBilling) setSelectedBillingAddress(defaultBilling.id)
        if (defaultShipping) setSelectedShippingAddress(defaultShipping.id)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      const response = await fetch(`/api/user/payment-methods?userId=${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setPaymentMethods(data.paymentMethods)
        // Auto-select default payment method if available, otherwise use Razorpay
        const defaultPayment = data.paymentMethods.find((pm: PaymentMethod) => pm.is_default)
        if (defaultPayment) {
          setSelectedPaymentMethod(defaultPayment.id)
          setUseRazorpay(false)
        } else {
          setUseRazorpay(true)
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    }
  }

  const handleRazorpayPayment = async (orderData: any) => {
    try {
      setProcessing(true)
      setProgressStep(0)
      // Create Razorpay order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(finalTotal),
          currency: 'INR',
          receipt: `receipt_${Date.now()}`
        })
      })

      const razorpayOrder = await response.json()
      if (!razorpayOrder.success) {
        throw new Error('Failed to create Razorpay order')
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RSuL2Axc31295Y',
        amount: razorpayOrder.order.amount,
        currency: razorpayOrder.order.currency,
        name: 'Anytime Pooja',
        description: 'Order Payment',
        order_id: razorpayOrder.order.id,
        handler: async function (response: any) {
          try {
            // Keep processing state true during verification
            setProgressStep(1) // Payment received
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_data: orderData
              })
            })

            setProgressStep(2) // Verifying payment
            const verifyResult = await verifyResponse.json()
            if (verifyResult.success) {
              setProgressStep(3) // Creating order
              toast.success('Payment successful! Order placed.')
              clearCart()
              
              // Small delay to show order creation step
              setTimeout(() => {
                setProgressStep(4) // Sending confirmation
                setPaymentSuccess(true)
              }, 1000)
              
              // Show success message for a moment before redirecting
              setTimeout(() => {
                setProcessing(false)
                setPaymentSuccess(false)
                setProgressStep(0)
                router.push(`/checkout/success?order_id=${verifyResult.order_id}`)
              }, 4000)
            } else {
              toast.error('Payment verification failed')
              // Send payment failure email
              try {
                await fetch('/api/payment/failure', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userEmail: order_data.email || user?.email || '',
                    userName: `${order_data.first_name || user?.first_name || ''} ${order_data.last_name || user?.last_name || ''}`,
                    orderData: {
                      ...order_data,
                      order_number: response.razorpay_order_id,
                      total_amount: order_data.total
                    },
                    errorMessage: 'Payment verification failed'
                  })
                })
              } catch (emailError) {
                console.error('Failed to send payment failure email:', emailError)
              }
              setProcessing(false)
              setProgressStep(0)
              router.push(`/checkout/failed?error=Payment verification failed&order_id=${response.razorpay_order_id}`)
            }
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed')
            setProcessing(false)
            // Send payment failure email
            try {
              await fetch('/api/payment/failure', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userEmail: order_data.email || user?.email || '',
                  userName: `${order_data.first_name || user?.first_name || ''} ${order_data.last_name || user?.last_name || ''}`,
                  orderData: {
                    ...order_data,
                    order_number: 'N/A',
                    total_amount: order_data.total
                  },
                  errorMessage: 'Payment verification error: ' + (error instanceof Error ? error.message : 'Unknown error')
                })
              })
            } catch (emailError) {
              console.error('Failed to send payment failure email:', emailError)
            }
            setProcessing(false)
            setProgressStep(0)
            router.push(`/checkout/failed?error=Payment verification failed&order_id=${response.razorpay_order_id}`)
          }
        },
        prefill: {
          name: user?.first_name + ' ' + user?.last_name,
          email: user?.email,
          contact: user?.phone || ''
        },
        theme: {
          color: '#059669'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Razorpay payment error:', error)
      toast.error('Payment failed. Please try again.')
      setProcessing(false)
      setProgressStep(0)
      // Send payment failure email
      try {
        await fetch('/api/payment/failure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: orderData.email || user?.email || '',
            userName: `${orderData.first_name || user?.first_name || ''} ${orderData.last_name || user?.last_name || ''}`,
            orderData: {
              ...orderData,
              order_number: 'N/A',
              total_amount: orderData.total
            },
            errorMessage: 'Payment initialization failed: ' + (error instanceof Error ? error.message : 'Unknown error')
          })
        })
      } catch (emailError) {
        console.error('Failed to send payment failure email:', emailError)
      }
      router.push(`/checkout/failed?error=Payment initialization failed`)
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedBillingAddress || !selectedShippingAddress) {
      toast.error('Please select billing and shipping addresses')
      return
    }

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setProcessing(true)

    try {
      const billingAddress = addresses.find(addr => addr.id === selectedBillingAddress)
      const shippingAddress = useSameAddress ? billingAddress : addresses.find(addr => addr.id === selectedShippingAddress)

      if (!billingAddress || !shippingAddress) {
        toast.error('Please select valid addresses')
        setProcessing(false)
        return
      }

      const orderData = {
        user_id: user?.id,
        email: user?.email,
        first_name: user?.first_name,
        last_name: user?.last_name,
        items: items,
        billing_address_id: selectedBillingAddress,
        shipping_address_id: selectedShippingAddress,
        subtotal: subtotal,
        shipping_cost: shippingCost,
        tax: tax,
        total: finalTotal,
        payment_method: 'razorpay'
      }

      // Process payment with Razorpay
      await handleRazorpayPayment(orderData)
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-4">Add some items to your cart to proceed with checkout.</p>
            <Button onClick={() => router.push('/products')}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Payment Processing Overlay */}
      {processing && !paymentSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-10 max-w-lg mx-4 text-center shadow-2xl border border-gray-100">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary border-t-transparent mx-auto mb-8"></div>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Processing Your Payment</h3>
            <p className="text-gray-600 mb-8 text-lg">Please wait while we complete your order...</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
              <div 
                className="bg-gradient-to-r from-primary to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(progressStep / 4) * 100}%` }}
              ></div>
            </div>
            
            <div className="space-y-4">
              <div className={`flex items-center justify-center space-x-4 text-base ${progressStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-4 h-4 rounded-full ${progressStep >= 1 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="font-semibold">Payment received</span>
              </div>
              <div className={`flex items-center justify-center space-x-4 text-base ${progressStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-4 h-4 rounded-full ${progressStep >= 2 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="font-semibold">Verifying payment</span>
              </div>
              <div className={`flex items-center justify-center space-x-4 text-base ${progressStep >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-4 h-4 rounded-full ${progressStep >= 3 ? 'bg-purple-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="font-semibold">Creating order</span>
              </div>
              <div className={`flex items-center justify-center space-x-4 text-base ${progressStep >= 4 ? 'text-orange-600' : 'text-gray-400'}`}>
                <div className={`w-4 h-4 rounded-full ${progressStep >= 4 ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="font-semibold">Sending confirmation</span>
              </div>
            </div>
            
            <div className="mt-8 text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <span>This may take a few moments...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Overlay */}
      {processing && paymentSuccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-10 max-w-lg mx-4 text-center shadow-2xl border border-green-100">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-4 text-green-600">Payment Successful!</h3>
            <p className="text-gray-600 mb-8 text-lg">Your order has been placed successfully.</p>
            
            <div className="bg-green-50 rounded-xl p-6 mb-8 border border-green-200">
              <div className="flex items-center justify-center space-x-3 text-base text-green-700">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Redirecting to confirmation page...</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <span>You will be redirected automatically</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Billing Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Billing Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {addresses.filter(addr => addr.type === 'billing').length > 0 ? (
                    <RadioGroup value={selectedBillingAddress?.toString()} onValueChange={(value) => setSelectedBillingAddress(parseInt(value))}>
                      {addresses.filter(addr => addr.type === 'billing').map((address) => (
                        <div key={address.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value={address.id.toString()} id={`billing-${address.id}`} />
                          <label htmlFor={`billing-${address.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium">{address.first_name} {address.last_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {address.address_line_1}, {address.address_line_2 && `${address.address_line_2}, `}
                              {address.city}, {address.state} {address.postal_code}
                            </div>
                            <div className="text-sm text-muted-foreground">{address.country}</div>
                            <div className="text-sm text-muted-foreground">Phone: {address.phone}</div>
                            {address.is_default && (
                              <Badge variant="secondary" className="mt-1">Default</Badge>
                            )}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">No billing addresses found</p>
                      <Button onClick={() => router.push('/profile/addresses/new')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Billing Address
                      </Button>
                    </div>
                  )}
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
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                      id="same-address" 
                      checked={useSameAddress}
                      onCheckedChange={(checked) => setUseSameAddress(checked as boolean)}
                    />
                    <label htmlFor="same-address">Same as billing address</label>
                  </div>

                  {!useSameAddress && (
                    <>
                      {addresses.filter(addr => addr.type === 'shipping').length > 0 ? (
                        <RadioGroup value={selectedShippingAddress?.toString()} onValueChange={(value) => setSelectedShippingAddress(parseInt(value))}>
                          {addresses.filter(addr => addr.type === 'shipping').map((address) => (
                            <div key={address.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                              <RadioGroupItem value={address.id.toString()} id={`shipping-${address.id}`} />
                              <label htmlFor={`shipping-${address.id}`} className="flex-1 cursor-pointer">
                                <div className="font-medium">{address.first_name} {address.last_name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {address.address_line_1}, {address.address_line_2 && `${address.address_line_2}, `}
                                  {address.city}, {address.state} {address.postal_code}
                                </div>
                                <div className="text-sm text-muted-foreground">{address.country}</div>
                                <div className="text-sm text-muted-foreground">Phone: {address.phone}</div>
                                {address.is_default && (
                                  <Badge variant="secondary" className="mt-1">Default</Badge>
                                )}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <div className="text-center py-8">
                          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground mb-4">No shipping addresses found</p>
                          <Button onClick={() => router.push('/profile/addresses/new')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Shipping Address
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <RadioGroup value={selectedPaymentMethod?.toString() || "razorpay"} onValueChange={(value) => {
                      if (value === "razorpay") {
                        setSelectedPaymentMethod(null)
                        setUseRazorpay(true)
                      } else {
                        setSelectedPaymentMethod(parseInt(value))
                        setUseRazorpay(false)
                      }
                    }}>
                      {/* Razorpay Payment Option */}
                      <div className="flex items-center space-x-3 p-4 border rounded-lg bg-green-50 border-green-200">
                        <RadioGroupItem value="razorpay" id="razorpay" />
                        <label htmlFor="razorpay" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Razorpay Payment Gateway</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">Recommended</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Secure payment with cards, UPI, net banking, and wallets
                          </div>
                        </label>
                      </div>

                      {/* Saved Payment Methods */}
                      {paymentMethods.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-muted-foreground">Saved Payment Methods</h4>
                          {paymentMethods.map((method) => (
                            <div key={method.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                              <RadioGroupItem value={method.id.toString()} id={`payment-${method.id}`} />
                              <label htmlFor={`payment-${method.id}`} className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  <span className="font-medium capitalize">{method.payment_type.replace('_', ' ')}</span>
                                  {method.is_default && (
                                    <Badge variant="secondary">Default</Badge>
                                  )}
                                </div>
                                {method.card_number && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    **** **** **** {method.card_number.slice(-4)}
                                  </div>
                                )}
                                {method.upi_id && (
                                  <div className="text-sm text-muted-foreground mt-1">
                                    {method.upi_id}
                                  </div>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </RadioGroup>

                    {/* Add New Payment Method */}
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => router.push('/profile/payment-methods')}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Payment Method
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">{formatINR(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatINR(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{shippingCost === 0 ? 'Free' : formatINR(shippingCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (GST 18%)</span>
                      <span>{formatINR(tax)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>{formatINR(finalTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePlaceOrder}
                    disabled={processing || !selectedBillingAddress || (!useSameAddress && !selectedShippingAddress)}
                    className="w-full"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay with Razorpay - ${formatINR(finalTotal)}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutPageContent />
    </AuthGuard>
  )
}