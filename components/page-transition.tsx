"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading"

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionText, setTransitionText] = useState("Loading...")

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        const href = link.getAttribute('href')
        
        // Check if it's an internal link
        if (href && (href.startsWith('/') || href.includes(window.location.hostname))) {
          e.preventDefault()
          setIsTransitioning(true)
          setTransitionText("Loading page...")
          
          // Navigate after a short delay to show loading
          setTimeout(() => {
            window.location.href = href
          }, 100)
        }
      }
    }

    const handleFormSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement
      if (form.method === 'post' || form.method === 'POST') {
        setIsTransitioning(true)
        setTransitionText("Processing...")
      }
    }

    // Add event listeners
    document.addEventListener('click', handleLinkClick)
    document.addEventListener('submit', handleFormSubmit)

    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick)
      document.removeEventListener('submit', handleFormSubmit)
    }
  }, [])

  // Auto-hide transition after 5 seconds as fallback
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isTransitioning])

  return (
    <>
      {children}
      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in-up">
          <div className="bg-background/95 backdrop-blur-lg border border-border rounded-xl p-8 shadow-2xl max-w-sm mx-4 animate-scale-in animate-pulse-glow">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <LoadingSpinner className="h-12 w-12 text-primary" />
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse"></div>
              </div>
              <div className="text-center">
                <p className="text-foreground font-semibold text-lg mb-2 animate-shimmer">{transitionText}</p>
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Hook for manual page transition control
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionText, setTransitionText] = useState("Loading...")

  const startTransition = (text = "Loading...") => {
    setTransitionText(text)
    setIsTransitioning(true)
  }

  const stopTransition = () => {
    setIsTransitioning(false)
  }

  const navigateWithTransition = (url: string, text = "Loading page...") => {
    startTransition(text)
    setTimeout(() => {
      window.location.href = url
    }, 100)
  }

  return {
    isTransitioning,
    transitionText,
    startTransition,
    stopTransition,
    navigateWithTransition
  }
}
