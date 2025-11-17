'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { requestPasswordReset } from '@/lib/actions/auth'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [email, setEmail] = useState('')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const emailValue = formData.get('email') as string
    setEmail(emailValue)

    const result = await requestPasswordReset(emailValue)

    setIsLoading(false)

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      })
    } else {
      setEmailSent(true)
      toast.success('Success', {
        description: 'Password reset link sent to your email!',
      })
    }
  }

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 md:p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center p-4 sm:p-5 md:p-6">
            <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-600" />
            </div>
            <CardTitle className="text-lg sm:text-xl md:text-2xl">Check your email</CardTitle>
            <CardDescription className="text-sm sm:text-base break-words">
              We've sent a password reset link to <strong className="break-all">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-5 md:p-6">
            <div className="rounded-lg bg-muted p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground">
              <p className="mb-2">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              <p>
                If you don't see the email, check your spam folder.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 sm:space-y-4 p-4 sm:p-5 md:p-6">
            <Button
              variant="outline"
              className="w-full h-10 sm:h-11 text-sm sm:text-base"
              onClick={() => setEmailSent(false)}
            >
              Resend email
            </Button>
            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full h-10 sm:h-11 text-sm sm:text-base">
                <ArrowLeft className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Back to login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 md:p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="p-4 sm:p-5 md:p-6">
          <CardTitle className="text-lg sm:text-xl md:text-2xl">Forgot password?</CardTitle>
          <CardDescription className="text-xs sm:text-sm md:text-base">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-5 md:p-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                disabled={isLoading}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 sm:space-y-4 p-4 sm:p-5 md:p-6">
            <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />}
              Send reset link
            </Button>
            <Link href="/login" className="w-full">
              <Button variant="ghost" className="w-full h-10 sm:h-11 text-sm sm:text-base">
                <ArrowLeft className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Back to login
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
