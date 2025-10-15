"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Plus,
  Edit,
  Trash2,
  Home,
  Building
} from "lucide-react"
import Link from "next/link"

interface Address {
  id: number
  type: 'billing' | 'shipping'
  first_name: string
  last_name: string
  company?: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
  is_default: boolean
  created_at: string
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingIds, setDeletingIds] = useState<number[]>([])

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      const response = await fetch(`/api/user/addresses?userId=${user.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setAddresses(data.addresses || [])
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteAddress = async (addressId: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    setDeletingIds(prev => [...prev, addressId])
    
    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setAddresses(prev => prev.filter(addr => addr.id !== addressId))
      }
    } catch (error) {
      console.error('Error deleting address:', error)
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== addressId))
    }
  }

  const setDefaultAddress = async (addressId: number) => {
    try {
      const response = await fetch(`/api/user/addresses/${addressId}/default`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        // Update local state
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          is_default: addr.id === addressId
        })))
      }
    } catch (error) {
      console.error('Error setting default address:', error)
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
          <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
          <p className="text-gray-600">Manage your billing and shipping addresses</p>
        </div>
        <Button asChild>
          <Link href="/profile/addresses/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Link>
        </Button>
      </div>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-gray-600 mb-6">Add your first address to get started</p>
            <Button asChild>
              <Link href="/profile/addresses/new">Add Address</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {address.type === 'billing' ? (
                      <Building className="h-5 w-5" />
                    ) : (
                      <Home className="h-5 w-5" />
                    )}
                    {address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {address.is_default && (
                      <Badge variant="default">Default</Badge>
                    )}
                    <Badge variant="outline">
                      {address.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">
                      {address.first_name} {address.last_name}
                    </h4>
                    {address.company && (
                      <p className="text-sm text-gray-600">{address.company}</p>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    <p>{address.address_line_1}</p>
                    {address.address_line_2 && <p>{address.address_line_2}</p>}
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                    <p>{address.country}</p>
                    {address.phone && <p className="mt-2">Phone: {address.phone}</p>}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      className="flex-1"
                    >
                      <Link href={`/profile/addresses/${address.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    
                    {!address.is_default && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDefaultAddress(address.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteAddress(address.id)}
                      disabled={deletingIds.includes(address.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Address Types Summary */}
      {addresses.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Billing Addresses</h3>
                <p className="text-sm text-gray-600">
                  {addresses.filter(addr => addr.type === 'billing').length} saved
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Shipping Addresses</h3>
                <p className="text-sm text-gray-600">
                  {addresses.filter(addr => addr.type === 'shipping').length} saved
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



