"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDatabase, faCheckCircle, faTimesCircle, faRefresh, faInfoCircle } from "@fortawesome/free-solid-svg-icons"
import { LoadingCard } from "@/components/ui/loading"
import Link from "next/link"

interface DatabaseStatus {
  success: boolean
  message: string
  timestamp: string
  database?: {
    name: string
    version: string
    connection_time: string
  }
  table_counts?: {
    categories: number
    products: number
    sliders: number
    users: number
    user_addresses: number
    orders: number
    order_items: number
  }
  sample_data?: {
    categories: any[]
    products: any[]
    sliders: any[]
  }
  schema_verification?: any
  error?: string
  troubleshooting?: any
}

export default function DatabaseStatusPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<string>("")

  const checkDatabaseStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()
      setStatus(data)
      setLastChecked(new Date().toLocaleString())
    } catch (error) {
      console.error("Error checking database status:", error)
      setStatus({
        success: false,
        message: "Failed to connect to database",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-balance mb-4">
            Database Status
          </h1>
          <p className="text-muted-foreground">Checking database connection and schema...</p>
        </div>
        <LoadingCard text="Checking database status..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-balance mb-4">
            Database Status
          </h1>
          <p className="text-muted-foreground">
            Monitor your database connection and verify schema integrity
          </p>
        </div>
        <Button onClick={checkDatabaseStatus} disabled={loading}>
          <FontAwesomeIcon icon={faRefresh} className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faDatabase} className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Badge variant={status?.success ? "default" : "destructive"} className="text-sm">
              {status?.success ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTimesCircle} className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Last checked: {lastChecked}
            </span>
          </div>
          
          {status?.success ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">{status.message}</p>
              {status.database && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium">Database Name</p>
                    <p className="text-sm text-muted-foreground">{status.database.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">MySQL Version</p>
                    <p className="text-sm text-muted-foreground">{status.database.version}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Connection Time</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(status.database.connection_time).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-red-600 font-medium">{status?.message}</p>
              {status?.error && (
                <p className="text-sm text-muted-foreground">Error: {status.error}</p>
              )}
              {status?.troubleshooting && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Troubleshooting Steps:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• {status.troubleshooting.check_env_file}</li>
                    <li>• {status.troubleshooting.check_database}</li>
                    <li>• {status.troubleshooting.check_tables}</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table Counts */}
      {status?.success && status.table_counts && (
        <Card>
          <CardHeader>
            <CardTitle>Table Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-primary">{status.table_counts.categories}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-primary">{status.table_counts.products}</p>
                <p className="text-sm text-muted-foreground">Products</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-primary">{status.table_counts.sliders}</p>
                <p className="text-sm text-muted-foreground">Sliders</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-primary">{status.table_counts.users}</p>
                <p className="text-sm text-muted-foreground">Users</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-primary">{status.table_counts.orders}</p>
                <p className="text-sm text-muted-foreground">Orders</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-primary">{status.table_counts.order_items}</p>
                <p className="text-sm text-muted-foreground">Order Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Data */}
      {status?.success && status.sample_data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sample Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {status.sample_data.categories.map((cat: any) => (
                <div key={cat.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-sm text-muted-foreground">{cat.slug}</p>
                  </div>
                  <Badge variant={cat.is_active ? "default" : "secondary"}>
                    {cat.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sample Products</CardTitle>
            </CardHeader>
            <CardContent>
              {status.sample_data.products.map((product: any) => (
                <div key={product.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">₹{product.price}</p>
                  </div>
                  <div className="flex gap-1">
                    {product.is_featured && (
                      <Badge variant="outline" className="text-xs">Featured</Badge>
                    )}
                    <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sample Sliders</CardTitle>
            </CardHeader>
            <CardContent>
              {status.sample_data.sliders.map((slider: any) => (
                <div key={slider.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{slider.title}</p>
                    <p className="text-sm text-muted-foreground">{slider.cta_text}</p>
                  </div>
                  <Badge variant={slider.is_active ? "default" : "secondary"}>
                    {slider.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schema Verification */}
      {status?.success && status.schema_verification && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faInfoCircle} className="h-5 w-5" />
              Schema Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(status.schema_verification).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-sm font-medium capitalize">
                    {key.replace('_', ' ')}:
                  </span>
                  <span className="text-sm text-muted-foreground">{value as string}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/products">
              <Button variant="outline">
                Manage Products
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline">
                Manage Categories
              </Button>
            </Link>
            <Link href="/admin/sliders">
              <Button variant="outline">
                Manage Sliders
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline">
                View Orders
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
