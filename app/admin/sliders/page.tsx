"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  ExternalLink,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface Slider {
  id: number
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  image: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export default function AdminSlidersPage() {
  const { toast } = useToast()
  const [sliders, setSliders] = useState<Slider[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    fetchSliders()
  }, [])

  const fetchSliders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/sliders')
      const data = await response.json()
      
      if (data.success) {
        setSliders(data.sliders || [])
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch sliders",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching sliders:', error)
      toast({
        title: "Error",
        description: "Failed to fetch sliders",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleSliderStatus = async (sliderId: number, currentStatus: boolean) => {
    try {
      setActionLoading(sliderId)
      
      const response = await fetch(`/api/admin/sliders/${sliderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...sliders.find(s => s.id === sliderId),
          is_active: !currentStatus
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSliders(prev => prev.map(slider => 
          slider.id === sliderId 
            ? { ...slider, is_active: !currentStatus }
            : slider
        ))
        
        toast({
          title: "Success",
          description: `Slider ${!currentStatus ? 'activated' : 'deactivated'} successfully`
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update slider status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating slider status:', error)
      toast({
        title: "Error",
        description: "Failed to update slider status",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const deleteSlider = async (sliderId: number, sliderTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${sliderTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      setActionLoading(sliderId)
      
      const response = await fetch(`/api/admin/sliders/${sliderId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSliders(prev => prev.filter(slider => slider.id !== sliderId))
        
        toast({
          title: "Success",
          description: data.message || "Slider deleted successfully"
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete slider",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting slider:', error)
      toast({
        title: "Error",
        description: "Failed to delete slider",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const updateSortOrder = async (sliderId: number, direction: 'up' | 'down') => {
    const currentSlider = sliders.find(s => s.id === sliderId)
    if (!currentSlider) return

    const currentIndex = sliders.findIndex(s => s.id === sliderId)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= sliders.length) return

    const targetSlider = sliders[targetIndex]
    
    try {
      setActionLoading(sliderId)
      
      // Update both sliders' sort orders
      const updatePromises = [
        fetch(`/api/admin/sliders/${sliderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...currentSlider,
            sort_order: targetSlider.sort_order
          })
        }),
        fetch(`/api/admin/sliders/${targetSlider.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...targetSlider,
            sort_order: currentSlider.sort_order
          })
        })
      ]

      const responses = await Promise.all(updatePromises)
      const results = await Promise.all(responses.map(r => r.json()))

      if (results.every(r => r.success)) {
        // Update local state
        setSliders(prev => {
          const newSliders = [...prev]
          newSliders[currentIndex] = { ...currentSlider, sort_order: targetSlider.sort_order }
          newSliders[targetIndex] = { ...targetSlider, sort_order: currentSlider.sort_order }
          return newSliders.sort((a, b) => a.sort_order - b.sort_order)
        })
        
        toast({
          title: "Success",
          description: "Sort order updated successfully"
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update sort order",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating sort order:', error)
      toast({
        title: "Error",
        description: "Failed to update sort order",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading sliders...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sliders</h1>
          <p className="text-muted-foreground">
            Manage hero section sliders for your homepage
          </p>
        </div>
        <Link href="/admin/sliders/new">
          <Button className="no-transition">
            <Plus className="h-4 w-4 mr-2" />
            Add New Slider
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Sliders</p>
                <p className="text-2xl font-bold">{sliders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Active Sliders</p>
                <p className="text-2xl font-bold text-green-600">
                  {sliders.filter(s => s.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Inactive Sliders</p>
                <p className="text-2xl font-bold text-red-600">
                  {sliders.filter(s => !s.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sliders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Sliders</CardTitle>
        </CardHeader>
        <CardContent>
          {sliders.length === 0 ? (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sliders found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first slider for the homepage hero section.
              </p>
              <Link href="/admin/sliders/new">
                <Button className="no-transition">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Slider
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subtitle</TableHead>
                    <TableHead>CTA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sliders.map((slider, index) => (
                    <TableRow key={slider.id}>
                      <TableCell>
                        <div className="w-16 h-10 rounded-md overflow-hidden bg-muted">
                          <img 
                            src={slider.image} 
                            alt={slider.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-banner.jpg"
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {slider.title}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {slider.subtitle || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{slider.cta_text}</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={slider.is_active ? "default" : "secondary"}>
                          {slider.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateSortOrder(slider.id, 'up')}
                            disabled={index === 0 || actionLoading === slider.id}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-mono w-8 text-center">
                            {slider.sort_order}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateSortOrder(slider.id, 'down')}
                            disabled={index === sliders.length - 1 || actionLoading === slider.id}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(slider.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              disabled={actionLoading === slider.id}
                            >
                              {actionLoading === slider.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/sliders/${slider.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toggleSliderStatus(slider.id, slider.is_active)}
                            >
                              {slider.is_active ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteSlider(slider.id, slider.title)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
