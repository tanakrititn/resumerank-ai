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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

interface CandidateDetailCardProps {
  candidate: Candidate
  status: typeof statusConfig[keyof typeof statusConfig]
  StatusIcon: any
  recConfig: typeof recommendationConfig[keyof typeof recommendationConfig] | null
  strengths: string[]
  weaknesses: string[]
  updatingId: string | null
  handleStatusChange: (candidateId: string, status: string) => Promise<void>
  getScoreBackground: (score: number | null) => string
  getScoreColor: (score: number | null) => string
}

function CandidateDetailCard({
  candidate,
  status,
  StatusIcon,
  recConfig,
  strengths,
  weaknesses,
  updatingId,
  handleStatusChange,
  getScoreBackground,
  getScoreColor,
}: CandidateDetailCardProps) {
  const RecIcon = recConfig?.icon

  return (
    <Card className="border-2 hover:border-primary/50 hover:shadow-xl transition-all overflow-hidden pt-0">
      {/* Header with gradient background */}
      <div className={`relative bg-gradient-to-r ${recConfig?.bgClass || 'from-gray-50 to-slate-50'} p-3 sm:p-4 border-b-2`}>
        <div className="relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg flex-shrink-0">
              {candidate.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg truncate">{candidate.name}</h3>
              {status && StatusIcon && (
                <Badge className={`${status.className} inline-flex items-center gap-1 mt-1 text-xs`}>
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
                className="w-full bg-white hover:bg-gray-50 text-xs sm:text-sm"
                disabled={updatingId === candidate.id}
              >
                {updatingId === candidate.id ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    Change Status
                    <ChevronDown className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
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

      <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Contact Info */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-start gap-2 text-xs sm:text-sm">
            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 text-blue-600 flex-shrink-0" />
            <span className="break-all text-muted-foreground">{candidate.email}</span>
          </div>
          {candidate.phone && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
              <span className="text-muted-foreground">{candidate.phone}</span>
            </div>
          )}
        </div>

        {/* AI Summary */}
        {candidate.ai_summary && (
          <div className={`p-2.5 sm:p-3 rounded-lg bg-gradient-to-r ${getScoreBackground(candidate.ai_score)} border`}>
            <div className="flex items-start gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 text-purple-700 flex-shrink-0" />
              <span className="text-xs font-bold text-purple-900 uppercase">AI Summary</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
              {candidate.ai_summary}
            </p>
          </div>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-green-700">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Strengths</span>
            </div>
            <ul className="space-y-1 sm:space-y-1.5">
              {strengths.slice(0, 3).map((strength, idx) => (
                <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 leading-relaxed">{strength}</span>
                </li>
              ))}
              {strengths.length > 3 && (
                <li className="text-xs text-muted-foreground pl-4 sm:pl-5">
                  +{strengths.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-amber-700">
              <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Areas for Growth</span>
            </div>
            <ul className="space-y-1 sm:space-y-1.5">
              {weaknesses.slice(0, 3).map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-1.5 sm:gap-2 text-xs">
                  <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 leading-relaxed">{weakness}</span>
                </li>
              ))}
              {weaknesses.length > 3 && (
                <li className="text-xs text-muted-foreground pl-4 sm:pl-5">
                  +{weaknesses.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 sm:pt-3 border-t space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span suppressHydrationWarning>
              Applied {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
            </span>
          </div>
          {candidate.resume_url && (
            <Button
              variant="outline"
              size="sm"
              className="w-full hover:bg-blue-50 hover:border-blue-300 text-xs sm:text-sm"
              onClick={() => window.open(candidate.resume_url!, '_blank', 'noopener,noreferrer')}
            >
              <Download className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Download Resume
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
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
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0 sm:p-6">
        {/* Gradient Header */}
        <div className="relative overflow-hidden mb-4 sm:mb-6 sm:-mx-6 sm:-mt-6">
          <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-4 sm:p-6 text-white">
            <div className="relative z-10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0">
                  <Scale className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
                    Candidate Comparison
                  </DialogTitle>
                  <DialogDescription className="text-white/90 text-sm sm:text-base mt-0.5 sm:mt-1">
                    Compare {compareCandidates.length} candidates with AI insights
                  </DialogDescription>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -left-8 -top-8 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-white/10 blur-3xl"></div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
          {/* AI Score & Recommendation Comparison */}
          <Card className="border-2 shadow-lg overflow-hidden p-0">
            <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-cyan-50 p-3 sm:p-5">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                <h3 className="font-bold text-base sm:text-lg">AI Analysis Overview</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                          ? 'border-green-500 shadow-xl sm:scale-105 ring-2 ring-green-200'
                          : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
                      }`}
                    >
                      {isWinner && (
                        <div className="absolute top-0 right-0 z-10">
                          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-bl-lg shadow-lg">
                            <div className="flex items-center gap-1 text-xs font-bold">
                              <Trophy className="h-3 w-3" />
                              <span className="hidden sm:inline">Top Score</span>
                              <span className="sm:hidden">Top</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-4 sm:p-5">
                        <div className="text-center mb-3 sm:mb-4">
                          <div className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-2 ${getScoreColor(candidate.ai_score)}`}>
                            {candidate.ai_score || '-'}
                          </div>
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 truncate px-2">
                            {candidate.name}
                          </div>
                          {candidate.ai_score ? (
                            <Progress
                              value={candidate.ai_score}
                              className="h-2 sm:h-3 rounded-full"
                            />
                          ) : (
                            <div className="text-xs text-muted-foreground">No score yet</div>
                          )}
                        </div>

                        {recConfig && RecIcon && (
                          <Badge className={`${recConfig.className} w-full justify-center py-1.5 sm:py-2 text-xs sm:text-sm font-semibold shadow-sm`}>
                            <RecIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                            <span className="truncate">{recConfig.label}</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Quick Comparison - Desktop Table / Mobile Cards */}
          <Card className="border-2 shadow-lg pt-0">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-3 sm:p-4 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                <h3 className="font-bold text-base sm:text-lg">Quick Comparison</h3>
              </div>
            </div>
            <CardContent className="p-0">
              {/* Desktop: Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Attribute</th>
                      {compareCandidates.map((candidate) => (
                        <th key={candidate.id} className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase truncate max-w-[150px]">
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
                            <Badge className={`${status?.className || ''} inline-flex items-center gap-1 text-xs`}>
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
                        <td key={candidate.id} className="px-4 py-3">
                          <div className="text-xs space-y-1 max-w-[200px] mx-auto">
                            <div className="flex items-center justify-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{candidate.email}</span>
                            </div>
                            {candidate.phone && (
                              <div className="flex items-center justify-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
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

              {/* Mobile: Card View */}
              <div className="md:hidden divide-y">
                {compareCandidates.map((candidate) => {
                  const status = statusConfig[candidate.status as keyof typeof statusConfig]
                  const StatusIcon = status?.icon

                  return (
                    <div key={candidate.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{candidate.name}</h4>
                        <span className={`text-2xl font-bold ${getScoreColor(candidate.ai_score)}`}>
                          {candidate.ai_score || '-'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Status:</span>
                        <Badge className={`${status?.className || ''} inline-flex items-center gap-1 text-xs`}>
                          {StatusIcon && <StatusIcon className="h-3 w-3" />}
                          {status?.label || candidate.status}
                        </Badge>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{candidate.email}</span>
                        </div>
                        {candidate.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span>{candidate.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground" suppressHydrationWarning>
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>Applied {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Comparison - Mobile: Tabs, Desktop: Grid */}
          {/* Mobile: Tabs */}
          <div className="md:hidden">
            <Tabs defaultValue={compareCandidates[0]?.id} className="w-full">
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${compareCandidates.length}, 1fr)` }}>
                {compareCandidates.map((candidate, index) => (
                  <TabsTrigger key={candidate.id} value={candidate.id} className="text-xs sm:text-sm truncate">
                    {candidate.name.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {compareCandidates.map((candidate) => {
                const status = statusConfig[candidate.status as keyof typeof statusConfig]
                const StatusIcon = status?.icon
                const recommendation = (candidate as any).ai_recommendation as keyof typeof recommendationConfig | null
                const recConfig = recommendation ? recommendationConfig[recommendation] : null

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
                  <TabsContent key={candidate.id} value={candidate.id} className="mt-3">
                    <CandidateDetailCard
                      candidate={candidate}
                      status={status}
                      StatusIcon={StatusIcon}
                      recConfig={recConfig}
                      strengths={strengths}
                      weaknesses={weaknesses}
                      updatingId={updatingId}
                      handleStatusChange={handleStatusChange}
                      getScoreBackground={getScoreBackground}
                      getScoreColor={getScoreColor}
                    />
                  </TabsContent>
                )
              })}
            </Tabs>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compareCandidates.map((candidate) => {
              const status = statusConfig[candidate.status as keyof typeof statusConfig]
              const StatusIcon = status?.icon
              const recommendation = (candidate as any).ai_recommendation as keyof typeof recommendationConfig | null
              const recConfig = recommendation ? recommendationConfig[recommendation] : null

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
                <CandidateDetailCard
                  key={candidate.id}
                  candidate={candidate}
                  status={status}
                  StatusIcon={StatusIcon}
                  recConfig={recConfig}
                  strengths={strengths}
                  weaknesses={weaknesses}
                  updatingId={updatingId}
                  handleStatusChange={handleStatusChange}
                  getScoreBackground={getScoreBackground}
                  getScoreColor={getScoreColor}
                />
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
