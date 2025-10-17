"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function TestPage() {
  const [testValue, setTestValue] = useState("all")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test Page</h1>
        <p className="text-muted-foreground">Testing Select components and database</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Select Component</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Test Select</label>
              <Select value={testValue} onValueChange={setTestValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Options</SelectItem>
                  <SelectItem value="option1">Option 1</SelectItem>
                  <SelectItem value="option2">Option 2</SelectItem>
                  <SelectItem value="option3">Option 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <p>Current Value: <strong>{testValue}</strong></p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/categories')
                const data = await response.json()
                console.log('Categories response:', data)
                alert(`Categories fetched: ${data.categories?.length || 0} items`)
              } catch (error) {
                console.error('Error:', error)
                alert('Error fetching categories: ' + error)
              }
            }}
          >
            Test Categories API
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


