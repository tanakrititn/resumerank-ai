'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { updatePassword } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [hasValidSession, setHasValidSession] = useState(false)
  const router = useRouter()

  // Verify session from URL tokens
  useEffect(() => {
    const verifySession = async () => {
      try {
        const supabase = createClient()

        // Check if we have a session (Supabase will automatically exchange tokens from URL)
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          toast.error('Error', {
            description: 'Invalid or expired reset link. Please request a new one.',
          })
          setHasValidSession(false)
        } else if (session) {
          setHasValidSession(true)
        } else {
          toast.error('Error', {
            description: 'No valid session found. Please request a new reset link.',
          })
          setHasValidSession(false)
        }
      } catch (error) {
        console.error('Verification error:', error)
        setHasValidSession(false)
      } finally {
        setIsVerifying(false)
      }
    }

    verifySession()
  }, [])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error('Error', {
        description: 'Passwords do not match',
      })
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 8) {
      toast.error('Error', {
        description: 'Password must be at least 8 characters',
      })
      setIsLoading(false)
      return
    }

    const result = await updatePassword(password)

    setIsLoading(false)

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      })
    } else {
      setPasswordReset(true)
      toast.success('Success', {
        description: 'Your password has been reset successfully!',
      })

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }

  // Show loading state while verifying session
  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 md:p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center p-4 sm:p-5 md:p-6">
            <CardTitle className="text-lg sm:text-xl md:text-2xl">Verifying reset link...</CardTitle>
            <CardDescription className="text-xs sm:text-sm md:text-base">
              Please wait while we verify your password reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6 sm:py-8 p-4 sm:p-5 md:p-6">
            <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state if session is invalid
  if (!hasValidSession) {
    return (
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 md:p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center p-4 sm:p-5 md:p-6">
            <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-600" />
            </div>
            <CardTitle className="text-lg sm:text-xl md:text-2xl">Invalid Reset Link</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-5 md:p-6">
            <div className="rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground">
              <p className="mb-2">
                Password reset links expire after 1 hour for security reasons.
              </p>
              <p>
                Please request a new password reset link.
              </p>
            </div>
          </CardContent>
          <CardFooter className="p-4 sm:p-5 md:p-6">
            <Button
              variant="default"
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
              onClick={() => router.push('/forgot-password')}
            >
              Request New Link
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Show success state after password reset
  if (passwordReset) {
    return (
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 md:p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center p-4 sm:p-5 md:p-6">
            <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-600" />
            </div>
            <CardTitle className="text-lg sm:text-xl md:text-2xl">Password reset successful!</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Your password has been changed. Redirecting to login...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-4 sm:p-5 md:p-6">
            <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show password reset form
  return (
    <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 md:p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="p-4 sm:p-5 md:p-6">
          <CardTitle className="text-lg sm:text-xl md:text-2xl">Reset your password</CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-5 md:p-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password"
                required
                disabled={isLoading}
                minLength={8}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm sm:text-base">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                required
                disabled={isLoading}
                minLength={8}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="p-4 sm:p-5 md:p-6">
            <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />}
              Reset password
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
