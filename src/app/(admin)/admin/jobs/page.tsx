import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, PlayCircle, PauseCircle, XCircle, Users, TrendingUp, Building2 } from 'lucide-react'
import AdminJobsTable from '@/components/admin/jobs-table'

export default async function AdminJobsPage() {
  const supabase = await createClient()

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      *,
      profiles(full_name, email),
      candidates:candidates(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30">
        <Card className="p-12 max-w-md text-center border-2 border-red-200 bg-red-50/50">
          <div className="inline-flex p-4 rounded-full bg-red-100 mb-4">
            <Briefcase className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Jobs</h2>
          <p className="text-red-600">{error.message}</p>
        </Card>
      </div>
    )
  }

  // Calculate statistics
  const statusCounts = jobs?.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const totalCandidates = jobs?.reduce((sum, job) => {
    const count = Array.isArray(job.candidates) && job.candidates.length > 0
      ? ((job.candidates[0] as any).count || 0)
      : 0
    return sum + count
  }, 0) || 0

  const avgCandidatesPerJob = jobs?.length ? Math.round(totalCandidates / jobs.length) : 0

  const recentJobs = jobs?.filter(job => {
    const daysSinceCreated = (Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceCreated <= 7
  }).length || 0

  return (
    <div className="space-y-6 p-4 sm:p-8 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Jobs Management</h1>
              <p className="text-white/90 mt-1 text-sm sm:text-base">
                Manage all job postings across the platform
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-5">
        <Card className="border-2 hover:shadow-lg transition-shadow overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-1">
            <CardContent className="p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {jobs?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {recentJobs} new this week
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow overflow-hidden">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-1">
            <CardContent className="p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Open</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-green-600">
                    {statusCounts['OPEN'] || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Active positions
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
                  <PlayCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow overflow-hidden">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-1">
            <CardContent className="p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Paused</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-amber-600">
                    {statusCounts['PAUSED'] || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Temporarily on hold
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100">
                  <PauseCircle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow overflow-hidden">
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-1">
            <CardContent className="p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Closed</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-gray-600">
                    {statusCounts['CLOSED'] || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Filled positions
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-100 to-slate-100">
                  <XCircle className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow overflow-hidden">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-1">
            <CardContent className="p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Candidates</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-purple-600">
                    {totalCandidates}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ~{avgCandidatesPerJob} per job
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      <AdminJobsTable jobs={jobs || []} />
    </div>
  )
}
