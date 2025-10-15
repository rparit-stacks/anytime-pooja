"use client"

import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function Loading({ size = "md", className, text }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  )
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("animate-spin rounded-full border-2 border-muted border-t-primary h-4 w-4", className)} />
  )
}

export function LoadingOverlay({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border border-border rounded-lg p-6 shadow-lg">
        <Loading size="lg" text={text} />
      </div>
    </div>
  )
}

export function LoadingCard({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8 border border-border rounded-lg">
      <Loading text={text} />
    </div>
  )
}
