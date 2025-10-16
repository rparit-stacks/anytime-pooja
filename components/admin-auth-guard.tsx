"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Loader2 } from "lucide-react"

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const adminAuth = localStorage.getItem("admin_authenticated")
        const adminUser = localStorage.getItem("admin_user")
        
        if (adminAuth === "true" && adminUser) {
          const user = JSON.parse(adminUser)
          // Check if login is not too old (24 hours)
          const loginTime = new Date(user.loginTime)
          const now = new Date()
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)
          
          if (hoursDiff < 24) {
            setIsAuthenticated(true)
          } else {
            // Session expired
            localStorage.removeItem("admin_authenticated")
            localStorage.removeItem("admin_user")
            setIsAuthenticated(false)
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated")
    localStorage.removeItem("admin_user")
    router.push("/admin/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You need to be logged in as an admin to access this page.
            </p>
            <Button onClick={() => router.push("/admin/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Admin Header with Logout */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Lock className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">Anytime Pooja</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}
