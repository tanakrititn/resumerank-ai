import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getJobs } from '@/lib/actions/jobs'
import { Plus, Briefcase, MapPin, DollarSign, Users2, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type JobWithCount = {
  id: string
  title: string
  description: string
  requirements: string | null
  location: string | null
  salary_range: string | null
  status: string
  created_at: string
  candidatesCount?: number
}

export default async function JobsPage() {
  const result = await getJobs()

  if (result.error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{result.error}</p>
      </div>
    )
  }

  const jobs = (result.data || []) as JobWithCount[]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Jobs</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your job postings and applications
          </p>
        </div>
        <Link href="/jobs/new">
          <Button size="lg" className="gradient-primary shadow-md hover:shadow-lg transition-shadow">
            <Plus className="mr-2 h-5 w-5" />
            New Job
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Briefcase className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">No jobs yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto text-lg">
              Create your first job posting to start receiving applications and
              leverage AI-powered candidate screening
            </p>
            <Link href="/jobs/new">
              <Button size="lg" className="gradient-primary">
                <Plus className="mr-2 h-5 w-5" />
                Create Job
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, index) => {
            const candidatesCount = job.candidatesCount || 0

            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="group animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card className="h-full border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors">
                          {job.title}
                        </CardTitle>
                      </div>
                      <Badge
                        variant={
                          job.status === 'OPEN'
                            ? 'default'
                            : job.status === 'PAUSED'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={
                          job.status === 'OPEN'
                            ? 'bg-green-500 hover:bg-green-600'
                            : ''
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="space-y-2.5">
                      {job.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="line-clamp-1">{job.location}</span>
                        </div>
                      )}
                      {job.salary_range && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="line-clamp-1">{job.salary_range}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <div className="flex items-center px-3 py-1.5 rounded-full bg-primary/10">
                          <Users2 className="mr-1.5 h-4 w-4 text-primary" />
                          <span className="font-medium text-primary">
                            {candidatesCount} {candidatesCount > 1 ? 'candidates' : 'candidate'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(job.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                        View Details
                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
