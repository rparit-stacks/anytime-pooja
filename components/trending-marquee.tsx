"use client"

import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-config"

export function TrendingMarquee() {
  const { data } = useSWR("/api/products", swrFetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0
  })
  
  const trendingProducts = (data?.products || [])
    .filter((product: any) => product.isFeatured)
    .slice(0, 8)
    .map((product: any) => ({
      src: product.image,
      label: product.name
    }))

  if (trendingProducts.length === 0) {
    return null // Don't show section if no trending products
  }
  return (
    <section aria-label="Trending products" className="py-10 md:py-14 border-t border-border">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Trending Now</h2>
      </div>
      <div className="overflow-hidden">
        <div className="relative">
          <div className="flex gap-6 animate-[marquee_20s_linear_infinite] will-change-transform">
            {[...trendingProducts, ...trendingProducts].map((item, i) => (
              <div
                key={i}
                className="shrink-0 w-[220px] md:w-[260px] bg-card rounded-lg border border-border overflow-hidden"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  {/* using native img to avoid CORS; images are local */}
                  <img
                    src={item.src || "/placeholder.svg"}
                    alt={item.label}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
          <style jsx>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      </div>
    </section>
  )
}
