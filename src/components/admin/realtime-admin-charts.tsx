'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, FileText, LineChart, BarChart3 } from 'lucide-react'
import JobsStatusChart from './jobs-status-chart'
import CandidatesStatusChart from './candidates-status-chart'
import UserGrowthChart from './user-growth-chart'
import ActivityTimelineChart from './activity-timeline-chart'
import ResourceUsageChart from './resource-usage-chart'

type ChartData = {
  jobsChartData: Array<{ status: string; count: number }>
  candidatesChartData: Array<{ status: string; count: number }>
  userGrowthChartData: Array<{ date: string; users: number }>
  activityChartData: Array<{ date: string; activities: number }>
  resourceChartData: Array<{ name: string; jobs: number; candidates: number; analyses: number }>
}

export default function RealtimeAdminCharts({
  initialData,
}: {
  initialData: ChartData
}) {
  const [chartData, setChartData] = useState<ChartData>(initialData)

  useEffect(() => {
    const supabase = createClient()

    // Function to refresh all chart data
    const refreshChartData = async () => {
      const [
        { data: jobsData },
        { data: candidatesData },
        { data: profiles },
        { data: allActivities },
      ] = await Promise.all([
        supabase.from('jobs').select('status, user_id'),
        supabase.from('candidates').select('status, ai_score, user_id'),
        supabase.from('profiles').select('created_at').order('created_at', { ascending: false }).limit(100),
        supabase
          .from('activity_log')
          .select('created_at, action')
          .order('created_at', { ascending: false })
          .limit(100),
      ])

      // 1. Process jobs data for chart
      const jobsStatusCounts = jobsData?.reduce((acc, job: any) => {
        acc[job.status] = (acc[job.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const newJobsChartData = Object.entries(jobsStatusCounts).map(([status, count]) => ({
        status,
        count,
      }))

      // 2. Process candidates data for chart
      const candidatesStatusCounts = candidatesData?.reduce((acc, candidate: any) => {
        acc[candidate.status] = (acc[candidate.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const newCandidatesChartData = Object.entries(candidatesStatusCounts).map(([status, count]) => ({
        status: status.replace(/_/g, ' '),
        count,
      }))

      // 3. User growth over time (last 14 days)
      const userGrowthData = profiles
        ?.reduce((acc: { [key: string]: number }, profile: any) => {
          const date = new Date(profile.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {})

      const newUserGrowthChartData = Object.entries(userGrowthData || {})
        .map(([date, users]) => ({ date, users: users as number }))
        .slice(-14) // Last 14 days

      // 4. Activity timeline (last 14 days)
      const activityTimelineData = allActivities
        ?.reduce((acc: { [key: string]: number }, activity: any) => {
          const date = new Date(activity.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {})

      const newActivityChartData = Object.entries(activityTimelineData || {})
        .map(([date, activities]) => ({ date, activities: activities as number }))
        .slice(-14) // Last 14 days

      // 5. Resource usage by user
      const userResourceCounts = jobsData?.reduce((acc: { [key: string]: any }, job: any) => {
        const userId = job.user_id
        if (!acc[userId]) {
          acc[userId] = { jobs: 0, candidates: 0, analyses: 0 }
        }
        acc[userId].jobs++
        return acc
      }, {} as { [key: string]: { jobs: number; candidates: number; analyses: number } })

      // Add candidate and analysis counts
      candidatesData?.forEach((candidate: any) => {
        const userId = candidate.user_id
        if (userResourceCounts && userResourceCounts[userId]) {
          userResourceCounts[userId].candidates++
          if (candidate.ai_score !== null) {
            userResourceCounts[userId].analyses++
          }
        }
      })

      // Get top 5 users by total resources
      const newResourceChartData = Object.entries(userResourceCounts || {})
        .map(([userId, counts]: [string, any]) => ({
          name: `User ${userId.slice(0, 8)}`,
          jobs: counts.jobs,
          candidates: counts.candidates,
          analyses: counts.analyses,
          total: counts.jobs + counts.candidates + counts.analyses,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
        .map(({ name, jobs, candidates, analyses }) => ({ name, jobs, candidates, analyses }))

      setChartData({
        jobsChartData: newJobsChartData,
        candidatesChartData: newCandidatesChartData,
        userGrowthChartData: newUserGrowthChartData,
        activityChartData: newActivityChartData,
        resourceChartData: newResourceChartData,
      })
    }

    // Subscribe to relevant table changes
    const jobsChannel = supabase
      .channel('admin-charts-jobs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
        },
        () => refreshChartData()
      )
      .subscribe()

    const candidatesChannel = supabase
      .channel('admin-charts-candidates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
        },
        () => refreshChartData()
      )
      .subscribe()

    const profilesChannel = supabase
      .channel('admin-charts-profiles')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
        },
        () => refreshChartData()
      )
      .subscribe()

    const activityChannel = supabase
      .channel('admin-charts-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
        },
        () => refreshChartData()
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(jobsChannel)
      supabase.removeChannel(candidatesChannel)
      supabase.removeChannel(profilesChannel)
      supabase.removeChannel(activityChannel)
    }
  }, [])

  return (
    <>
      {/* Main Charts Section */}
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
            <JobsStatusChart data={chartData.jobsChartData} />
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
            <CandidatesStatusChart data={chartData.candidatesChartData} />
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
            <UserGrowthChart data={chartData.userGrowthChartData} />
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
            <ActivityTimelineChart data={chartData.activityChartData} />
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
            <ResourceUsageChart data={chartData.resourceChartData} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
