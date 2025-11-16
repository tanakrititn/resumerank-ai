import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const supabase = await createClient()

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*, profiles(full_name, email), candidates(*)')
    .eq('id', jobId)
    .single()

  if (error || !job) {
    notFound()
  }

  const profile = job.profiles as any
  const candidates = (job.candidates as any[]) || []

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <Link href="/admin/jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <Badge
              variant={
                job.status === 'OPEN'
                  ? 'default'
                  : job.status === 'PAUSED'
                  ? 'secondary'
                  : 'outline'
              }
            >
              {job.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Posted by {profile?.full_name || profile?.email} •{' '}
            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(job.location || job.salary_range) && (
              <div className="flex flex-wrap gap-4">
                {job.location && (
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {job.location}
                  </div>
                )}
                {job.salary_range && (
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="mr-2 h-4 w-4" />
                    {job.salary_range}
                  </div>
                )}
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {job.requirements && (
              <div>
                <h3 className="font-semibold mb-2">Requirements</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {job.requirements}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Candidates ({candidates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {candidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No candidates yet</p>
            ) : (
              <div className="space-y-4">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {candidate.email}
                      </p>
                    </div>
                    <div className="text-right">
                      {candidate.ai_score !== null ? (
                        <p className="text-lg font-bold">
                          {candidate.ai_score}/100
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Not scored
                        </p>
                      )}
                      <Badge variant="secondary" className="mt-1">
                        {candidate.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
