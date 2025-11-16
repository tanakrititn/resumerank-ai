import { getCandidates } from '@/lib/actions/candidates'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, Download } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

const statusColors = {
  PENDING_REVIEW: 'secondary',
  REVIEWED: 'default',
  SHORTLISTED: 'default',
  REJECTED: 'destructive',
  HIRED: 'default',
} as const

export default async function CandidatesList({ jobId }: { jobId: string }) {
  const result = await getCandidates(jobId)

  if (result.error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-red-600">{result.error}</p>
        </CardContent>
      </Card>
    )
  }

  const candidates = result.data || []

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Candidates ({candidates.length})</CardTitle>
          <Link href={`/jobs/${jobId}/candidates/new`}>
            <Button size="sm">Add Candidate</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No candidates yet. Add your first candidate to get started!
            </p>
            <Link href={`/jobs/${jobId}/candidates/new`}>
              <Button className="gradient-primary">Add Candidate</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <Link
                key={candidate.id}
                href={`/jobs/${jobId}/candidates/${candidate.id}`}
              >
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">{candidate.name}</h3>
                        <Badge variant={statusColors[candidate.status as keyof typeof statusColors]}>
                          {candidate.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="grid gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4" />
                          {candidate.email}
                        </div>
                        {candidate.phone && (
                          <div className="flex items-center">
                            <Phone className="mr-2 h-4 w-4" />
                            {candidate.phone}
                          </div>
                        )}
                      </div>

                      {candidate.ai_summary && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {candidate.ai_summary}
                        </p>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Added{' '}
                        {formatDistanceToNow(new Date(candidate.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>

                    <div className="ml-4 text-right space-y-2">
                      {candidate.ai_score !== null ? (
                        <div>
                          <div className="text-3xl font-bold">
                            {candidate.ai_score}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            AI Score
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {candidate.status === 'PENDING_REVIEW'
                            ? 'Analyzing...'
                            : 'Not scored'}
                        </div>
                      )}

                      {candidate.resume_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={candidate.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
