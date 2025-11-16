import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Briefcase, FileText, TrendingUp, Activity as ActivityIcon, ArrowUpRight, ArrowDownRight, LineChart, BarChart3 } from 'lucide-react'
import JobsStatusChart from '@/components/admin/jobs-status-chart'
import CandidatesStatusChart from '@/components/admin/candidates-status-chart'
import UserGrowthChart from '@/components/admin/user-growth-chart'
import ActivityTimelineChart from '@/components/admin/activity-timeline-chart'
import ResourceUsageChart from '@/components/admin/resource-usage-chart'
import { Badge } from '@/components/ui/badge'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

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

  const stats = [
    {
      title: 'Total Users',
      value: usersCount || 0,
      icon: Users,
      description: 'Registered recruiters',
      trend: '+12%',
      trendUp: true,
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Jobs',
      value: jobsCount || 0,
      icon: Briefcase,
      description: 'Job postings',
      trend: '+8%',
      trendUp: true,
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Total Candidates',
      value: candidatesCount || 0,
      icon: FileText,
      description: 'Applications received',
      trend: '+23%',
      trendUp: true,
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-600',
    },
    {
      title: 'Avg. Score',
      value: '78',
      icon: TrendingUp,
      description: 'AI analysis average',
      trend: '+5%',
      trendUp: true,
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-600',
    },
  ]

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

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className="relative overflow-hidden border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-xl hover:shadow-purple-100 hover:-translate-y-1 group bg-white/80 backdrop-blur-sm"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${
                    stat.trendUp ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trendUp ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {stat.trend}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Jobs by Status
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Distribution of job postings</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <JobsStatusChart data={jobsChartData} />
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Candidates by Status
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Application status overview</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CandidatesStatusChart data={candidatesChartData} />
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-2 hover:border-purple-200 transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-50">
                <LineChart className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  User Growth
                </CardTitle>
                <p className="text-xs text-muted-foreground">Last 14 days</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <UserGrowthChart data={userGrowthChartData} />
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-blue-200 transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50">
                <LineChart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Activity Timeline
                </CardTitle>
                <p className="text-xs text-muted-foreground">System activity trends</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ActivityTimelineChart data={activityChartData} />
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-green-200 transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-50">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Resource Usage
                </CardTitle>
                <p className="text-xs text-muted-foreground">Top 5 active users</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResourceUsageChart data={resourceChartData} />
          </CardContent>
        </Card>
      </div>

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
