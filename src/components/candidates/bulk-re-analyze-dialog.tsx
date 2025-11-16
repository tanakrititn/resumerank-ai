'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, RefreshCw, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface BulkReAnalyzeDialogProps {
  candidateIds: string[]
  candidateNames?: Map<string, string>
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface AnalysisResult {
  candidateId: string
  candidateName?: string
  success: boolean
  score?: number
  error?: string
  isTemporary?: boolean
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export default function BulkReAnalyzeDialog({
  candidateIds,
  candidateNames,
  open,
  onOpenChange,
}: BulkReAnalyzeDialogProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [summary, setSummary] = useState<{
    total: number
    successful: number
    failed: number
    temporary: number
  } | null>(null)
  const router = useRouter()

  async function handleBulkReAnalyze() {
    setIsAnalyzing(true)
    setProgress(0)
    setSummary(null)

    // Initialize results
    const initialResults: AnalysisResult[] = candidateIds.map(id => ({
      candidateId: id,
      candidateName: candidateNames?.get(id) || 'Unknown',
      success: false,
      status: 'pending',
    }))
    setResults(initialResults)

    try {
      // Set all to processing
      setResults(prev => prev.map(r => ({ ...r, status: 'processing' as const })))

      const response = await fetch('/api/re-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Bulk re-analysis failed')
      }

      // Update results with API response
      const apiResults = data.results || []
      const updatedResults: AnalysisResult[] = initialResults.map(initial => {
        const apiResult = apiResults.find((r: any) => r.candidateId === initial.candidateId)
        if (apiResult) {
          return {
            ...initial,
            success: apiResult.success,
            score: apiResult.score,
            error: apiResult.error,
            isTemporary: apiResult.isTemporary,
            status: apiResult.success ? 'completed' : 'failed',
          }
        }
        return { ...initial, status: 'failed', error: 'No result returned' }
      })

      setResults(updatedResults)
      setProgress(100)
      setSummary(data.summary)

      // Show toast summary
      const successful = data.summary?.successful || 0
      const failed = data.summary?.failed || 0

      if (successful > 0 && failed === 0) {
        toast.success('Bulk Re-analysis Complete', {
          description: `Successfully re-analyzed ${successful} candidate${successful !== 1 ? 's' : ''}.`,
          duration: 5000,
        })
      } else if (successful > 0 && failed > 0) {
        toast.warning('Partially Complete', {
          description: `${successful} succeeded, ${failed} failed. Check details below.`,
          duration: 6000,
        })
      } else {
        toast.error('Bulk Re-analysis Failed', {
          description: `All ${failed} re-analysis attempts failed.`,
          duration: 6000,
        })
      }

      // Refresh the page to show new scores
      if (successful > 0) {
        router.refresh()
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Bulk re-analysis failed'
      toast.error('Error', {
        description: errorMsg,
        duration: 5000,
      })

      setResults(prev => prev.map(r => ({
        ...r,
        status: 'failed',
        error: errorMsg,
      })))
    } finally {
      setIsAnalyzing(false)
    }
  }

  function handleClose() {
    if (!isAnalyzing) {
      onOpenChange(false)
      // Reset state after close animation
      setTimeout(() => {
        setResults([])
        setProgress(0)
        setSummary(null)
      }, 300)
    }
  }

  const hasStarted = results.length > 0
  const isComplete = summary !== null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Bulk Re-analyze Candidates
          </DialogTitle>
          <DialogDescription>
            {!hasStarted && `Re-analyze ${candidateIds.length} selected candidate${candidateIds.length !== 1 ? 's' : ''} with AI.`}
            {hasStarted && !isComplete && `Re-analyzing candidates... Please wait.`}
            {isComplete && `Re-analysis complete. Review the results below.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning message before starting */}
          {!hasStarted && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
                  <p><strong>Important:</strong> This will re-analyze all selected candidates.</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Previous AI scores will be replaced</li>
                    <li>This action cannot be undone</li>
                    <li>Processing may take several minutes</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Progress bar */}
          {hasStarted && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Summary badges */}
          {isComplete && summary && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm">
                Total: {summary.total}
              </Badge>
              {summary.successful > 0 && (
                <Badge variant="default" className="text-sm bg-green-500">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Success: {summary.successful}
                </Badge>
              )}
              {summary.failed > 0 && (
                <Badge variant="destructive" className="text-sm">
                  <XCircle className="mr-1 h-3 w-3" />
                  Failed: {summary.failed}
                </Badge>
              )}
              {summary.temporary > 0 && (
                <Badge variant="outline" className="text-sm text-amber-600">
                  <Clock className="mr-1 h-3 w-3" />
                  Temporary: {summary.temporary}
                </Badge>
              )}
            </div>
          )}

          {/* Results list */}
          {results.length > 0 && (
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-3">
                {results.map((result) => (
                  <div
                    key={result.candidateId}
                    className="flex items-start justify-between gap-3 pb-3 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {result.candidateName}
                      </p>
                      {result.status === 'completed' && result.score !== undefined && (
                        <p className="text-sm text-muted-foreground">
                          New score: <span className="font-semibold text-primary">{result.score}</span>
                        </p>
                      )}
                      {result.status === 'failed' && result.error && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {result.error}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {result.status === 'pending' && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                      {result.status === 'processing' && (
                        <Badge variant="secondary" className="text-xs">
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Processing
                        </Badge>
                      )}
                      {result.status === 'completed' && (
                        <Badge variant="default" className="text-xs bg-green-500">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Done
                        </Badge>
                      )}
                      {result.status === 'failed' && (
                        <Badge variant="destructive" className="text-xs">
                          <XCircle className="mr-1 h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          {!hasStarted && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleBulkReAnalyze}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Start Re-analysis
              </Button>
            </>
          )}
          {hasStarted && !isComplete && (
            <Button variant="outline" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </Button>
          )}
          {isComplete && (
            <Button onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
