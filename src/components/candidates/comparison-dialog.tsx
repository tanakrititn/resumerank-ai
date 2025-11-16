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
import { Card, CardContent } from '@/components/ui/card'
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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  XCircle,
  UserCheck,
  Star,
  Sparkles,
  Clock,
  Users,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type Candidate = Database['public']['Tables']['candidates']['Row']

const statusConfig = {
  PENDING_REVIEW: {
    label: 'Pending Review',
    className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0',
    icon: Clock,
  },
  REVIEWED: {
    label: 'Reviewed',
    className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0',
    icon: CheckCircle2,
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    className: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0',
    icon: Star,
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0',
    icon: XCircle,
  },
  HIRED: {
    label: 'Hired',
    className: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0',
    icon: UserCheck,
  },
} as const

const recommendationConfig = {
  HIRE: {
    label: 'Recommend to Hire',
    className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0',
    icon: CheckCircle2,
    bgClass: 'from-green-50 to-emerald-50',
  },
  INTERVIEW: {
    label: 'Recommend to Interview',
    className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0',
    icon: Target,
    bgClass: 'from-blue-50 to-cyan-50',
  },
  REJECT: {
    label: 'Not Recommended',
    className: 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-0',
    icon: XCircle,
    bgClass: 'from-red-50 to-rose-50',
  },
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
      const config = statusConfig[status as keyof typeof statusConfig]
      toast.success('Status Updated', {
        description: `Updated to ${config?.label || status}`,
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
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        {/* Gradient Header */}
        <div className="relative overflow-hidden -mx-6 -mt-6 mb-6">
          <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-6 text-white">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Scale className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-3xl font-bold">
                    Candidate Comparison
                  </DialogTitle>
                  <DialogDescription className="text-white/90 text-base mt-1">
                    Compare {compareCandidates.length} candidates side-by-side with AI-powered insights
                  </DialogDescription>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
          </div>
        </div>

        <div className="space-y-6">
          {/* AI Score & Recommendation Comparison */}
          <Card className="border-2 shadow-lg overflow-hidden p-0">
            <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-lg">AI Analysis Overview</h3>
              </div>
              <div className={`grid gap-4 ${compareCandidates.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {compareCandidates.map((candidate) => {
                  const isWinner = candidate.ai_score === bestScore && candidate.ai_score && bestScore > 0
                  const recommendation = (candidate as any).ai_recommendation as keyof typeof recommendationConfig | null
                  const recConfig = recommendation ? recommendationConfig[recommendation] : null
                  const RecIcon = recConfig?.icon

                  return (
                    <div
                      key={candidate.id}
                      className={`relative overflow-hidden rounded-xl bg-white border-2 transition-all ${
                        isWinner
                          ? 'border-green-500 shadow-xl scale-105 ring-2 ring-green-200'
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
                      }`}
                    >
                      {isWinner && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-bl-lg shadow-lg">
                            <div className="flex items-center gap-1 text-xs font-bold">
                              <Trophy className="h-3 w-3" />
                              <span>Top Score</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-5">
                        <div className="text-center mb-4">
                          <div className={`text-6xl font-bold mb-2 ${getScoreColor(candidate.ai_score)}`}>
                            {candidate.ai_score || '-'}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 mb-2">
                            {candidate.name}
                          </div>
                          {candidate.ai_score ? (
                            <Progress
                              value={candidate.ai_score}
                              className="h-3 rounded-full"
                            />
                          ) : (
                            <div className="text-xs text-muted-foreground">No score yet</div>
                          )}
                        </div>

                        {recConfig && RecIcon && (
                          <Badge className={`${recConfig.className} w-full justify-center py-2 font-semibold shadow-sm`}>
                            <RecIcon className="h-4 w-4 mr-1.5" />
                            {recConfig.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Quick Comparison Table */}
          <Card className="border-2 shadow-lg pt-0">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-lg">Quick Comparison</h3>
              </div>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Attribute</th>
                      {compareCandidates.map((candidate) => (
                        <th key={candidate.id} className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          {candidate.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">AI Score</td>
                      {compareCandidates.map((candidate) => (
                        <td key={candidate.id} className="px-4 py-3 text-center">
                          <span className={`text-lg font-bold ${getScoreColor(candidate.ai_score)}`}>
                            {candidate.ai_score || '-'}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Status</td>
                      {compareCandidates.map((candidate) => {
                        const status = statusConfig[candidate.status as keyof typeof statusConfig]
                        const StatusIcon = status?.icon
                        return (
                          <td key={candidate.id} className="px-4 py-3 text-center">
                            <Badge className={`${status?.className || ''} inline-flex items-center gap-1`}>
                              {StatusIcon && <StatusIcon className="h-3 w-3" />}
                              {status?.label || candidate.status}
                            </Badge>
                          </td>
                        )
                      })}
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Applied</td>
                      {compareCandidates.map((candidate) => (
                        <td key={candidate.id} className="px-4 py-3 text-center text-sm text-muted-foreground" suppressHydrationWarning>
                          {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
                        </td>
                      ))}
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">Contact</td>
                      {compareCandidates.map((candidate) => (
                        <td key={candidate.id} className="px-4 py-3 text-center">
                          <div className="text-xs space-y-1">
                            <div className="flex items-center justify-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate max-w-[150px]">{candidate.email}</span>
                            </div>
                            {candidate.phone && (
                              <div className="flex items-center justify-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span>{candidate.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Comparison Cards */}
          <div className={`grid gap-4 ${compareCandidates.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {compareCandidates.map((candidate) => {
              const status = statusConfig[candidate.status as keyof typeof statusConfig]
              const StatusIcon = status?.icon
              const recommendation = (candidate as any).ai_recommendation as keyof typeof recommendationConfig | null
              const recConfig = recommendation ? recommendationConfig[recommendation] : null

              // Parse strengths and weaknesses if they're JSON strings
              let strengths: string[] = []
              let weaknesses: string[] = []
              try {
                strengths = (candidate as any).ai_strengths ? JSON.parse((candidate as any).ai_strengths) : []
              } catch {
                strengths = []
              }
              try {
                weaknesses = (candidate as any).ai_weaknesses ? JSON.parse((candidate as any).ai_weaknesses) : []
              } catch {
                weaknesses = []
              }

              return (
                <Card
                  key={candidate.id}
                  className="border-2 hover:border-primary/50 hover:shadow-xl transition-all overflow-hidden pt-0"
                >
                  {/* Header with gradient background */}
                  <div className={`relative bg-gradient-to-r ${recConfig?.bgClass || 'from-gray-50 to-slate-50'} p-4 border-b-2`}>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {candidate.name[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate">{candidate.name}</h3>
                          {status && StatusIcon && (
                            <Badge className={`${status.className} inline-flex items-center gap-1 mt-1`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-white hover:bg-gray-50"
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
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <DropdownMenuItem
                              key={key}
                              onClick={() => handleStatusChange(candidate.id, key)}
                            >
                              {config.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <CardContent className="p-4 space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Mail className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span className="break-all text-muted-foreground">{candidate.email}</span>
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-muted-foreground">{candidate.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* AI Summary */}
                    {candidate.ai_summary && (
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${getScoreBackground(candidate.ai_score)} border`}>
                        <div className="flex items-start gap-2 mb-2">
                          <FileText className="h-4 w-4 mt-0.5 text-purple-700 flex-shrink-0" />
                          <span className="text-xs font-bold text-purple-900 uppercase">AI Summary</span>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">
                          {candidate.ai_summary}
                        </p>
                      </div>
                    )}

                    {/* Strengths */}
                    {strengths.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-green-700">
                          <TrendingUp className="h-4 w-4" />
                          <span>Strengths</span>
                        </div>
                        <ul className="space-y-1.5">
                          {strengths.slice(0, 3).map((strength, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs">
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 leading-relaxed">{strength}</span>
                            </li>
                          ))}
                          {strengths.length > 3 && (
                            <li className="text-xs text-muted-foreground pl-5">
                              +{strengths.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {weaknesses.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
                          <TrendingDown className="h-4 w-4" />
                          <span>Areas for Growth</span>
                        </div>
                        <ul className="space-y-1.5">
                          {weaknesses.slice(0, 3).map((weakness, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700 leading-relaxed">{weakness}</span>
                            </li>
                          ))}
                          {weaknesses.length > 3 && (
                            <li className="text-xs text-muted-foreground pl-5">
                              +{weaknesses.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-3 border-t space-y-2">
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
                          className="w-full hover:bg-blue-50 hover:border-blue-300"
                          onClick={() => window.open(candidate.resume_url!, '_blank', 'noopener,noreferrer')}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Resume
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
