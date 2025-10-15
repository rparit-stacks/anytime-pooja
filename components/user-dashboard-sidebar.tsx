"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  Settings, 
  LogOut,
  ChevronRight,
  Home,
  CreditCard,
  Bell,
  X,
  Edit
} from "lucide-react"

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  profile_image?: string
}

interface UserDashboardSidebarProps {
  className?: string
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function UserDashboardSidebar({ className, isMobileOpen = false, onMobileClose }: UserDashboardSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const menuItems = [
    {
      title: "Dashboard",
      href: "/profile",
      icon: Home,
      description: "Overview & Account"
    },
    {
      title: "My Orders",
      href: "/profile/orders",
      icon: Package,
      description: "Order History & Tracking"
    },
    {
      title: "Addresses",
      href: "/profile/addresses",
      icon: MapPin,
      description: "Manage Addresses"
    },
    {
      title: "Wishlist",
      href: "/profile/wishlist",
      icon: Heart,
      description: "Saved Items"
    },
    {
      title: "Payment Methods",
      href: "/profile/payment-methods",
      icon: CreditCard,
      description: "Cards & Wallets"
    },
    {
      title: "Notifications",
      href: "/profile/notifications",
      icon: Bell,
      description: "Alerts & Updates"
    },
    {
      title: "Account Settings",
      href: "/profile/settings",
      icon: Settings,
      description: "Profile & Preferences"
    },
    {
      title: "Quick Edit",
      href: "/profile/quick-edit",
      icon: Edit,
      description: "Edit Profile Instantly"
    }
  ]

  const handleLogout = () => {
    // Prevent multiple clicks
    if (loading) return
    
    setLoading(true)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    // Use router.push instead of window.location for better UX
    setTimeout(() => {
      window.location.href = '/login'
    }, 100)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        "lg:relative lg:translate-x-0",
        isMobileOpen ? "fixed inset-y-0 left-0 z-50 translate-x-0" : "fixed inset-y-0 left-0 z-50 -translate-x-full lg:translate-x-0",
        className
      )}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900">My Account</h2>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 h-8 w-8 hidden lg:flex"
              >
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed ? "rotate-0" : "rotate-180"
                )} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMobileClose}
                className="p-1 h-8 w-8 lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
              )} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.title}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {item.description}
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Info Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {user?.profile_image ? (
                <img 
                  src={user.profile_image} 
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : 'User Name'
                }
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={loading}
            className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            {loading ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      )}

      {/* Collapsed User Info */}
      {isCollapsed && (
        <div className="p-4 border-t border-gray-200 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={loading}
            className="w-full p-2 text-red-600 hover:bg-red-50"
            title={loading ? "Signing Out..." : "Sign Out"}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
      </div>
    </>
  )
}

// Mobile Menu Button Component
export function MobileMenuButton({ onToggle }: { onToggle: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="lg:hidden fixed top-4 left-4 z-50"
    >
      ☰ Menu
    </Button>
  )
}
