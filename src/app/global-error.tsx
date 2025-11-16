'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
          <div className="max-w-md w-full text-center space-y-6 p-8 bg-white rounded-lg shadow-lg border">
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Something went wrong!</h2>
              <p className="text-muted-foreground">
                A critical error occurred. Please try again or contact support if the problem persists.
              </p>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-left">
                <p className="text-xs font-medium mb-2">Error Details:</p>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-48 text-left">
                  {error.message}
                  {error.digest && `\n\nDigest: ${error.digest}`}
                </pre>
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <Button onClick={reset} className="w-full">
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
