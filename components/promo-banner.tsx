"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-config"

interface PromoBanner {
  id: number
  banner_key: string
  banner_title: string
  banner_description: string
  banner_image: string
  button_text: string
  button_url: string
  banner_order: number
}

export function PromoBanner() {
  const { data: bannerData, error } = useSWR("/api/promo-banners", swrFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000 // 5 minutes
  })

  const banners = bannerData?.banners || []

  // Fallback data if API fails
  const fallbackBanners: PromoBanner[] = [
    {
      id: 1,
      banner_key: 'banner_1',
      banner_title: 'New Fashion Collection',
      banner_description: 'Elevate your style with our latest arrivals',
      banner_image: '/elegant-fashion-collection-banner.jpg',
      button_text: 'Shop Fashion',
      button_url: '/products?category=fashion',
      banner_order: 1
    },
    {
      id: 2,
      banner_key: 'banner_2',
      banner_title: 'Tech Essentials',
      banner_description: 'Discover cutting-edge electronics',
      banner_image: '/premium-electronics-technology-banner.jpg',
      button_text: 'Explore Tech',
      button_url: '/products?category=electronics',
      banner_order: 2
    }
  ]

  // Use API data or fallback
  const displayBanners = error ? fallbackBanners : banners

  if (displayBanners.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className={`grid gap-6 ${
          displayBanners.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' :
          displayBanners.length === 2 ? 'md:grid-cols-2' :
          displayBanners.length === 3 ? 'md:grid-cols-2 lg:grid-cols-3' :
          'md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {displayBanners.map((banner: PromoBanner) => (
            <Link
              key={banner.id}
              href={banner.button_url}
              className="group relative overflow-hidden rounded-lg h-[400px] md:h-[500px]"
            >
              <img
                src={banner.banner_image}
                alt={banner.banner_title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-banner.jpg'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">
                  {banner.banner_title}
                </h3>
                <p className="text-foreground/80 mb-4 text-pretty">
                  {banner.banner_description}
                </p>
                <Button>{banner.button_text}</Button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
