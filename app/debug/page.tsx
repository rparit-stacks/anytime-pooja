"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testUserData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug/user-data?userId=4')
      const data = await response.json()
      setDebugData(data)
      console.log('🔍 Debug data:', data)
    } catch (error) {
      console.error('❌ Debug error:', error)
    } finally {
      setLoading(false)
    }
  }

  const testCurrentUser = async () => {
    setLoading(true)
    try {
      const userData = localStorage.getItem('user')
      if (!userData) {
        alert('No user data in localStorage')
        return
      }
      
      const user = JSON.parse(userData)
      const response = await fetch(`/api/debug/user-data?userId=${user.id}`)
      const data = await response.json()
      setDebugData(data)
      console.log('🔍 Current user debug data:', data)
    } catch (error) {
      console.error('❌ Debug error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug User Data</h1>
        
        <div className="space-y-4 mb-8">
          <Button onClick={testUserData} disabled={loading}>
            {loading ? 'Loading...' : 'Test User ID 4'}
          </Button>
          <Button onClick={testCurrentUser} disabled={loading} variant="outline">
            {loading ? 'Loading...' : 'Test Current User'}
          </Button>
        </div>

        {debugData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Debug Results</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(debugData, null, 2)}
                </pre>
              </CardContent>
            </Card>

            {debugData.debug && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>User ID:</strong> {debugData.debug.userId}</p>
                    <p><strong>User Exists:</strong> {debugData.debug.userExists ? 'Yes' : 'No'}</p>
                    {debugData.debug.user && (
                      <div className="mt-4">
                        <p><strong>Name:</strong> {debugData.debug.user.first_name} {debugData.debug.user.last_name}</p>
                        <p><strong>Email:</strong> {debugData.debug.user.email}</p>
                        <p><strong>Phone:</strong> {debugData.debug.user.phone}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Addresses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Count:</strong> {debugData.debug.addresses.count}</p>
                    {debugData.debug.addresses.data.map((addr: any, index: number) => (
                      <div key={index} className="mt-2 p-2 bg-gray-50 rounded">
                        <p><strong>Type:</strong> {addr.type}</p>
                        <p><strong>Name:</strong> {addr.first_name} {addr.last_name}</p>
                        <p><strong>Address:</strong> {addr.address_line_1}, {addr.city}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Count:</strong> {debugData.debug.orders.count}</p>
                    {debugData.debug.orders.data.map((order: any, index: number) => (
                      <div key={index} className="mt-2 p-2 bg-gray-50 rounded">
                        <p><strong>Order #:</strong> {order.order_number}</p>
                        <p><strong>Status:</strong> {order.status}</p>
                        <p><strong>Amount:</strong> ₹{order.total_amount}</p>
                        <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Count:</strong> {debugData.debug.orderItems.count}</p>
                    {debugData.debug.orderItems.data.map((item: any, index: number) => (
                      <div key={index} className="mt-2 p-2 bg-gray-50 rounded">
                        <p><strong>Product:</strong> {item.product_name}</p>
                        <p><strong>Quantity:</strong> {item.quantity}</p>
                        <p><strong>Price:</strong> ₹{item.product_price}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {debugData.debug.orderDetailsTest && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Details Test</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p><strong>Test Order ID:</strong> {debugData.debug.orderDetailsTest.orderId}</p>
                      <p><strong>Order Found:</strong> {debugData.debug.orderDetailsTest.orderFound ? 'Yes' : 'No'}</p>
                      <p><strong>Order Items Count:</strong> {debugData.debug.orderDetailsTest.orderItemsCount}</p>
                      {debugData.debug.orderDetailsTest.orderData && (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <p><strong>Order Number:</strong> {debugData.debug.orderDetailsTest.orderData.order_number}</p>
                          <p><strong>Status:</strong> {debugData.debug.orderDetailsTest.orderData.status}</p>
                          <p><strong>Amount:</strong> ₹{debugData.debug.orderDetailsTest.orderData.total_amount}</p>
                        </div>
                      )}
                      {debugData.debug.orderDetailsTest.error && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-red-600">
                          <p><strong>Error:</strong> {debugData.debug.orderDetailsTest.error}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
