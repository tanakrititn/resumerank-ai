'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { resendVerificationEmail } from '@/lib/actions/auth'
import { Loader2, Mail, CheckCircle2 } from 'lucide-react'

function VerifyEmailForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Get email from URL params if provided
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  async function handleResend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    if (!email) {
      toast.error('Error', {
        description: 'Please enter your email address',
      })
      setIsLoading(false)
      return
    }

    const result = await resendVerificationEmail(email)

    setIsLoading(false)

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      })
    } else {
      toast.success('Success', {
        description: 'Verification email sent! Please check your inbox.',
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 md:p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center p-4 sm:p-5 md:p-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="rounded-full bg-primary/10 p-2 sm:p-2.5 md:p-3">
              <Mail className="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-lg sm:text-xl md:text-2xl">Verify your email</CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base">
            We&apos;ve sent a verification email to your inbox. Please click the link in the email to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-5 md:p-6">
          <div className="rounded-lg border border-border/50 bg-muted/50 p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-xs sm:text-sm text-muted-foreground space-y-2">
                <p>Check your email inbox and spam folder</p>
                <p>Click the verification link in the email</p>
                <p>You&apos;ll be redirected back to the app</p>
              </div>
            </div>
          </div>

          <div className="pt-3 sm:pt-4 border-t">
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 text-center">
              Didn&apos;t receive the email?
            </p>
            <form onSubmit={handleResend} className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
              <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />}
                Resend Verification Email
              </Button>
            </form>
          </div>

          <div className="text-center pt-3 sm:pt-4">
            <Link href="/login" className="text-xs sm:text-sm text-muted-foreground hover:text-primary underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 md:p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center p-4 sm:p-5 md:p-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="rounded-full bg-primary/10 p-2 sm:p-2.5 md:p-3">
                <Mail className="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-lg sm:text-xl md:text-2xl">Verify your email</CardTitle>
            <CardDescription className="text-xs sm:text-sm md:text-base">
              Loading...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6 sm:py-8 p-4 sm:p-5 md:p-6">
            <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
