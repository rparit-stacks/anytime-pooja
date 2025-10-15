"use client"

import Link from "next/link"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-config"

export function HomeInfoCards() {
  const { data } = useSWR("/api/categories", swrFetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0
  })
  
  const items = (data?.categories || [])
    .slice(0, 4)
    .map((cat: any) => ({
      title: cat.name,
      desc: cat.description || "Explore our curated collection",
      href: `/products?category=${cat.slug}`
    }))

  if (items.length === 0) {
    return null // Don't show section if no categories
  }
  return (
    <section className="py-10 md:py-14">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-balance">Explore Spiritual Collections</h2>
          <p className="text-muted-foreground">Handpicked items to elevate your rituals</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it: any) => (
            <Link
              key={it.title}
              href={it.href}
              className="group rounded-xl border border-border bg-card p-5 hover:bg-card/70 transition-colors"
            >
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold">{it.title}</h3>
                <p className="text-sm text-muted-foreground">{it.desc}</p>
                <span className="text-sm font-medium text-primary group-hover:underline mt-2">Shop now →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
