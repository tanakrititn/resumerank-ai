'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { signUp } from '@/lib/actions/auth'
import { Loader2 } from 'lucide-react'

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      fullName: formData.get('fullName') as string,
      companyName: formData.get('companyName') as string | undefined,
    }

    const result = await signUp(data)

    setIsLoading(false)

    if (result.error) {
      toast.error('Error', {
        description: result.error,
      })
    } else {
      toast.success('Success', {
        description: 'Account created! Please check your email to verify your account.',
      })
      // Redirect to verify email page with email parameter
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 md:p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 sm:space-y-2 p-5 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl text-foreground">Create an account</CardTitle>
          <CardDescription className="text-sm sm:text-base text-muted-foreground">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4 p-5 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm sm:text-base text-foreground">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                required
                disabled={isLoading}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
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
              <Label htmlFor="companyName" className="text-sm sm:text-base text-foreground">Company Name (Optional)</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Acme Inc."
                disabled={isLoading}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base text-foreground">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
              <p className="text-xs text-muted-foreground">
                At least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 p-5 sm:p-6 pt-0">
            <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
            <p className="text-xs sm:text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="underline hover:text-primary font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
