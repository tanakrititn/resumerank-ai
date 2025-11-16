import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getJobs } from '@/lib/actions/jobs'
import { Plus, Briefcase, MapPin, DollarSign, Users2, ArrowRight, Sparkles, TrendingUp, CheckCircle2, Building2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import JobCardActions from '@/components/jobs/job-card-actions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

  // Calculate stats
  const totalJobs = jobs.length
  const openJobs = jobs.filter(j => j.status === 'OPEN').length
  const totalCandidates = jobs.reduce((sum, job) => sum + (job.candidatesCount || 0), 0)
  const pausedJobs = jobs.filter(j => j.status === 'PAUSED').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h1 className="text-4xl font-bold">Job Postings</h1>
              </div>
              <p className="text-white/90 text-lg">
                Manage your recruitment pipeline with AI-powered insights
              </p>
            </div>
            <Link href="/jobs/new">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all">
                <Plus className="mr-2 h-5 w-5" />
                Create New Job
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      {/* Quick Stats */}
      {totalJobs > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-2 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                  <p className="text-3xl font-bold mt-1">{totalJobs}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Open Positions</p>
                  <p className="text-3xl font-bold mt-1 text-green-600">{openJobs}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-50">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Candidates</p>
                  <p className="text-3xl font-bold mt-1 text-purple-600">{totalCandidates}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50">
                  <Users2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Paused</p>
                  <p className="text-3xl font-bold mt-1 text-amber-600">{pausedJobs}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50">
                  <Building2 className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {jobs.length === 0 ? (
        <Card className="border-2 border-dashed bg-gradient-to-br from-slate-50 to-blue-50">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg">
              <Briefcase className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-3">Start Your Recruitment Journey</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Create your first job posting and let AI help you find the perfect candidates
            </p>
            <Link href="/jobs/new">
              <Button size="lg" className="gradient-primary shadow-lg hover:shadow-xl">
                <Sparkles className="mr-2 h-5 w-5" />
                Create Your First Job
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All ({totalJobs})</TabsTrigger>
            <TabsTrigger value="open">Open ({openJobs})</TabsTrigger>
            <TabsTrigger value="paused">Paused ({pausedJobs})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="open" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.filter(j => j.status === 'OPEN').map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="paused" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.filter(j => j.status === 'PAUSED').map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

// Job Card Component
function JobCard({ job, index }: { job: JobWithCount; index: number }) {
  const candidatesCount = job.candidatesCount || 0

  return (
    <div
      className="group animate-scale-in relative"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <Link href={`/jobs/${job.id}`}>
        <Card className="h-full border-2 hover:border-primary/50 hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2 overflow-hidden">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

          <CardHeader className="space-y-3 relative z-10">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors font-bold">
                  {job.title}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={job.status === 'OPEN' ? 'default' : 'secondary'}
                  className={
                    job.status === 'OPEN'
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold shadow-sm'
                      : 'bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold shadow-sm'
                  }
                >
                  {job.status}
                </Badge>
                <JobCardActions jobId={job.id} jobTitle={job.title} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 relative z-10">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {job.description}
            </p>

            <div className="space-y-2">
              {job.location && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <span className="text-muted-foreground line-clamp-1 flex-1">{job.location}</span>
                </div>
              )}
              {job.salary_range && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
                    <DollarSign className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-muted-foreground line-clamp-1 flex-1">{job.salary_range}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 group-hover:from-purple-100 group-hover:to-blue-100 transition-colors">
                  <Users2 className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Candidates</span>
                  <span className="text-sm font-bold text-purple-600">{candidatesCount}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                View Details
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
