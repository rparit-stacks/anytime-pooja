"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface MultiFileUploadProps {
  onFilesSelect: (files: File[]) => void
  accept?: string
  disabled?: boolean
  className?: string
  maxFiles?: number
  loading?: boolean
}

export function MultiFileUpload({
  onFilesSelect,
  accept = "image/*",
  disabled = false,
  className,
  maxFiles = 6,
  loading = false
}: MultiFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFilesSelect(files)
    }
    // Reset the input value so the same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && !loading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled || loading) return
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFilesSelect(files)
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg transition-all duration-300",
          dragActive ? "border-primary bg-primary/10 scale-105" : "border-border hover:border-primary/50",
          loading && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && !loading && "cursor-pointer hover:scale-[1.02]"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-3">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
            </div>
            <p className="text-sm text-primary font-medium mb-1">
              Uploading images...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <ImageIcon className={cn(
              "text-muted-foreground mb-2 transition-all duration-300",
              dragActive ? "h-12 w-12 text-primary" : "h-10 w-10"
            )} />
            <p className="text-sm text-muted-foreground mb-1">
              {dragActive ? "Drop images here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF up to 10MB each (Max {maxFiles} files)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You can select multiple files at once
            </p>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || loading}
      />
    </div>
  )
}
