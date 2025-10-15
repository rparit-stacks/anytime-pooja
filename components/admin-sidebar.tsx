"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faHome,
  faBox,
  faTags,
  faImages,
  faShoppingCart,
  faUsers,
  faChartLine,
  faCog,
  faBars,
  faPlus,
  faList,
  faFire,
  faDatabase,
  faSlidersH,
  faBullhorn
} from "@fortawesome/free-solid-svg-icons"

interface AdminSidebarProps {
  onClose?: () => void
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['products'])

  const toggleExpanded = (item: string) => {
    setExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: faHome,
      href: '/admin',
      exact: true
    },
    {
      id: 'products',
      label: 'Products',
      icon: faBox,
      href: '/admin/products',
      children: [
        { label: 'All Products', href: '/admin/products', icon: faList },
        { label: 'Add Product', href: '/admin/products/new', icon: faPlus }
      ]
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: faTags,
      href: '/admin/categories',
      children: [
        { label: 'All Categories', href: '/admin/categories', icon: faList },
        { label: 'Add Category', href: '/admin/categories/new', icon: faPlus }
      ]
    },
    {
      id: 'sliders',
      label: 'Sliders',
      icon: faImages,
      href: '/admin/sliders',
      children: [
        { label: 'All Sliders', href: '/admin/sliders', icon: faList },
        { label: 'Add Slider', href: '/admin/sliders/new', icon: faPlus }
      ]
    },
    {
      id: 'promo-banners',
      label: 'Promo Banners',
      icon: faBullhorn,
      href: '/admin/promo-banners'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: faShoppingCart,
      href: '/admin/orders'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: faUsers,
      href: '/admin/customers'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: faChartLine,
      href: '/admin/analytics'
    },
    {
      id: 'sidebar',
      label: 'Sidebar Management',
      icon: faCog,
      href: '/admin/sidebar'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: faSlidersH,
      href: '/admin/settings'
    },
    {
      id: 'database',
      label: 'Database Status',
      icon: faDatabase,
      href: '/admin/database-status'
    }
  ]

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const isExpanded = (id: string) => expandedItems.includes(id)

  return (
    <div className="flex flex-col h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <FontAwesomeIcon icon={faBars} className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-semibold text-sm">Admin Panel</h2>
          <p className="text-xs text-muted-foreground">Anytime Pooja</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive(item.href) 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                    {item.label}
                  </div>
                  <FontAwesomeIcon 
                    icon={faBars} 
                    className={cn(
                      "h-3 w-3 transition-transform",
                      isExpanded(item.id) ? "rotate-90" : ""
                    )} 
                  />
                </button>
                
                {isExpanded(item.id) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                          isActive(child.href)
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        <FontAwesomeIcon icon={child.icon} className="h-3 w-3" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive(item.href, item.exact)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faFire} className="h-4 w-4 text-muted-foreground" />
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
