import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Activity as ActivityIcon, Clock, Users, Shield, TrendingUp, Sparkles, Zap } from 'lucide-react'
import ActivityLogTable from '@/components/admin/activity-log-table'

export default async function AdminActivityPage() {
  const supabase = await createClient()

  const { data: activities, error } = await supabase
    .from('activity_log')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30">
        <Card className="p-12 max-w-md text-center border-2 border-red-200 bg-red-50/50">
          <div className="inline-flex p-4 rounded-full bg-red-100 mb-4">
            <ActivityIcon className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Activity Log</h2>
          <p className="text-red-600">{error.message}</p>
        </Card>
      </div>
    )
  }

  // Calculate statistics
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000)

  const last24h = activities?.filter(
    (a) => new Date(a.created_at) > yesterday
  ).length || 0

  const lastHourCount = activities?.filter(
    (a) => new Date(a.created_at) > lastHour
  ).length || 0

  const lastWeekCount = activities?.filter(
    (a) => new Date(a.created_at) > lastWeek
  ).length || 0

  const adminActions = activities?.filter((a) =>
    a.action.startsWith('ADMIN_')
  ).length || 0

  const userActions = (activities?.length || 0) - adminActions

  const aiAnalyses = activities?.filter((a) =>
    a.action === 'AI_ANALYSIS_COMPLETED'
  ).length || 0

  const uniqueUsers = new Set(activities?.map(a => a.user_id)).size

  return (
    <div className="space-y-6 p-4 sm:p-8 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
              <ActivityIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">Activity Log</h1>
              <p className="text-white/90 mt-1 text-sm sm:text-base">
                System-wide audit trail and activity monitoring
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
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-1">
            <CardContent className="p-4 sm:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Last 24 Hours</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-blue-600">
                    {last24h}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lastHourCount} in last hour
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100">
                  <Clock className="h-6 w-6 text-blue-600" />
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
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">User Actions</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-green-600">
                    {userActions}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {uniqueUsers} active users
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
                  <Users className="h-6 w-6 text-green-600" />
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
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Admin Actions</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-purple-600">
                    {adminActions}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((adminActions / (activities?.length || 1)) * 100)}% of total
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100">
                  <Shield className="h-6 w-6 text-purple-600" />
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
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">AI Analyses</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 text-amber-600">
                    {aiAnalyses}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Completed scans
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                  <Sparkles className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Additional Quick Stats */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Week Activity</p>
                <p className="text-2xl font-bold text-blue-600">{lastWeekCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ~{Math.round(lastWeekCount / 7)} per day
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Peak Activity</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.max(...(activities?.map(a => {
                    const hour = new Date(a.created_at).getHours()
                    return hour
                  }) || [0]))}:00
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Most active hour
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
                <ActivityIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold text-green-600">{activities?.length || 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showing last 200
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ActivityLogTable activities={activities || []} />
    </div>
  )
}
