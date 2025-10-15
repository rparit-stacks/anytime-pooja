"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingCard, LoadingOverlay, LoadingSpinner } from "@/components/ui/loading"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faBars, 
  faHome, 
  faInfoCircle, 
  faTags, 
  faShoppingCart, 
  faFire,
  faEdit,
  faSave,
  faTimes,
  faPlus,
  faTrash,
  faEye,
  faEyeSlash
} from "@fortawesome/free-solid-svg-icons"
import Link from "next/link"

interface SidebarItem {
  id: string
  label: string
  href: string
  icon: string
  isActive: boolean
  sortOrder: number
  isVisible: boolean
}

interface TrendingProduct {
  id: string
  name: string
  image: string
  price: number
  isTrending: boolean
  sortOrder: number
}

export default function SidebarManagementPage() {
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([])
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([])
  const [allProducts, setAllProducts] = useState<TrendingProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch sidebar items
      const sidebarResponse = await fetch('/api/admin/sidebar')
      const sidebarData = await sidebarResponse.json()
      setSidebarItems(sidebarData.items || [])

      // Fetch trending products
      const trendingResponse = await fetch('/api/admin/trending')
      const trendingData = await trendingResponse.json()
      setTrendingProducts(trendingData.products || [])

      // Fetch all products for selection
      const productsResponse = await fetch('/api/admin/products')
      const productsData = await productsResponse.json()
      setAllProducts(productsData.products || [])
    } catch (err) {
      setError('Failed to load data')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSidebarItemChange = (id: string, field: string, value: any) => {
    setSidebarItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleTrendingProductToggle = async (productId: string, isTrending: boolean) => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/trending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, isTrending })
      })

      if (response.ok) {
        setTrendingProducts(prev => prev.map(product =>
          product.id === productId ? { ...product, isTrending } : product
        ))
        setSuccess(isTrending ? 'Product added to trending' : 'Product removed from trending')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError('Failed to update trending status')
      }
    } catch (err) {
      setError('Failed to update trending status')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSidebar = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch('/api/admin/sidebar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: sidebarItems })
      })

      if (response.ok) {
        setSuccess('Sidebar settings saved successfully')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError('Failed to save sidebar settings')
      }
    } catch (err) {
      setError('Failed to save sidebar settings')
    } finally {
      setSaving(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      home: faHome,
      about: faInfoCircle,
      category: faTags,
      cart: faShoppingCart,
      sale: faFire,
      bars: faBars
    }
    return iconMap[iconName] || faBars
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <LoadingCard text="Loading sidebar management..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-balance">
            Sidebar Management
          </h1>
          <p className="text-muted-foreground">
            Manage navigation items and trending products
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sidebar Items Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                Navigation Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sidebarItems.map((item, index) => (
                <div key={item.id} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon 
                        icon={getIconComponent(item.icon)} 
                        className="h-4 w-4 text-muted-foreground" 
                      />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.isVisible ? "default" : "secondary"}>
                        {item.isVisible ? "Visible" : "Hidden"}
                      </Badge>
                      <Badge variant="outline">Order: {item.sortOrder}</Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`label-${item.id}`}>Label</Label>
                      <Input
                        id={`label-${item.id}`}
                        value={item.label}
                        onChange={(e) => handleSidebarItemChange(item.id, 'label', e.target.value)}
                        placeholder="Menu Label"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`href-${item.id}`}>Link</Label>
                      <Input
                        id={`href-${item.id}`}
                        value={item.href}
                        onChange={(e) => handleSidebarItemChange(item.id, 'href', e.target.value)}
                        placeholder="/path"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`icon-${item.id}`}>Icon</Label>
                      <Select 
                        value={item.icon} 
                        onValueChange={(value) => handleSidebarItemChange(item.id, 'icon', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="about">About</SelectItem>
                          <SelectItem value="category">Category</SelectItem>
                          <SelectItem value="cart">Cart</SelectItem>
                          <SelectItem value="sale">Sale</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`order-${item.id}`}>Sort Order</Label>
                      <Input
                        id={`order-${item.id}`}
                        type="number"
                        value={item.sortOrder}
                        onChange={(e) => handleSidebarItemChange(item.id, 'sortOrder', parseInt(e.target.value))}
                        placeholder="1"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`visible-${item.id}`}>Visible</Label>
                      <Switch
                        id={`visible-${item.id}`}
                        checked={item.isVisible}
                        onCheckedChange={(checked) => handleSidebarItemChange(item.id, 'isVisible', checked)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button 
                onClick={handleSaveSidebar} 
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="h-4 w-4 mr-2" />
                    Save Sidebar Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Trending Products Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FontAwesomeIcon icon={faFire} className="h-5 w-5" />
                Trending Products
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Select which products should appear in the trending section
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allProducts.map((product) => {
                  const isTrending = trendingProducts.some(tp => tp.id === product.id)
                  return (
                    <div key={product.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 relative">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ₹{product.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isTrending && (
                          <Badge variant="default" className="text-xs">
                            <FontAwesomeIcon icon={faFire} className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                        <Button
                          variant={isTrending ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => handleTrendingProductToggle(product.id, !isTrending)}
                          disabled={saving}
                        >
                          {saving ? (
                            <LoadingSpinner />
                          ) : isTrending ? (
                            <>
                              <FontAwesomeIcon icon={faEyeSlash} className="h-3 w-3 mr-1" />
                              Remove
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faPlus} className="h-3 w-3 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {trendingProducts.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Currently Trending ({trendingProducts.length})</div>
                  <div className="flex flex-wrap gap-2">
                    {trendingProducts.map((product) => (
                      <Badge key={product.id} variant="default" className="text-xs">
                        {product.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  )
}
