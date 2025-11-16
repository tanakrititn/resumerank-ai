'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function TestGeminiPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    error?: string
    message?: string
  } | null>(null)

  async function testConnection() {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-gemini')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Test Gemini AI Connection</h1>
        <p className="text-muted-foreground mt-2">
          Test the connection to Google Gemini AI API
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Testing Connection...' : 'Test Connection'}
          </Button>

          {result && (
            <div className="mt-4 p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                {result.success ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-600">
                      Connection Successful
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-600">
                      Connection Failed
                    </span>
                  </>
                )}
              </div>
              {result.error && (
                <p className="text-sm text-red-600 mt-2">Error: {result.error}</p>
              )}
              {result.message && (
                <p className="text-sm text-muted-foreground mt-2">
                  {result.message}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
