'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { signIn } from '@/lib/actions/auth'
import { Loader2 } from 'lucide-react'

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const result = await signIn(data)

    setIsLoading(false)

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      })

      // If email needs verification, redirect to verify-email page
      if ('needsVerification' in result && result.needsVerification) {
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(result.email || data.email)}`)
        }, 2000)
      }
    } else {
      toast.success('Success', {
        description: 'Logged in successfully!',
      })

      // Redirect based on user role
      const redirect = searchParams.get('redirect')
      if (redirect) {
        router.push(redirect)
      } else if (result.isAdmin) {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 md:p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 sm:space-y-2 p-5 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl text-foreground">Welcome back</CardTitle>
          <CardDescription className="text-sm sm:text-base text-muted-foreground">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4 p-5 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base text-foreground">Email</Label>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm sm:text-base text-foreground">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-5 sm:p-6 pt-0">
            <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            <p className="text-xs sm:text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="underline hover:text-primary font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 md:p-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 sm:space-y-2 p-5 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl text-foreground">Welcome back</CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
