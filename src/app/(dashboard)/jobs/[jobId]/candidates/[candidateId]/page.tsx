import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, Mail, Phone, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import AnalyzeButton from '@/components/candidates/analyze-button'

const statusColors = {
  PENDING_REVIEW: 'secondary',
  REVIEWED: 'default',
  SHORTLISTED: 'default',
  REJECTED: 'destructive',
  HIRED: 'default',
} as const

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

  const job = candidate.jobs as any

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/jobs/${jobId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{candidate.name}</h1>
            <Badge variant={statusColors[candidate.status as keyof typeof statusColors]}>
              {candidate.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Candidate for {job.title}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <span>{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate.resume_url && (
                <div>
                  <Button asChild variant="outline">
                    <a
                      href={candidate.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Resume
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>AI Analysis</CardTitle>
                <AnalyzeButton candidateId={candidateId} />
              </div>
            </CardHeader>
            <CardContent>
              {candidate.ai_score !== null ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-5xl font-bold text-primary">
                        {candidate.ai_score}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Match Score
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          candidate.ai_score >= 70
                            ? 'default'
                            : candidate.ai_score >= 50
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="text-lg px-4 py-2"
                      >
                        {candidate.ai_score >= 70
                          ? 'Strong Match'
                          : candidate.ai_score >= 50
                          ? 'Moderate Match'
                          : 'Weak Match'}
                      </Badge>
                    </div>
                  </div>

                  {candidate.ai_summary && (
                    <div>
                      <h3 className="font-semibold mb-2">Summary</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {candidate.ai_summary}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {candidate.status === 'PENDING_REVIEW'
                      ? 'AI analysis in progress...'
                      : 'No AI analysis available yet'}
                  </p>
                  <AnalyzeButton candidateId={candidateId} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {candidate.notes && (
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {candidate.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Badge variant={statusColors[candidate.status as keyof typeof statusColors]}>
                  {candidate.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Added</p>
                <p className="font-medium" suppressHydrationWarning>
                  {formatDistanceToNow(new Date(candidate.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {candidate.updated_at !== candidate.created_at && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Last Updated
                  </p>
                  <p className="font-medium" suppressHydrationWarning>
                    {formatDistanceToNow(new Date(candidate.updated_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
