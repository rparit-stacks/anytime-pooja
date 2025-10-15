"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingButton } from "@/components/ui/loading-button"
import { Mail } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: ""
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Login form submitted!', formData)
    console.log('🚀 Login button clicked and form handler called!')
    setLoading(true)

    try {
      console.log('Sending OTP request...')
      // Send OTP for login
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          purpose: 'login'
        }),
      })

      console.log('Response received:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (response.ok) {
        toast.success('OTP sent to your email!')
        console.log('OTP for testing:', data.otp)
        // Redirect to OTP verification page
        router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}&purpose=login`)
      } else {
        toast.error(data.error || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📝 Login input changed:', e.target.name, e.target.value)
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary/80"
            >
              create a new account
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  We'll send a verification code to your email address
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                onClick={() => console.log('🚀 Login button clicked directly!')}
              >
                {loading ? "Sending OTP..." : "Sign in"}
              </Button>
              
              {/* Debug button */}
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  console.log('🚀 DEBUG: Direct test button clicked!')
                  console.log('🚀 DEBUG: Current email:', formData.email)
                  if (formData.email) {
                    handleSubmit(new Event('submit') as any)
                  } else {
                    console.log('🚀 DEBUG: No email entered')
                  }
                }}
              >
                🚀 DEBUG: Test Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}