import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  User,
  Calendar,
  Clock,
  Briefcase,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  Target,
  Activity
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import ReAnalyzeButton from '@/components/candidates/re-analyze-button'
import CandidateActions from '@/components/candidates/candidate-actions'
import ScoreGauge from '@/components/candidates/score-gauge'
import AIAnalysisDetails from '@/components/candidates/ai-analysis-details'
import TagBadge from '@/components/tags/tag-badge'
import type { Tag } from '@/lib/utils/tags'

const statusConfig = {
  PENDING_REVIEW: {
    label: 'Pending Review',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    icon: Clock,
  },
  REVIEWED: {
    label: 'Reviewed',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    icon: CheckCircle2,
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
    icon: Target,
  },
  INTERVIEWED: {
    label: 'Interviewed',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
    icon: Activity,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    icon: XCircle,
  },
  HIRED: {
    label: 'Hired',
    color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    icon: Award,
  },
} as const

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-blue-600 dark:text-blue-400'
  if (score >= 40) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreBadge(score: number) {
  if (score >= 80) return { label: 'Excellent Match', color: 'bg-green-500' }
  if (score >= 60) return { label: 'Good Match', color: 'bg-blue-500' }
  if (score >= 40) return { label: 'Fair Match', color: 'bg-amber-500' }
  return { label: 'Poor Match', color: 'bg-red-500' }
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ jobId: string; candidateId: string }>
}) {
  const { jobId, candidateId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Fetch candidate with job info
  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('*, jobs(*)')
    .eq('id', candidateId)
    .eq('job_id', jobId)
    .eq('user_id', user.id)
    .single()

  if (error || !candidate) {
    notFound()
  }

  const job = (candidate.jobs as { title: string; location?: string; department?: string } | null) || { title: 'Unknown Position' }
  const status = candidate.status as keyof typeof statusConfig
  const statusInfo = statusConfig[status] || statusConfig.PENDING_REVIEW
  const StatusIcon = statusInfo.icon
  const candidateTags = (candidate.tags as unknown as Tag[]) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3">
          <Link href={`/jobs/${jobId}`}>
            <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <p className="text-sm text-muted-foreground">Back to</p>
            <p className="text-sm font-medium">{job.title}</p>
          </div>
        </div>

        {/* Hero Section - Candidate Overview */}
        <Card className="overflow-hidden border-2 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left: Candidate Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                      {candidate.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.color} font-medium text-sm`}>
                        <StatusIcon className="h-4 w-4" />
                        {statusInfo.label}
                      </div>
                      {candidateTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {candidateTags.map((tag) => (
                            <TagBadge key={tag.name} tag={tag} size="sm" />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${candidate.email}`} className="hover:text-primary transition-colors">
                          {candidate.email}
                        </a>
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${candidate.phone}`} className="hover:text-primary transition-colors">
                            {candidate.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: AI Score */}
              {candidate.ai_score !== null && (
                <div className="lg:border-l lg:pl-8">
                  <ScoreGauge score={candidate.ai_score} size={180} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions Bar */}
        <Card className="border-2 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              {candidate.resume_url && (
                <Button asChild variant="default" className="gap-2">
                  <a
                    href={candidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                    Download Resume
                  </a>
                </Button>
              )}

              {candidate.ai_score !== null && (
                <ReAnalyzeButton
                  candidateId={candidateId}
                  candidateName={candidate.name}
                  variant="outline"
                  size="default"
                  showIcon={true}
                />
              )}

              <div className="ml-auto">
                <CandidateActions
                  candidateId={candidateId}
                  jobId={jobId}
                  currentStatus={candidate.status}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Analysis Section */}
            {candidate.ai_score !== null ? (
              <Card className="border-2 shadow-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div className="pt-5">
                      <CardTitle>AI Analysis</CardTitle>
                      <CardDescription>
                        Analyzed {formatDistanceToNow(new Date(candidate.updated_at), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Score Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className={`text-3xl font-bold mb-1 ${getScoreColor(candidate.ai_score)}`}>
                        {candidate.ai_score}
                      </div>
                      <div className="text-xs text-muted-foreground">Overall Score</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className={`text-3xl font-bold mb-1 ${candidate.ai_score >= 60 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {candidate.ai_score >= 60 ? '✓' : '~'}
                      </div>
                      <div className="text-xs text-muted-foreground">Qualification</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <Badge className={`${getScoreBadge(candidate.ai_score).color} text-white text-xs px-3 py-1`}>
                        {getScoreBadge(candidate.ai_score).label}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-2">Match Level</div>
                    </div>
                  </div>

                  <Separator />

                  {/* AI Analysis Details Component */}
                  <AIAnalysisDetails
                    score={candidate.ai_score}
                    summary={candidate.ai_summary || ''}
                    strengths={(candidate.ai_strengths as unknown as string[]) || []}
                    weaknesses={(candidate.ai_weaknesses as unknown as string[]) || []}
                    recommendation={(candidate.ai_recommendation as 'HIRE' | 'INTERVIEW' | 'REJECT' | null) || null}
                    compact={false}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No AI Analysis Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    {candidate.status === 'PENDING_REVIEW'
                      ? 'Analysis is in progress. This may take a few moments.'
                      : 'This candidate has not been analyzed yet.'}
                  </p>
                  {candidate.status !== 'PENDING_REVIEW' && (
                    <p className="text-sm text-muted-foreground">
                      AI analysis happens automatically when candidates are added.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes Section */}
            {candidate.notes && (
              <Card className="border-2 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Notes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {candidate.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Information */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <CardTitle>Position</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-1">{job.title}</p>
                  {job.location && (
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                  )}
                </div>
                {job.department && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Department</p>
                    <p className="text-sm font-medium">{job.department}</p>
                  </div>
                )}
                <Separator />
                <Link href={`/jobs/${jobId}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Job Details
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle>Timeline</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                      <Clock className="h-3 w-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">Applied</p>
                      <p className="text-sm font-medium" suppressHydrationWarning>
                        {format(new Date(candidate.created_at), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                        {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {candidate.updated_at !== candidate.created_at && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900 mt-0.5">
                          <Activity className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">Last Updated</p>
                          <p className="text-sm font-medium" suppressHydrationWarning>
                            {format(new Date(candidate.updated_at), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                            {formatDistanceToNow(new Date(candidate.updated_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-2 shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-base">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={`${statusInfo.color} font-medium`}>
                    {statusInfo.label}
                  </Badge>
                </div>
                {candidate.ai_score !== null && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">AI Score</span>
                    <span className={`font-bold ${getScoreColor(candidate.ai_score)}`}>
                      {candidate.ai_score}/100
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Resume</span>
                  <span className="font-medium">
                    {candidate.resume_url ? (
                      <span className="text-green-600 dark:text-green-400">Available</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400">Not uploaded</span>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
