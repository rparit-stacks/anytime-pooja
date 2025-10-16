"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import useSWR from "swr"
import { useState, useRef, useEffect } from "react"
import dynamic from "next/dynamic"

interface MobileCategory {
  mobile_category_id: number
  sort_order: number
  mobile_category_active: boolean
  mobile_category_created_at: string
  mobile_category_image: string
  category_id: number
  category_name: string
  category_slug: string
  category_image: string
  category_active: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function MobileCategoryMarqueeComponent() {
  const { data, error, isLoading } = useSWR<{
    success: boolean
    categories: MobileCategory[]
  }>('/api/mobile-categories', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0
  })

  console.log('MobileCategoryMarquee - isLoading:', isLoading)
  console.log('MobileCategoryMarquee - error:', error)
  console.log('MobileCategoryMarquee - data:', data)

  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const marqueeRef = useRef<HTMLDivElement>(null)

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].pageX)
    if (marqueeRef.current) {
      setScrollLeft(marqueeRef.current.scrollLeft)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.touches[0].pageX
    const walk = (startX - x) * 1.5 // Reduced multiplier for smoother scroll
    if (marqueeRef.current) {
      marqueeRef.current.scrollLeft = scrollLeft + walk
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Mouse handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX)
    if (marqueeRef.current) {
      setScrollLeft(marqueeRef.current.scrollLeft)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX
    const walk = (startX - x) * 1.5
    if (marqueeRef.current) {
      marqueeRef.current.scrollLeft = scrollLeft + walk
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  if (isLoading) {
    return (
      <div className="block md:hidden py-4 bg-gradient-to-r from-background to-muted/20">
        <div className="flex gap-2 px-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-20 h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    console.error('Mobile Categories Error:', error)
    return (
      <div className="block md:hidden py-4 bg-gradient-to-r from-background to-muted/20">
        <div className="text-center text-red-500 text-sm">
          Error loading mobile categories
        </div>
      </div>
    )
  }

  if (!data?.success) {
    console.log('Mobile Categories: No success response')
    return (
      <div className="block md:hidden py-4 bg-gradient-to-r from-background to-muted/20">
        <div className="text-center text-muted-foreground text-sm">
          No mobile categories data
        </div>
      </div>
    )
  }

  if (!data.categories?.length) {
    console.log('Mobile Categories: No categories found', data)
    return (
      <div className="block md:hidden py-4 bg-gradient-to-r from-background to-muted/20">
        <div className="text-center text-muted-foreground text-sm">
          No mobile categories available
        </div>
      </div>
    )
  }

  const { categories } = data

  // Create extended array for seamless marquee looping
  const extendedCategories = [...categories, ...categories, ...categories]

  return (
    <section className="block md:hidden py-4 bg-gradient-to-r from-background to-muted/20">
      {/* Marquee Container - Edge to Edge */}
      <div className="relative overflow-x-auto overflow-y-hidden">
        <div 
          ref={marqueeRef}
          className="flex gap-2 py-2"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {extendedCategories.map((category, index) => (
            <div
              key={`${category.category_id}-${index}`}
              className="flex-shrink-0 w-20 ml-2"
            >
              <Link href={`/products?category=${category.category_slug}`}>
                <div className="group cursor-pointer transition-all duration-300 hover:scale-105">
                  {/* Category Image - Square with rounded corners */}
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-muted border-2 border-border/20 shadow-sm">
                    <img
                        src={category.mobile_category_image || category.category_image || "/placeholder.jpg"}
                      alt={category.category_name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.jpg"
                      }}
                    />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Export with dynamic import to avoid SSR issues
export const MobileCategoryMarquee = dynamic(() => Promise.resolve(MobileCategoryMarqueeComponent), {
  ssr: false,
  loading: () => (
    <div className="block md:hidden py-4 bg-gradient-to-r from-background to-muted/20">
      <div className="flex gap-2 px-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-20 h-20 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
})
