import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity as ActivityIcon } from 'lucide-react'
import RealtimeAdminStats from '@/components/admin/realtime-admin-stats'
import RealtimeAdminCharts from '@/components/admin/realtime-admin-charts'
import { Badge } from '@/components/ui/badge'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Calculate date 7 days ago for trend comparison
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoISO = sevenDaysAgo.toISOString()

  // Fetch all statistics (admin can see everything)
  const [
    { count: usersCount },
    { count: jobsCount },
    { count: candidatesCount },
    { data: recentActivity },
    { data: jobsData },
    { data: candidatesData },
    { data: profiles },
    { data: allActivities },
    { count: usersCount7DaysAgo },
    { count: jobsCount7DaysAgo },
    { count: candidatesCount7DaysAgo },
    { data: candidatesData7DaysAgo },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('candidates').select('*', { count: 'exact', head: true }),
    supabase
      .from('activity_log')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('jobs').select('status, user_id'),
    supabase.from('candidates').select('status, ai_score'),
    supabase.from('profiles').select('created_at').order('created_at', { ascending: false }).limit(100),
    supabase
      .from('activity_log')
      .select('created_at, action')
      .order('created_at', { ascending: false })
      .limit(100),
    // Data from 7 days ago for trend calculation
    supabase.from('profiles').select('*', { count: 'exact', head: true }).lte('created_at', sevenDaysAgoISO),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).lte('created_at', sevenDaysAgoISO),
    supabase.from('candidates').select('*', { count: 'exact', head: true }).lte('created_at', sevenDaysAgoISO),
    supabase.from('candidates').select('ai_score').not('ai_score', 'is', null).lte('created_at', sevenDaysAgoISO),
  ])

  // Process jobs data for chart
  const jobsStatusCounts = jobsData?.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const jobsChartData = Object.entries(jobsStatusCounts).map(([status, count]) => ({
    status,
    count,
  }))

  // Process candidates data for chart
  const candidatesStatusCounts = candidatesData?.reduce((acc, candidate) => {
    acc[candidate.status] = (acc[candidate.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const candidatesChartData = Object.entries(candidatesStatusCounts).map(([status, count]) => ({
    status: status.replace(/_/g, ' '),
    count,
  }))

  // Process data for new charts
  // 1. User growth over time (last 30 days)
  const userGrowthData = profiles
    ?.reduce((acc: { [key: string]: number }, profile) => {
      const date = new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

  const userGrowthChartData = Object.entries(userGrowthData || {})
    .map(([date, users]) => ({ date, users: users as number }))
    .slice(-14) // Last 14 days

  // 2. Activity timeline (last 14 days)
  const activityTimelineData = allActivities
    ?.reduce((acc: { [key: string]: number }, activity) => {
      const date = new Date(activity.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

  const activityChartData = Object.entries(activityTimelineData || {})
    .map(([date, activities]) => ({ date, activities: activities as number }))
    .slice(-14) // Last 14 days

  // 3. Resource usage by type (group by user for top users)
  const userResourceCounts = jobsData?.reduce((acc: { [key: string]: any }, job) => {
    const userId = job.user_id
    if (!acc[userId]) {
      acc[userId] = { jobs: 0, candidates: 0, analyses: 0 }
    }
    acc[userId].jobs++
    return acc
  }, {} as { [key: string]: { jobs: number; candidates: number; analyses: number } })

  // Add candidate and analysis counts
  candidatesData?.forEach((candidate) => {
    const userId = (candidate as any).user_id
    if (userResourceCounts && userResourceCounts[userId]) {
      userResourceCounts[userId].candidates++
      if (candidate.ai_score !== null) {
        userResourceCounts[userId].analyses++
      }
    }
  })

  // Get top 5 users by total resources
  const resourceChartData = Object.entries(userResourceCounts || {})
    .map(([userId, counts]) => ({
      name: `User ${userId.slice(0, 8)}`,
      jobs: counts.jobs,
      candidates: counts.candidates,
      analyses: counts.analyses,
      total: counts.jobs + counts.candidates + counts.analyses,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map(({ name, jobs, candidates, analyses }) => ({ name, jobs, candidates, analyses }))

  // Calculate average score
  const candidatesWithScores = candidatesData?.filter((c) => c.ai_score !== null) || []
  const avgScore = candidatesWithScores.length > 0
    ? Math.round(candidatesWithScores.reduce((sum, c) => sum + (c.ai_score || 0), 0) / candidatesWithScores.length)
    : 0

  // Calculate average score from 7 days ago
  const avgScore7DaysAgo = candidatesData7DaysAgo && candidatesData7DaysAgo.length > 0
    ? Math.round(candidatesData7DaysAgo.reduce((sum: number, c: any) => sum + (c.ai_score || 0), 0) / candidatesData7DaysAgo.length)
    : 0

  // Helper function to calculate percentage change
  const calculateTrend = (current: number, previous: number): { trend: string; trendUp: boolean } => {
    if (previous === 0) {
      // If no previous data, show positive trend if current > 0
      return { trend: current > 0 ? '+100%' : '0%', trendUp: current > 0 }
    }
    const change = ((current - previous) / previous) * 100
    const isPositive = change >= 0
    return {
      trend: `${isPositive ? '+' : ''}${Math.round(change)}%`,
      trendUp: isPositive,
    }
  }

  // Calculate trends
  const usersTrend = calculateTrend(usersCount || 0, usersCount7DaysAgo || 0)
  const jobsTrend = calculateTrend(jobsCount || 0, jobsCount7DaysAgo || 0)
  const candidatesTrend = calculateTrend(candidatesCount || 0, candidatesCount7DaysAgo || 0)
  const scoreTrend = calculateTrend(avgScore, avgScore7DaysAgo)

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 min-h-screen">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-3xl -z-10" />
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            System-wide overview and statistics
          </p>
        </div>
      </div>

      {/* Stats Grid - Real-time */}
      <RealtimeAdminStats
        initialStats={{
          usersCount: usersCount || 0,
          jobsCount: jobsCount || 0,
          candidatesCount: candidatesCount || 0,
          avgScore,
          usersTrend: usersTrend.trend,
          usersTrendUp: usersTrend.trendUp,
          jobsTrend: jobsTrend.trend,
          jobsTrendUp: jobsTrend.trendUp,
          candidatesTrend: candidatesTrend.trend,
          candidatesTrendUp: candidatesTrend.trendUp,
          scoreTrend: scoreTrend.trend,
          scoreTrendUp: scoreTrend.trendUp,
        }}
      />

      {/* Charts Section - Real-time */}
      <RealtimeAdminCharts
        initialData={{
          jobsChartData,
          candidatesChartData,
          userGrowthChartData,
          activityChartData,
          resourceChartData,
        }}
      />

      {/* Recent Activity */}
      <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Recent Activity
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Latest system actions and events</p>
            </div>
            <div className="p-3 rounded-xl bg-pink-500/10">
              <ActivityIcon className="h-5 w-5 text-pink-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!recentActivity || recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                <ActivityIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-purple-50/50 transition-all duration-200 group border border-transparent hover:border-purple-100"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {((activity.profiles as any)?.full_name?.[0] ||
                        (activity.profiles as any)?.email?.[0] ||
                        'U').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {(activity.profiles as any)?.full_name ||
                          (activity.profiles as any)?.email ||
                          'Unknown User'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {activity.action.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
