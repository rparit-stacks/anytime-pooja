"use client"

import Link from "next/link"
import { ShoppingCart, Menu, Search, User, ChevronDown, Package, Home, Info, Tag, Percent, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useCart } from "@/lib/cart-context"
import { useHydrationSafe } from "@/lib/use-hydration-safe"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-config"
import { toast } from "sonner"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const isHydrated = useHydrationSafe()
  const { totalItems } = useCart()

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (userData && token) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logged out successfully!')
    window.location.href = '/'
  }

  const { data } = useSWR("/api/categories", swrFetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 0
  })

  const { data: settingsData } = useSWR("/api/settings", swrFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 300000 // 5 minutes
  })
  
  const astrologyCategories = (data?.categories || [])
    .slice(0, 10)
    .map((cat: any) => ({
      name: cat.name,
      href: `/products?category=${cat.slug}`
    }))

  const logoSettings = settingsData?.logo || {
    logoUrl: '/images/logo.png',
    logoWidth: 200,
    logoHeight: 60
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="Anytime Pooja home">
            <img 
              src={logoSettings.logoUrl} 
              alt="Anytime Pooja logo" 
              className="h-14 md:h-16 w-auto"
              style={{
                maxWidth: `${logoSettings.logoWidth}px`,
                maxHeight: `${logoSettings.logoHeight}px`
              }}
            />
            <span className="sr-only">Anytime Pooja</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              <Info className="h-4 w-4" />
              About
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            
            {/* Category Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setCategoryDropdownOpen(true)}
              onMouseLeave={() => setCategoryDropdownOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
                <Tag className="h-4 w-4" />
                Category
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {/* Floating Dropdown */}
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    {astrologyCategories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Link
              href="/cart"
              className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
            </Link>
            <Link
              href="/products?category=sale"
              className="flex items-center gap-1 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
            >
              <Percent className="h-4 w-4" />
              Sale
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Link href="/search" className="hidden md:flex">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            </Link>
            
            {/* User Account */}
            {!loading && (
              <>
                {user ? (
                  <div 
                    className="relative hidden md:block"
                    onMouseEnter={() => setUserDropdownOpen(true)}
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                      <span className="sr-only">Account</span>
                    </Button>
                    
                    {/* User Dropdown */}
                    {userDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50">
                        <div className="p-4 border-b border-border">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{user.first_name} {user.last_name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            My Account
                          </Link>
                          <Link
                            href="/profile/orders"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            <Package className="h-4 w-4" />
                            My Orders
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/login" className="hidden md:flex">
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                      <span className="sr-only">Account</span>
                    </Button>
                  </Link>
                )}
              </>
            )}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {isHydrated && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Shopping cart</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {/* User Section */}
              {!loading && (
                <>
                  {user ? (
                    <div className="p-4 bg-accent/50 rounded-lg mb-2">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href="/profile"
                          className="flex-1 text-center px-3 py-2 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                          My Account
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex-1 text-center px-3 py-2 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors p-2 bg-accent/50 rounded-lg"
                    >
                      <User className="h-4 w-4" />
                      Sign In
                    </Link>
                  )}
                </>
              )}
              
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
              >
                <Info className="h-4 w-4" />
                About
              </Link>
              <Link
                href="/products"
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
              >
                <Package className="h-4 w-4" />
                Products
              </Link>
              
              {/* Mobile Categories */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground/60">Categories:</div>
                {astrologyCategories.map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="block text-sm text-foreground hover:text-foreground/80 transition-colors ml-4"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              
              <Link
                href="/cart"
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart
              </Link>
              <Link
                href="/products?category=sale"
                className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
              >
                <Percent className="h-4 w-4" />
                Sale
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

