"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus, Eye, Check, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Slider {
  id: string
  title: string
  subtitle: string
  cta: string
  link: string
  image: string
  isActive: boolean
  sortOrder: number
}

export default function SlidersPage() {
  const [sliders, setSliders] = useState<Slider[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  useEffect(() => {
    fetchSliders()
  }, [])

  const fetchSliders = async () => {
    try {
      const response = await fetch('/api/admin/sliders')
      const data = await response.json()
      setSliders(data.sliders || [])
    } catch (error) {
      console.error('Error fetching sliders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(sliders.map(slider => slider.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (sliderId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, sliderId])
    } else {
      setSelectedItems(prev => prev.filter(id => id !== sliderId))
    }
  }

  const handleBulkActivate = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to activate')
      return
    }

    setBulkActionLoading(true)
    try {
      const promises = selectedItems.map(id => 
        fetch(`/api/admin/sliders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: true })
        })
      )

      await Promise.all(promises)
      setSliders(prev => prev.map(slider => 
        selectedItems.includes(slider.id) ? { ...slider, isActive: true } : slider
      ))
      setSelectedItems([])
      alert(`${selectedItems.length} sliders activated successfully`)
    } catch (err) {
      alert('Failed to activate sliders')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const handleBulkDeactivate = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to deactivate')
      return
    }

    setBulkActionLoading(true)
    try {
      const promises = selectedItems.map(id => 
        fetch(`/api/admin/sliders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false })
        })
      )

      await Promise.all(promises)
      setSliders(prev => prev.map(slider => 
        selectedItems.includes(slider.id) ? { ...slider, isActive: false } : slider
      ))
      setSelectedItems([])
      alert(`${selectedItems.length} sliders deactivated successfully`)
    } catch (err) {
      alert('Failed to deactivate sliders')
    } finally {
      setBulkActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">Loading sliders...</div>
    )
  }

  return (
    <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-balance">
                Slider Management
              </h1>
              <p className="text-muted-foreground">
                Manage your hero slider banners
              </p>
            </div>
            <div className="flex gap-2">
              {selectedItems.length > 0 && (
                <>
                  <Button 
                    onClick={handleBulkActivate}
                    disabled={bulkActionLoading}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Activate ({selectedItems.length})
                  </Button>
                  <Button 
                    onClick={handleBulkDeactivate}
                    disabled={bulkActionLoading}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Deactivate ({selectedItems.length})
                  </Button>
                </>
              )}
              <Link href="/admin/sliders/new">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Slider
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hero Sliders ({sliders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedItems.length === sliders.length && sliders.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subtitle</TableHead>
                    <TableHead>CTA</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sliders.map((slider) => (
                    <TableRow key={slider.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(slider.id)}
                          onCheckedChange={(checked) => handleSelectItem(slider.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-20 h-12 relative">
                          <Image
                            src={slider.image || "/placeholder-banner.jpg"}
                            alt={slider.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{slider.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {slider.subtitle}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{slider.cta}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {slider.link}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{slider.sortOrder}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={slider.isActive ? "default" : "secondary"}>
                          {slider.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/sliders/${slider.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
