"use client"
import Link from "next/link"
import { Shirt, Laptop, Home, Watch, Sparkles, Package, Gem, BookOpen, Flame, Star } from "lucide-react"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-config"

// Icon mapping for categories
const iconMap: { [key: string]: any } = {
  'crystals': Gem,
  'tarot': BookOpen,
  'pooja': Star,
  'incense': Flame,
  'books': BookOpen,
  'meditation': Sparkles,
  'rudraksha': Package,
  'yantras': Star,
  'vastu': Home,
  'fengshui': Sparkles
}

export function CategorySection() {
  const { data, error, isLoading } = useSWR("/api/categories", swrFetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0
  })
  
  const apiCategories = data?.categories || []
  
  const categories = apiCategories.map((cat: any) => ({
    name: cat.name,
    slug: cat.slug,
    icon: iconMap[cat.slug] || Package,
    link: `/products?category=${cat.slug}`,
    image: cat.image || "/placeholder.svg",
  }))

  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
              Loading categories...
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 md:py-24">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
              Error loading categories: {error.message}
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 md:py-24">
        <div className="w-full px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
              No categories available
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            Shop by Category
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Explore our curated collections of premium products
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category: any, index: number) => {
            const Icon = category.icon
            return (
              <Link
                key={category.name}
                href={category.link}
                className="group relative overflow-hidden rounded-lg bg-card border border-border hover:shadow-lg transition-all duration-300 hover:scale-105"
                style={{ 
                  zIndex: 10,
                  opacity: 1,
                  visibility: 'visible'
                }}
              >
                <div className="aspect-square relative">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                    <Icon className="h-5 w-5 mx-auto mb-1 text-white" />
                    <h3 className="font-medium text-white text-xs md:text-sm leading-tight">{category.name}</h3>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
