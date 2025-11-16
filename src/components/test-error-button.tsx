'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

/**
 * Test component to trigger errors for testing error boundaries
 * Remove or disable in production
 */
export function TestErrorButton() {
  const [shouldThrow, setShouldThrow] = useState(false)

  if (shouldThrow) {
    throw new Error('Test error from TestErrorButton component')
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setShouldThrow(true)}
      className="fixed bottom-4 right-4 z-50"
    >
      <AlertTriangle className="mr-2 h-4 w-4" />
      Test Error Boundary
    </Button>
  )
}
