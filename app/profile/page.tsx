"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  CreditCard,
  Bell,
  Edit,
  Plus
} from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  profile_image?: string
  email_verified: boolean
  created_at: string
}

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  totalAddresses: number
  wishlistItems: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalAddresses: 0,
    wishlistItems: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // First try to get user from localStorage
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          fetchDashboardStats(userData.id)
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
          fetchDashboardStats(data.user.id)
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
          fetchDashboardStats(userData.id)
        } catch (e) {
          console.error('Error parsing saved user:', e)
        }
      }
    }
    setLoading(false)
  }

  const fetchDashboardStats = async (userId: number) => {
    try {
      // Fetch orders count
      const ordersResponse = await fetch(`/api/user/orders?userId=${userId}`)
      const ordersData = await ordersResponse.json()
      
      // Fetch addresses count
      const addressesResponse = await fetch(`/api/user/addresses?userId=${userId}`)
      const addressesData = await addressesResponse.json()
      
      // Fetch wishlist count
      const wishlistResponse = await fetch(`/api/user/wishlist?userId=${userId}`)
      const wishlistData = await wishlistResponse.json()

      setStats({
        totalOrders: ordersData.orders?.length || 0,
        pendingOrders: ordersData.orders?.filter((order: any) => 
          ['pending', 'processing'].includes(order.status)
        ).length || 0,
        totalAddresses: addressesData.addresses?.length || 0,
        wishlistItems: wishlistData.wishlist?.length || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User data not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.first_name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your account, orders, and preferences
            </p>
          </div>
          <div className="flex flex-col lg:items-end gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={user.email_verified ? "default" : "destructive"}>
                {user.email_verified ? "✅ Verified" : "❌ Unverified"}
              </Badge>
              <Link href="/">
                <Button size="sm" variant="outline">
                  🏪 Back to Store
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/profile/quick-edit">
                <Button size="sm" variant="default">
                  <Edit className="h-4 w-4 mr-1" />
                  Quick Edit
                </Button>
              </Link>
              <Link href="/profile/edit">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-1" />
                  Full Edit
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Addresses</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAddresses}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/profile/addresses" className="text-blue-600 hover:underline">
                Manage addresses
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wishlistItems}</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/profile/wishlist" className="text-blue-600 hover:underline">
                View wishlist
              </Link>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.email_verified ? "Active" : "Pending"}
            </div>
            <p className="text-xs text-muted-foreground">
              {user.email_verified ? "Fully verified" : "Email verification needed"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {stats.totalOrders === 0 
                  ? "No orders yet" 
                  : `${stats.totalOrders} order${stats.totalOrders > 1 ? 's' : ''} found`
                }
              </p>
              <Button asChild className="w-full">
                <Link href="/profile/orders">
                  View All Orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Wishlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {stats.wishlistItems === 0 
                  ? "No items in wishlist" 
                  : `${stats.wishlistItems} item${stats.wishlistItems > 1 ? 's' : ''} saved`
                }
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/profile/wishlist">
                  View Wishlist
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile/settings">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm">{user.first_name} {user.last_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-sm">{user.phone || "Not provided"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Member Since</label>
              <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}