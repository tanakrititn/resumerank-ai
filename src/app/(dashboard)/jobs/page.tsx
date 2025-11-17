import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getJobs } from '@/lib/actions/jobs'
import { Plus, Briefcase, Sparkles, CheckCircle2, Building2, Users2 } from 'lucide-react'
import JobsListClient from '@/components/jobs/jobs-list-client'

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
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Hero Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 sm:p-8 md:p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Job Postings</h1>
              </div>
              <p className="text-white/90 text-sm sm:text-base md:text-lg">
                Manage your recruitment pipeline with AI-powered insights
              </p>
            </div>
            <Link href="/jobs/new" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white text-purple-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base h-10 sm:h-11 md:h-12">
                <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Create New Job
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -left-8 -top-8 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      {/* Quick Stats */}
      {totalJobs > 0 && (
        <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="border-2 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-foreground">{totalJobs}</p>
                </div>
                <div className="p-2 sm:p-2.5 md:p-3 rounded-xl bg-blue-50">
                  <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Open Positions</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-green-600">{openJobs}</p>
                </div>
                <div className="p-2 sm:p-2.5 md:p-3 rounded-xl bg-green-50">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Candidates</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-purple-600">{totalCandidates}</p>
                </div>
                <div className="p-2 sm:p-2.5 md:p-3 rounded-xl bg-purple-50">
                  <Users2 className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Paused</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-amber-600">{pausedJobs}</p>
                </div>
                <div className="p-2 sm:p-2.5 md:p-3 rounded-xl bg-amber-50">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {jobs.length === 0 ? (
        <Card className="border-2 border-dashed bg-gradient-to-br from-slate-50 to-blue-50">
          <CardContent className="py-12 sm:py-16 text-center px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 sm:mb-6 shadow-lg">
              <Briefcase className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 text-foreground">Start Your Recruitment Journey</h3>
            <p className="text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto text-base sm:text-lg leading-relaxed">
              Create your first job posting and let AI help you find the perfect candidates
            </p>
            <Link href="/jobs/new" className="inline-block w-full sm:w-auto">
              <Button size="lg" className="gradient-primary text-white shadow-lg hover:shadow-xl w-full sm:w-auto text-sm sm:text-base h-11 sm:h-12">
                <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Create Your First Job
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <JobsListClient initialJobs={jobs} />
      )}
    </div>
  )
}
