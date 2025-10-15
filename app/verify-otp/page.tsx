"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import { Mail, ArrowLeft, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("")
  const [email, setEmail] = useState("")
  const [purpose, setPurpose] = useState("")
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get('email')
    const purposeParam = searchParams.get('purpose')
    const userDataParam = searchParams.get('userData')

    if (!emailParam || !purposeParam) {
      router.push('/login')
      return
    }

    setEmail(emailParam)
    setPurpose(purposeParam)
    
    if (userDataParam) {
      try {
        setUserData(JSON.parse(decodeURIComponent(userDataParam)))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [searchParams, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Verify OTP function called!')
    console.log('🚀 Current state:', { email, otp, purpose, userData, loading })
    
    if (loading) {
      console.log('🚀 Already loading, preventing duplicate submission')
      return
    }
    
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }

    console.log('🚀 Starting OTP verification...', { email, otp, purpose, userData })
    setLoading(true)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          purpose,
          userData: purpose === 'registration' ? userData : undefined
        }),
      })

      const data = await response.json()
      console.log('🚀 API Response:', { status: response.status, data })
      console.log('🚀 Full API Response Data:', JSON.stringify(data, null, 2))

      if (response.ok) {
        if (purpose === 'registration') {
          console.log('🚀 Registration successful, storing data and redirecting...')
          toast.success('Account created successfully! Welcome to Anytime Pooja!')
          // Store user data and token
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('token', data.token)
          console.log('🚀 User data stored, redirecting to profile...')
          // Redirect to dashboard/profile with a small delay
          setTimeout(() => {
            router.push('/profile')
          }, 1000)
        } else if (purpose === 'login') {
          console.log('🚀 Login successful, storing data and redirecting...')
          toast.success('Login successful! Welcome back!')
          // Store user data and token
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('token', data.token)
          console.log('🚀 User data stored, redirecting to profile...')
          // Redirect to dashboard/profile with a small delay
          setTimeout(() => {
            router.push('/profile')
          }, 1000)
        }
      } else {
        console.log('🚀 API returned error:', data.error)
        toast.error(data.error || 'OTP verification failed')
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      toast.error('An error occurred during verification')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    console.log('🚀 Resend OTP button clicked!')
    setResendLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          purpose
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('OTP sent successfully!')
        setTimeLeft(300) // Reset timer
      } else {
        toast.error(data.error || 'Failed to resend OTP')
      }
    } catch (error) {
      console.error('Error resending OTP:', error)
      toast.error('An error occurred while resending OTP')
    } finally {
      setResendLoading(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    console.log('🚀 OTP input changed:', value)
    setOtp(value)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a 6-digit code to your email
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Mail className="h-5 w-5" />
              Enter Verification Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the 6-digit code sent to {email}
                </p>
              </div>

              <div className="text-center">
                {timeLeft > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Code expires in: <span className="font-semibold text-primary">{formatTime(timeLeft)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-destructive">
                    Code has expired
                  </p>
                )}
              </div>

              <Button
                type="button"
                className="w-full"
                disabled={loading || otp.length !== 6 || timeLeft === 0}
                onClick={() => {
                  console.log('🚀 Verify button clicked directly!')
                  handleVerifyOTP(new Event('submit') as any)
                }}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>

              {/* Debug Test Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  console.log('🚀 DEBUG: Direct test button clicked!')
                  console.log('🚀 DEBUG: Current OTP:', otp)
                  console.log('🚀 DEBUG: Current email:', email)
                  console.log('🚀 DEBUG: Current purpose:', purpose)
                  console.log('🚀 DEBUG: Current userData:', userData)
                  
                  if (otp.length === 6) {
                    console.log('🚀 DEBUG: OTP is valid, calling handleVerifyOTP...')
                    handleVerifyOTP(new Event('submit') as any)
                  } else {
                    console.log('🚀 DEBUG: OTP is invalid, length:', otp.length)
                  }
                }}
              >
                🚀 DEBUG: Test Verify
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn't receive the code?
                </p>
                <LoadingButton
                  type="button"
                  variant="outline"
                  onClick={handleResendOTP}
                  loadingText="Sending..."
                  disabled={resendLoading || timeLeft > 240} // Can resend after 1 minute
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend Code
                </LoadingButton>
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to {purpose === 'registration' ? 'Sign Up' : 'Login'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
