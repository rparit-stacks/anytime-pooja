"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import useSWR from "swr"
import { swrFetcher } from "@/lib/swr-config"

interface HomepageLoadingProps {
  children: React.ReactNode
}

export function HomepageLoading({ children }: HomepageLoadingProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  
  // Fetch settings data for logo
  const { data: settingsData } = useSWR("/api/settings", swrFetcher)
  
  const logoSettings = settingsData?.logo || {
    logoUrl: '/images/logo.png',
    logoWidth: 200,
    logoHeight: 60
  }
  
  // Fallback logo if settings not loaded yet
  const logoUrl = logoSettings.logoUrl || '/images/logo.png'

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    // Minimum loading time of 2 seconds
    const minLoadingTime = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    // Also check if page is fully loaded
    const checkPageLoad = () => {
      if (document.readyState === 'complete') {
        setTimeout(() => {
          setIsLoading(false)
        }, 500) // Small delay for smooth transition
      }
    }

    window.addEventListener('load', checkPageLoad)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(minLoadingTime)
      window.removeEventListener('load', checkPageLoad)
    }
  }, [])

  if (!isLoading) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="flex flex-col items-center space-y-8">
        {/* Logo with animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-background/90 backdrop-blur-sm border border-border rounded-full p-8 shadow-2xl">
            <img
              src={logoUrl}
              alt="Anytime Pooja"
              className=""
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'contain',
                maxWidth: `${logoSettings.logoWidth}px`,
                maxHeight: `${logoSettings.logoHeight}px`
              }}
              onError={(e) => {
                // Fallback to default logo if custom logo fails to load
                e.currentTarget.src = '/images/logo.png'
              }}
            />
          </div>
        </div>

        {/* Loading text */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground animate-pulse">
            {settingsData?.site_name || 'Anytime Pooja'}
          </h1>
          <p className="text-muted-foreground">
            {settingsData?.loading_text || 'Loading your spiritual journey...'}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Loading</span>
            <span>{Math.round(loadingProgress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}

// Add custom CSS for slow spin animation
const styles = `
  @keyframes spin-slow {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style")
  styleSheet.type = "text/css"
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
}
