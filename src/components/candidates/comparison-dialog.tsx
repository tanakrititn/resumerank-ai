'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Scale,
  Mail,
  Phone,
  Calendar,
  FileText,
  Download,
  Trophy,
  ChevronDown,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Candidate = Database['public']['Tables']['candidates']['Row']

const statusColors = {
  PENDING_REVIEW: 'secondary',
  REVIEWING: 'default',
  SHORTLISTED: 'default',
  INTERVIEWED: 'default',
  REJECTED: 'destructive',
  HIRED: 'default',
} as const

const statusLabels = {
  PENDING_REVIEW: 'Pending Review',
  REVIEWING: 'Reviewing',
  SHORTLISTED: 'Shortlisted',
  INTERVIEWED: 'Interviewed',
  REJECTED: 'Rejected',
  HIRED: 'Hired',
} as const

interface ComparisonDialogProps {
  candidates: Candidate[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange?: (candidateId: string, status: string) => Promise<void>
}

export default function ComparisonDialog({
  candidates,
  open,
  onOpenChange,
  onStatusChange,
}: ComparisonDialogProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Limit to 3 candidates
  const compareCandidates = candidates.slice(0, 3)

  // Find best score
  const bestScore = Math.max(
    ...compareCandidates.map((c) => c.ai_score || 0)
  )

  const handleStatusChange = async (candidateId: string, status: string) => {
    if (!onStatusChange) return

    setUpdatingId(candidateId)
    try {
      await onStatusChange(candidateId, status)
      toast.success('Status Updated', {
        description: `Updated to ${statusLabels[status as keyof typeof statusLabels]}`,
      })
    } catch (error) {
      toast.error('Update Failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number | null) => {
    if (!score) return 'bg-muted'
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-blue-100'
    if (score >= 40) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100">
              <Scale className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                Candidate Comparison
              </DialogTitle>
              <DialogDescription className="text-base">
                Compare {compareCandidates.length} candidates side-by-side to make the best hiring decision
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {/* AI Score Comparison - Top Section */}
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-lg">AI Score Comparison</h3>
            </div>
            <div className={`grid gap-4 ${compareCandidates.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {compareCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`p-4 rounded-lg bg-white border-2 transition-all ${
                    candidate.ai_score === bestScore && candidate.ai_score
                      ? 'border-green-500 shadow-lg scale-105'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-5xl font-bold mb-2 ${getScoreColor(candidate.ai_score)}`}>
                      {candidate.ai_score || '-'}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {candidate.name}
                    </div>
                    {candidate.ai_score && (
                      <Progress
                        value={candidate.ai_score}
                        className="h-2"
                      />
                    )}
                    {candidate.ai_score === bestScore && candidate.ai_score && (
                      <div className="flex items-center justify-center gap-1 mt-2 text-green-600 text-sm font-semibold">
                        <Trophy className="h-4 w-4" />
                        <span>Highest Score</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Comparison - Grid Layout */}
          <div className={`grid gap-4 ${compareCandidates.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {compareCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="space-y-4 p-4 rounded-lg border-2 bg-white"
              >
                {/* Header with Name and Status */}
                <div className="pb-4 border-b">
                  <h3 className="font-bold text-xl mb-2">{candidate.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={statusColors[candidate.status as keyof typeof statusColors]}>
                      {candidate.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={updatingId === candidate.id}
                      >
                        {updatingId === candidate.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            Change Status
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-48">
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => handleStatusChange(candidate.id, key)}
                        >
                          {label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <Mail className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <span className="break-all">{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                </div>

                {/* AI Summary */}
                {candidate.ai_summary && (
                  <div className={`p-3 rounded-lg ${getScoreBackground(candidate.ai_score)}`}>
                    <div className="flex items-start gap-2 mb-2">
                      <FileText className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-purple-900">AI Summary</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {candidate.ai_summary}
                    </p>
                  </div>
                )}

                {/* Resume Preview */}
                {candidate.resume_text && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase">
                      Resume Preview
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {candidate.resume_text.substring(0, 200)}...
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span suppressHydrationWarning>
                      Applied {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {candidate.resume_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(candidate.resume_url!, '_blank', 'noopener,noreferrer')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Resume
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
