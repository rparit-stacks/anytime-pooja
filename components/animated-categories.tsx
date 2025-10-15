"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-config"

export function AnimatedCategories() {
  const { data, error, isLoading } = useSWR("/api/categories", swrFetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0
  })
  
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const cards = Array.from(container.querySelectorAll("[data-cat-card]")) as HTMLElement[]

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0")
          }
        })
      },
      { threshold: 0.1 },
    )

    cards.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  
  const categories = (data?.categories || [])
    .slice(0, 6)
    .map((cat: any) => ({
      href: `/products?category=${cat.slug}`,
      title: cat.name,
      image: cat.image || "/placeholder.svg"
    }))

  if (isLoading) {
    return (
      <section aria-label="Shop by category" className="py-12 md:py-16">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/3] bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section aria-label="Shop by category" className="py-12 md:py-16">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Shop by Category</h2>
          <p className="text-muted-foreground">Error loading categories: {error.message}</p>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return (
      <section aria-label="Shop by category" className="py-12 md:py-16">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Shop by Category</h2>
          <p className="text-muted-foreground">No categories available</p>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Shop by category" className="py-12 md:py-16">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Shop by Category</h2>
        <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <Link
              key={cat.title}
              href={cat.href}
              data-cat-card
              className="group relative overflow-hidden rounded-lg border border-border bg-card opacity-100 translate-y-0 transition-all duration-700 hover:shadow-lg hover:scale-105"
              style={{ 
                transitionDelay: `${(i % 3) * 100}ms`,
                zIndex: 10
              }}
            >
              <div className="relative aspect-[4/3]">
                <img
                  src={cat.image || "/placeholder.svg"}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/0" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <span className="inline-block rounded bg-white/90 px-3 py-1 text-sm font-medium text-gray-900">{cat.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
