'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ReAnalyzeButtonProps {
  candidateId: string
  candidateName?: string
  variant?: 'default' | 'outline' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
}

export default function ReAnalyzeButton({
  candidateId,
  candidateName,
  variant = 'outline',
  size = 'sm',
  showIcon = true,
}: ReAnalyzeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  async function handleReAnalyze() {
    setIsLoading(true)
    setIsOpen(false)

    try {
      const response = await fetch('/api/re-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds: [candidateId] }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Re-analysis failed')
      }

      // Check results
      const result = data.results?.[0]

      if (result?.success) {
        toast.success('Success', {
          description: `Re-analysis completed! New score: ${result.score}`,
          duration: 5000,
        })
        router.refresh()
      } else {
        const errorMsg = result?.error || 'Re-analysis failed'
        const isTemporary = result?.isTemporary || false

        toast.error('Re-analysis Failed', {
          description: errorMsg,
          duration: isTemporary ? 6000 : 5000,
        })

        if (isTemporary) {
          setTimeout(() => {
            toast.info('Tip', {
              description: 'This is a temporary error. You can try again in a few moments.',
              duration: 4000,
            })
          }, 6500)
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Re-analysis failed'
      toast.error('Error', {
        description: errorMsg,
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className={showIcon ? 'mr-2 h-4 w-4 animate-spin' : 'h-4 w-4 animate-spin'} />
              {size !== 'icon' && 'Re-analyzing...'}
            </>
          ) : (
            <>
              {showIcon && <RefreshCw className={size !== 'icon' ? 'mr-2 h-4 w-4' : 'h-4 w-4'} />}
              {size !== 'icon' && 'Re-analyze'}
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Re-analyze Resume?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              This will re-analyze {candidateName ? `${candidateName}'s` : 'the'} resume with AI and update the score.
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-3">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> The previous AI analysis will be replaced with new results. This action cannot be undone.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReAnalyze}
            className="bg-primary hover:bg-primary/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Re-analyze Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
