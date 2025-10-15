"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-config"

export default function SearchPage() {
  const [q, setQ] = useState("")

  const { data } = useSWR(() => `/api/products${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`, swrFetcher)
  const results = (data?.products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    image: p.image,
    price: Number(p.price),
    originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
    rating: p.rating || 0,
    reviews: p.reviews || 0,
  }))

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="bg-muted/30 py-10 md:py-14">
          <div className="container mx-auto px-4 lg:px-8">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-balance mb-4">Search</h1>
            <p className="text-muted-foreground">Find products across categories</p>
            <div className="mt-6 max-w-2xl">
              <Input
                placeholder="Search products, categories..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4 lg:px-8">
            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((p: any) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No results found.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
