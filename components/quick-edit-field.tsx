"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit2, Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface QuickEditFieldProps {
  label: string
  value: string
  fieldName: string
  type?: 'text' | 'email' | 'tel'
  onUpdate: (fieldName: string, value: string) => Promise<boolean>
  placeholder?: string
}

export function QuickEditField({ 
  label, 
  value, 
  fieldName, 
  type = 'text', 
  onUpdate, 
  placeholder 
}: QuickEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }

    setLoading(true)
    try {
      const success = await onUpdate(fieldName, editValue)
      if (success) {
        toast.success(`${label} updated successfully!`)
        setIsEditing(false)
      } else {
        toast.error(`Failed to update ${label}`)
        setEditValue(value) // Reset to original value
      }
    } catch (error) {
      console.error('Error updating field:', error)
      toast.error(`Failed to update ${label}`)
      setEditValue(value) // Reset to original value
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="flex-1"
            autoFocus
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between group">
          <span className="text-gray-900">{value || 'Not set'}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
