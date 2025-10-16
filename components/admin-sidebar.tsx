"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Home,
  Package,
  ShoppingCart,
  Tags,
  Settings,
  ChevronRight,
  Lock,
  Image,
  Smartphone
} from "lucide-react"

interface AdminSidebarProps {
  onClose?: () => void
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      href: '/admin',
      exact: true
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      href: '/admin/products'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      href: '/admin/orders'
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Tags,
      href: '/admin/categories'
    },
    {
      id: 'sliders',
      label: 'Sliders',
      icon: Image,
      href: '/admin/sliders'
    },
    {
      id: 'mobile-categories',
      label: 'Mobile Categories',
      icon: Smartphone,
      href: '/admin/mobile-categories'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/admin/settings'
    }
  ]

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Lock className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-semibold text-sm">Admin Panel</h2>
          <p className="text-xs text-muted-foreground">Anytime Pooja</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              isActive(item.href, item.exact)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
            {isActive(item.href, item.exact) && (
              <ChevronRight className="h-3 w-3 ml-auto" />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}
