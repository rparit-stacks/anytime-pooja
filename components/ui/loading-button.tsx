"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends React.ComponentProps<'button'> {
  loadingText?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>
  children?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg'
  className?: string
  disabled?: boolean
}

export function LoadingButton({ 
  children, 
  loadingText = "Loading...", 
  onClick, 
  className,
  disabled,
  ...props 
}: LoadingButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading || isPending) return

    setIsLoading(true)
    
    startTransition(async () => {
      try {
        if (onClick) {
          await onClick(e)
        }
      } catch (error) {
        console.error('Button click error:', error)
      } finally {
        setIsLoading(false)
      }
    })
  }

  const isButtonLoading = isLoading || isPending

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled || isButtonLoading}
      className={cn(
        "relative",
        isButtonLoading && "cursor-not-allowed",
        className
      )}
    >
      {isButtonLoading && (
        <LoadingSpinner className="mr-2 h-4 w-4" />
      )}
      {isButtonLoading ? loadingText : children}
    </Button>
  )
}

// Specialized loading buttons
export function LoadingSubmitButton({ 
  children = "Submit", 
  loadingText = "Submitting...", 
  ...props 
}: Omit<LoadingButtonProps, 'type'>) {
  return (
    <LoadingButton
      type="submit"
      loadingText={loadingText}
      {...props}
    >
      {children}
    </LoadingButton>
  )
}

export function LoadingSaveButton({ 
  children = "Save", 
  loadingText = "Saving...", 
  ...props 
}: LoadingButtonProps) {
  return (
    <LoadingButton
      type="submit"
      loadingText={loadingText}
      {...props}
    >
      {children}
    </LoadingButton>
  )
}

export function LoadingDeleteButton({ 
  children = "Delete", 
  loadingText = "Deleting...", 
  variant = "destructive",
  ...props 
}: LoadingButtonProps) {
  return (
    <LoadingButton
      type="button"
      variant={variant}
      loadingText={loadingText}
      {...props}
    >
      {children}
    </LoadingButton>
  )
}
