"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminAuthGuard } from "@/components/admin-auth-guard"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if current page is a login page
  const isLoginPage = pathname?.includes('/login') || pathname?.includes('/quick-login')

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // If it's a login page, don't wrap with AdminAuthGuard
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-background flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0
        `}>
          <AdminSidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Top bar */}
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Anytime Pooja</span>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  )
}
