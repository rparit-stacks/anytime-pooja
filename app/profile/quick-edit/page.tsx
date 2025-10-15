"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QuickEditField } from "@/components/quick-edit-field"
import { Camera, ArrowLeft, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AuthGuard } from "@/components/auth-guard"

interface UserData {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  profile_image?: string
  bio?: string
  date_of_birth?: string
  gender?: string
}

function QuickEditContent() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      }

      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
    setLoading(false)
  }

  const handleFieldUpdate = async (fieldName: string, value: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          [fieldName]: value
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error updating field:', error)
      return false
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('profileImage', file)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUser(prev => prev ? { ...prev, profile_image: data.profile_image } : null)
          toast.success('Profile image updated successfully!')
        }
      } else {
        toast.error('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">User not found</h2>
            <p className="text-muted-foreground mb-4">Please login to edit your profile.</p>
            <Button onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/profile')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <h1 className="text-3xl font-bold">Quick Edit Profile</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Image Section */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="h-32 w-32 mx-auto mb-4">
                      <AvatarImage src={user.profile_image || '/placeholder-avatar.svg'} alt="Profile" />
                      <AvatarFallback className="text-2xl">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="profile-image"
                      className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                    </label>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </div>
                  {uploading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Click the camera icon to upload a new profile picture
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Edit Fields */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Click the edit icon next to any field to update it instantly
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <QuickEditField
                      label="First Name"
                      value={user.first_name || ''}
                      fieldName="first_name"
                      onUpdate={handleFieldUpdate}
                      placeholder="Enter your first name"
                    />
                    <QuickEditField
                      label="Last Name"
                      value={user.last_name || ''}
                      fieldName="last_name"
                      onUpdate={handleFieldUpdate}
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <QuickEditField
                      label="Email"
                      value={user.email || ''}
                      fieldName="email"
                      type="email"
                      onUpdate={handleFieldUpdate}
                      placeholder="Enter your email"
                    />
                    <QuickEditField
                      label="Phone"
                      value={user.phone || ''}
                      fieldName="phone"
                      type="tel"
                      onUpdate={handleFieldUpdate}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <QuickEditField
                      label="Date of Birth"
                      value={user.date_of_birth || ''}
                      fieldName="date_of_birth"
                      onUpdate={handleFieldUpdate}
                      placeholder="YYYY-MM-DD"
                    />
                    <QuickEditField
                      label="Gender"
                      value={user.gender || ''}
                      fieldName="gender"
                      onUpdate={handleFieldUpdate}
                      placeholder="Male, Female, Other, Prefer not to say"
                    />
                  </div>

                  <QuickEditField
                    label="Bio"
                    value={user.bio || ''}
                    fieldName="bio"
                    onUpdate={handleFieldUpdate}
                    placeholder="Tell us about yourself..."
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function QuickEditPage() {
  return (
    <AuthGuard>
      <QuickEditContent />
    </AuthGuard>
  )
}
