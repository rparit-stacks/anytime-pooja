"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Plus, Trash2, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { AuthGuard } from "@/components/auth-guard"

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

interface PaymentFormData {
  payment_type: 'card' | 'upi' | 'wallet' | 'netbanking'
  card_number: string
  card_holder_name: string
  expiry_month: string
  expiry_year: string
  cvv: string
  upi_id: string
  wallet_type: string
  bank_name: string
  account_number: string
  is_default: boolean
}

function PaymentMethodsPageContent() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState<PaymentFormData>({
    payment_type: 'card',
    card_number: '',
    card_holder_name: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    upi_id: '',
    wallet_type: '',
    bank_name: '',
    account_number: '',
    is_default: false
  })
  const router = useRouter()

  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  const fetchPaymentMethods = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      const response = await fetch(`/api/user/payment-methods?userId=${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setPaymentMethods(data.paymentMethods)
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof PaymentFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.payment_type) {
      toast.error('Please select a payment type')
      return
    }

    if (formData.payment_type === 'card' && (!formData.card_number || !formData.card_holder_name || !formData.expiry_month || !formData.expiry_year)) {
      toast.error('Please fill in all card details')
      return
    }

    if (formData.payment_type === 'upi' && !formData.upi_id) {
      toast.error('Please enter UPI ID')
      return
    }

    setFormLoading(true)

    try {
      const userData = localStorage.getItem('user')
      if (!userData) {
        toast.error('User not found')
        return
      }

      const user = JSON.parse(userData)
      
      const response = await fetch('/api/user/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          ...formData
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Payment method added successfully!')
        setShowAddForm(false)
        setFormData({
          payment_type: 'card',
          card_number: '',
          card_holder_name: '',
          expiry_month: '',
          expiry_year: '',
          cvv: '',
          upi_id: '',
          wallet_type: '',
          bank_name: '',
          account_number: '',
          is_default: false
        })
        fetchPaymentMethods()
      } else {
        toast.error(data.error || 'Failed to add payment method')
      }
    } catch (error) {
      console.error('Error adding payment method:', error)
      toast.error('Failed to add payment method')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return
    }

    try {
      const response = await fetch(`/api/user/payment-methods/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Payment method deleted successfully!')
        fetchPaymentMethods()
      } else {
        toast.error(data.error || 'Failed to delete payment method')
      }
    } catch (error) {
      console.error('Error deleting payment method:', error)
      toast.error('Failed to delete payment method')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Payment Methods</h1>
            <p className="text-muted-foreground mt-2">
              Manage your saved payment methods for faster checkout
            </p>
          </div>

          {/* Existing Payment Methods */}
          <div className="space-y-4 mb-8">
            {paymentMethods.map((method) => (
              <Card key={method.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium capitalize">{method.payment_type.replace('_', ' ')}</h3>
                          {method.is_default && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                        {method.card_number && (
                          <p className="text-sm text-muted-foreground">
                            **** **** **** {method.card_number.slice(-4)}
                          </p>
                        )}
                        {method.upi_id && (
                          <p className="text-sm text-muted-foreground">{method.upi_id}</p>
                        )}
                        {method.card_holder_name && (
                          <p className="text-sm text-muted-foreground">{method.card_holder_name}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {paymentMethods.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No payment methods</h3>
                  <p className="text-muted-foreground mb-4">
                    Add a payment method to make checkout faster and easier.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Add New Payment Method */}
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add New Payment Method
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Add New Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Payment Type */}
                  <div className="space-y-3">
                    <Label>Payment Type</Label>
                    <RadioGroup 
                      value={formData.payment_type} 
                      onValueChange={(value) => handleInputChange('payment_type', value as any)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card">Credit/Debit Card</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi">UPI</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="wallet" id="wallet" />
                        <Label htmlFor="wallet">Digital Wallet</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="netbanking" id="netbanking" />
                        <Label htmlFor="netbanking">Net Banking</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Card Details */}
                  {formData.payment_type === 'card' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="card_number">Card Number *</Label>
                        <Input
                          id="card_number"
                          value={formData.card_number}
                          onChange={(e) => handleInputChange('card_number', e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card_holder_name">Card Holder Name *</Label>
                        <Input
                          id="card_holder_name"
                          value={formData.card_holder_name}
                          onChange={(e) => handleInputChange('card_holder_name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry_month">Month *</Label>
                          <Input
                            id="expiry_month"
                            value={formData.expiry_month}
                            onChange={(e) => handleInputChange('expiry_month', e.target.value)}
                            placeholder="MM"
                            maxLength={2}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiry_year">Year *</Label>
                          <Input
                            id="expiry_year"
                            value={formData.expiry_year}
                            onChange={(e) => handleInputChange('expiry_year', e.target.value)}
                            placeholder="YYYY"
                            maxLength={4}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI Details */}
                  {formData.payment_type === 'upi' && (
                    <div className="space-y-2">
                      <Label htmlFor="upi_id">UPI ID *</Label>
                      <Input
                        id="upi_id"
                        value={formData.upi_id}
                        onChange={(e) => handleInputChange('upi_id', e.target.value)}
                        placeholder="example@paytm"
                        required
                      />
                    </div>
                  )}

                  {/* Wallet Details */}
                  {formData.payment_type === 'wallet' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="wallet_type">Wallet Type *</Label>
                        <Input
                          id="wallet_type"
                          value={formData.wallet_type}
                          onChange={(e) => handleInputChange('wallet_type', e.target.value)}
                          placeholder="Paytm, PhonePe, Google Pay, etc."
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Net Banking Details */}
                  {formData.payment_type === 'netbanking' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bank_name">Bank Name *</Label>
                        <Input
                          id="bank_name"
                          value={formData.bank_name}
                          onChange={(e) => handleInputChange('bank_name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account_number">Account Number</Label>
                        <Input
                          id="account_number"
                          value={formData.account_number}
                          onChange={(e) => handleInputChange('account_number', e.target.value)}
                          placeholder="Last 4 digits"
                        />
                      </div>
                    </div>
                  )}

                  {/* Default Payment Method */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_default"
                      checked={formData.is_default}
                      onCheckedChange={(checked) => handleInputChange('is_default', checked as boolean)}
                    />
                    <Label htmlFor="is_default">Set as default payment method</Label>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1"
                    >
                      {formLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Payment Method'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      disabled={formLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PaymentMethodsPage() {
  return (
    <AuthGuard>
      <PaymentMethodsPageContent />
    </AuthGuard>
  )
}