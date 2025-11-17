import { createClient } from '@/lib/supabase/server'
import UsersTable from '@/components/admin/users-table'
import { Card, CardContent } from '@/components/ui/card'
import { Users as UsersIcon, Shield, TrendingUp, Briefcase, FileText, Crown, Sparkles } from 'lucide-react'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const [
    { data: users, error },
    { count: totalJobs },
    { count: totalCandidates }
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*, user_quotas(*)')
      .order('created_at', { ascending: false }),
    supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('candidates')
      .select('*', { count: 'exact', head: true })
  ])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30">
        <Card className="p-12 max-w-md text-center border-2 border-red-200 bg-red-50/50">
          <div className="inline-flex p-4 rounded-full bg-red-100 mb-4">
            <UsersIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Users</h2>
          <p className="text-red-600">{error.message}</p>
        </Card>
      </div>
    )
  }

  // Calculate statistics
  const adminCount = users?.filter(u => u.is_admin).length || 0
  const activeUsers = users?.filter(u => {
    const daysSinceCreated = (Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceCreated <= 30
  }).length || 0
  const totalCredits = users?.reduce((sum, u) => sum + (u.user_quotas?.ai_credits || 0), 0) || 0
  const usedCredits = users?.reduce((sum, u) => sum + (u.user_quotas?.used_credits || 0), 0) || 0

  return (
    <div className="space-y-6 p-4 sm:p-8 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <UsersIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Users Management</h1>
              <p className="text-white/90 mt-1 text-sm sm:text-base">
                Manage all registered users and their permissions
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:shadow-lg transition-shadow overflow-hidden">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-1">
            <CardContent className="p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {users?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeUsers} new this month
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100">
                  <UsersIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow overflow-hidden">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-1">
            <CardContent className="p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Admins</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-amber-600">
                    {adminCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {users?.length ? Math.round((adminCount / users.length) * 100) : 0}% of total
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                  <Crown className="h-6 w-6 text-amber-600" />
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
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">AI Credits Usage</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-green-600">
                    {Math.round((usedCredits / (totalCredits || 1)) * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {usedCredits.toLocaleString()} / {totalCredits.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-1">
            <CardContent className="p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Platform Activity</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-blue-600">
                    {(totalJobs || 0) + (totalCandidates || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalJobs} jobs, {totalCandidates} candidates
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      <UsersTable users={users || []} />
    </div>
  )
}