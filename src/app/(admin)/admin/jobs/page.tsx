import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Briefcase } from 'lucide-react'
import AdminJobsTable from '@/components/admin/jobs-table'

export default async function AdminJobsPage() {
  const supabase = await createClient()

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*, profiles(full_name, email), candidates(count)')
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

  // Count jobs by status
  const statusCounts = jobs?.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-3xl -z-10" />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Jobs Management
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage all job postings across the platform
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Card className="px-6 py-3 border-2 border-purple-200 bg-white/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {jobs?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Jobs</div>
              </div>
            </Card>
            <Card className="px-6 py-3 border-2 border-green-200 bg-white/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {statusCounts['OPEN'] || 0}
                </div>
                <div className="text-xs text-muted-foreground">Open</div>
              </div>
            </Card>
            <Card className="px-6 py-3 border-2 border-yellow-200 bg-white/80 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {statusCounts['PAUSED'] || 0}
                </div>
                <div className="text-xs text-muted-foreground">Paused</div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AdminJobsTable jobs={jobs || []} />
    </div>
  )
}
