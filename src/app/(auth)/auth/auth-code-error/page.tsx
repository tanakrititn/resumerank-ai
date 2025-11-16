'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Verification Failed</CardTitle>
          </div>
          <CardDescription>
            The email verification link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This can happen if you&apos;ve already verified your email or if the link has expired.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/verify-email">Resend Verification Email</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
