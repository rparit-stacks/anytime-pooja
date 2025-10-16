"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  disabled?: boolean
  className?: string
  children?: React.ReactNode
  showPreview?: boolean
  currentImage?: string
  onRemove?: () => void
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  loading?: boolean
  success?: boolean
}

export function FileUpload({
  onFileSelect,
  accept = "image/*",
  disabled = false,
  className,
  children,
  showPreview = false,
  currentImage,
  onRemove,
  variant = "default",
  size = "default",
  loading = false,
  success = false
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Simulate upload progress
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 100)
      
      onFileSelect(file)
      
      // Complete progress after file is selected
      setTimeout(() => {
        setUploadProgress(100)
        setTimeout(() => setUploadProgress(0), 1000)
      }, 500)
    }
    // Reset the input value so the same file can be selected again
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
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      onFileSelect(files[0])
    }
  }

  if (showPreview && currentImage) {
    return (
      <div className="relative group">
        <div className="relative w-full h-48 border-2 border-dashed border-border rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02]">
          <img
            src={currentImage}
            alt="Preview"
            className="w-full h-full object-cover transition-all duration-300"
          />
          
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center text-white space-y-3">
                <div className="relative">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
                </div>
                <p className="text-sm font-medium">Uploading...</p>
                {uploadProgress > 0 && (
                  <div className="w-32 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Overlay */}
          {success && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center animate-in fade-in duration-500">
              <div className="text-center text-green-600 space-y-2">
                <CheckCircle className="h-8 w-8 mx-auto animate-in zoom-in duration-300" />
                <p className="text-sm font-medium">Uploaded!</p>
              </div>
            </div>
          )}
          
          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleClick}
                disabled={disabled || loading}
                className="no-transition transform transition-all duration-200 hover:scale-110"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-1" />
                )}
                Replace
              </Button>
              {onRemove && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={onRemove}
                  disabled={loading}
                  className="no-transition transform transition-all duration-200 hover:scale-110"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled || loading}
        />
      </div>
    )
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
              Uploading image...
            </p>
            {uploadProgress > 0 && (
              <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        ) : success ? (
          <div className="flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
            <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
            <p className="text-sm text-green-600 font-medium">
              Upload successful!
            </p>
          </div>
        ) : (
          children || (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <ImageIcon className={cn(
                "text-muted-foreground mb-2 transition-all duration-300",
                dragActive ? "h-12 w-12 text-primary" : "h-10 w-10"
              )} />
              <p className="text-sm text-muted-foreground mb-1">
                {dragActive ? "Drop image here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          )
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || loading}
      />
      
      {children && !showPreview && (
        <Button
          type="button"
          variant={variant}
          size={size}
          onClick={handleClick}
          disabled={disabled || loading}
          className={cn("no-transition transition-all duration-200 hover:scale-105", className)}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            children
          )}
        </Button>
      )}
    </div>
  )
}