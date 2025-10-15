"use client"

import Link from "next/link"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-config"

export function ProductSpotlight() {
  const { data } = useSWR("/api/products", swrFetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0
  })
  
  const spotlightProducts = (data?.products || [])
    .filter((product: any) => product.isFeatured)
    .slice(0, 4)
    .map((product: any) => ({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price
    }))

  if (spotlightProducts.length === 0) {
    return null // Don't show section if no featured products
  }
  return (
    <section aria-label="Product spotlight" className="py-12 md:py-16 border-t border-border">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Product Spotlight</h2>
          <Link href="/products" className="text-sm font-medium hover:underline">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {spotlightProducts.map((p, i) => (
            <Link
              href={`/products/${p.id}`}
              key={p.id}
              className="group rounded-lg overflow-hidden border border-border bg-card transform-gpu transition-all duration-500 hover:-translate-y-1 hover:shadow-lg opacity-0 translate-y-6"
              style={{ animation: `reveal 700ms ease forwards`, animationDelay: `${i * 120}ms` } as any}
            >
              <div className="relative aspect-[4/3] bg-muted">
                <img
                  src={p.image || "/placeholder.svg"}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2 line-clamp-2">{p.name}</h3>
                <p className="text-sm text-muted-foreground">₹{p.price.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes reveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}
