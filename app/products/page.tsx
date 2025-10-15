"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SlidersHorizontal, X } from "lucide-react"
import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { formatINR } from "@/lib/currency"
import { swrFetcher } from "@/lib/swr-config"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category") || "all"

  const { data: productsData, error: productsError } = useSWR("/api/products", swrFetcher)
  const { data: categoriesData, error: categoriesError } = useSWR("/api/categories", swrFetcher)
  
  console.log('Products page data:', {
    productsData,
    productsError,
    categoriesData,
    categoriesError,
    categoryParam
  })
  
  const allProducts = (productsData?.products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    image: p.image,
    price: Number(p.price),
    originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
    rating: p.rating || 0,
    reviews: p.reviews || 0,
    category: p.category || "all",
    badge: p.badge || undefined,
  }))

  const categories = [
    { id: "all", label: "All Products" },
    ...(categoriesData?.categories || []).map((cat: any) => ({
      id: cat.slug,
      label: cat.name
    }))
  ]

  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryParam !== "all" ? [categoryParam] : [])
  const [priceRange, setPriceRange] = useState([0, 600])
  const [sortBy, setSortBy] = useState("featured")
  const [showFilters, setShowFilters] = useState(false)

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts

    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product: any) => selectedCategories.includes(product.category))
    }

    // Filter by price range
    filtered = filtered.filter((product: any) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Sort products
    const sorted = [...filtered]
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        sorted.sort((a, b) => b.price - a.price)
        break
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        // In a real app, you'd sort by date
        break
      default:
        // Featured - keep original order
        break
    }

    console.log('Filtered products:', {
      allProducts: allProducts.length,
      filtered: filtered.length,
      selectedCategories,
      priceRange,
      sortBy
    })
    
    return sorted
  }, [selectedCategories, priceRange, sortBy])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 600])
    setSortBy("featured")
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Page Header */}
        <section className="bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
              {categoryParam !== "all"
                ? categories.find((c) => c.id === categoryParam)?.label || "Shop All"
                : "Shop All Products"}
            </h1>
            <p className="text-muted-foreground text-lg text-pretty">
              Discover our curated collection of premium products
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar - Desktop */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="sticky top-24">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-lg">Filters</h2>
                    {(selectedCategories.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 600) && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm">
                        Clear All
                      </Button>
                    )}
                  </div>

                  {/* Category Filter */}
                  <div className="mb-8">
                    <h3 className="font-medium mb-4">Category</h3>
                    <div className="space-y-3">
                      {categories.slice(1).map((category) => (
                        <div key={category.id} className="flex items-center gap-2">
                          <Checkbox
                            id={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() => toggleCategory(category.id)}
                          />
                          <Label htmlFor={category.id} className="text-sm cursor-pointer">
                            {category.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div className="mb-8">
                    <h3 className="font-medium mb-4">Price Range</h3>
                    <Slider
                      min={0}
                      max={600}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-4"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatINR(priceRange[0])}</span>
                      <span>{formatINR(priceRange[1])}</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <p className="text-muted-foreground">Showing {filteredAndSortedProducts.length} products</p>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Mobile Filter Button */}
                    <Button
                      variant="outline"
                      className="lg:hidden flex-1 sm:flex-none bg-transparent"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>

                    {/* Sort Dropdown */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Mobile Filters */}
                {showFilters && (
                  <div className="lg:hidden mb-8 p-6 bg-card rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-semibold text-lg">Filters</h2>
                      <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-6">
                      <h3 className="font-medium mb-4">Category</h3>
                      <div className="space-y-3">
                        {categories.slice(1).map((category) => (
                          <div key={category.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`mobile-${category.id}`}
                              checked={selectedCategories.includes(category.id)}
                              onCheckedChange={() => toggleCategory(category.id)}
                            />
                            <Label htmlFor={`mobile-${category.id}`} className="text-sm cursor-pointer">
                              {category.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Filter */}
                    <div className="mb-6">
                      <h3 className="font-medium mb-4">Price Range</h3>
                      <Slider
                        min={0}
                        max={600}
                        step={10}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="mb-4"
                      />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{formatINR(priceRange[0])}</span>
                        <span>{formatINR(priceRange[1])}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 bg-transparent" onClick={clearFilters}>
                        Clear All
                      </Button>
                      <Button className="flex-1" onClick={() => setShowFilters(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                )}

                {/* Products Grid */}
                {filteredAndSortedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedProducts.map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg mb-4">No products found matching your filters</p>
                    <Button onClick={clearFilters}>Clear Filters</Button>
                  </div>
                )}

                {/* Pagination */}
                {filteredAndSortedProducts.length > 0 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" disabled>
                        Previous
                      </Button>
                      <Button variant="default">1</Button>
                      <Button variant="outline">2</Button>
                      <Button variant="outline">3</Button>
                      <Button variant="outline">Next</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
