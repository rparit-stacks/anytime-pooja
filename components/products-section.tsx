"use client"
import { ProductCard } from "./product-card"
import { Button } from "@/components/ui/button"
import { RefreshButton } from "./refresh-button"
import Link from "next/link"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-config"


export function ProductsSection() {
  const { data, mutate } = useSWR("/api/products", swrFetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0
  })
  const apiProducts = (data?.products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    image: p.image,
    price: Number(p.price),
    originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
    rating: p.rating || 0,
    reviews: p.reviews || 0,
    badge: p.badge || undefined,
  }))

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 text-balance">
              Trending Now
            </h2>
            <p className="text-muted-foreground text-lg text-pretty">Discover our most popular products</p>
          </div>
          <div className="flex items-center gap-4">
            <RefreshButton onRefresh={() => mutate()} />
            <Link href="/products" className="hidden md:block">
              <Button variant="outline" size="lg">
                View All
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {apiProducts.slice(0, 8).map((product: any) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        <div className="mt-12 text-center md:hidden">
          <Link href="/products">
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
