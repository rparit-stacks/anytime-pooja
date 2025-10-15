"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading"

export function GlobalLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("Loading...")

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsLoading(true)
      setLoadingText("Loading page...")
    }

    const handleRouteChangeComplete = () => {
      setIsLoading(false)
    }

    const handleRouteChangeError = () => {
      setIsLoading(false)
    }

    // Listen for route changes
    const originalPush = window.history.pushState
    const originalReplace = window.history.replaceState

    window.history.pushState = function(...args) {
      handleRouteChangeStart()
      return originalPush.apply(this, args)
    }

    window.history.replaceState = function(...args) {
      handleRouteChangeStart()
      return originalReplace.apply(this, args)
    }

    // Listen for popstate events (back/forward buttons)
    window.addEventListener('popstate', handleRouteChangeStart)

    // Cleanup
    return () => {
      window.history.pushState = originalPush
      window.history.replaceState = originalReplace
      window.removeEventListener('popstate', handleRouteChangeStart)
    }
  }, [])

  // Auto-hide loading after 3 seconds as fallback
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background/95 backdrop-blur-md border border-border rounded-lg p-8 shadow-2xl">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner className="h-8 w-8 text-primary" />
          <p className="text-foreground font-medium">{loadingText}</p>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for manual loading control
export function useGlobalLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("Loading...")

  const startLoading = (text = "Loading...") => {
    setLoadingText(text)
    setIsLoading(true)
  }

  const stopLoading = () => {
    setIsLoading(false)
  }

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading
  }
}
