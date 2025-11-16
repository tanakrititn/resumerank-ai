'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'

export default function AnalyzeButton({ candidateId }: { candidateId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleAnalyze() {
    setIsLoading(true)

    try {
      const response = await fetch('/api/trigger-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Show user-friendly error message
        const errorMsg = data.error || 'Analysis failed'
        const isTemporary = data.isTemporary || errorMsg.includes('overloaded') || errorMsg.includes('temporarily')

        toast.error('Analysis Failed', {
          description: errorMsg,
          duration: isTemporary ? 5000 : 4000,
        })

        if (isTemporary) {
          // Suggest retry for temporary errors
          setTimeout(() => {
            toast.info('Tip', {
              description: 'You can click "Analyze with AI" again to retry.',
            })
          }, 5500)
        }

        setIsLoading(false)
        return
      }

      toast.success('Success', {
        description: 'AI analysis completed!',
      })

      router.refresh()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Analysis failed'
      toast.error('Error', {
        description: errorMsg,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleAnalyze} disabled={isLoading} size="sm">
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      {isLoading ? 'Analyzing...' : 'Analyze with AI'}
    </Button>
  )
}
