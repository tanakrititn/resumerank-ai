'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, LineChart, PieChart } from 'lucide-react'
import CandidatesFunnelChart from './candidates-funnel-chart'
import CreditsUsageChart from './credits-usage-chart'
import TopJobsChart from './top-jobs-chart'
import ScoreDistributionChart from './score-distribution-chart'

type Candidate = {
  id: string
  status: string
  ai_score: number | null
  jobs: { id: string; title: string } | null
}

type Job = {
  id: string
  title: string
}

type Activity = {
  action: string
  created_at: string
}

export default function RealtimeDashboardCharts({
  userId,
  initialCreditsData,
  initialFunnelData,
  initialTopJobsData,
  initialScoreData,
}: {
  userId: string
  initialCreditsData: Array<{ date: string; credits: number }>
  initialFunnelData: Array<{ status: string; count: number; color: string }>
  initialTopJobsData: Array<{ title: string; candidates: number; color: string }>
  initialScoreData: Array<{ range: string; count: number }>
}) {
  const [creditsData, setCreditsData] = useState(initialCreditsData)
  const [funnelData, setFunnelData] = useState(initialFunnelData)
  const [topJobsData, setTopJobsData] = useState(initialTopJobsData)
  const [scoreData, setScoreData] = useState(initialScoreData)

  useEffect(() => {
    const supabase = createClient()

    // Function to refresh all chart data
    const refreshChartData = async () => {
      const [
        { data: activities },
        { data: allCandidates },
        { data: jobs },
      ] = await Promise.all([
        supabase
          .from('activity_log')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('candidates')
          .select('*, jobs(id, title)')
          .eq('user_id', userId),
        supabase
          .from('jobs')
          .select('*')
          .eq('user_id', userId),
      ])

      // 1. Credits usage over time
      const creditsDataMap = activities
        ?.filter((a: Activity) => a.action === 'AI_ANALYSIS_COMPLETED')
        .reduce((acc: { [key: string]: number }, activity: Activity) => {
          const date = new Date(activity.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {})

      let newCreditsData = Object.entries(creditsDataMap || {})
        .map(([date, credits]) => ({ date, credits: credits as number }))
        .slice(-7)

      if (newCreditsData.length === 0) {
        newCreditsData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (6 - i))
          return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            credits: 0
          }
        })
      }
      setCreditsData(newCreditsData)

      // 2. Candidates funnel
      const statusCounts = {
        'Pending Review': allCandidates?.filter((c: Candidate) => c.status === 'PENDING_REVIEW').length || 0,
        'Reviewed': allCandidates?.filter((c: Candidate) => c.status === 'REVIEWED').length || 0,
        'Shortlisted': allCandidates?.filter((c: Candidate) => c.status === 'SHORTLISTED').length || 0,
        'Rejected': allCandidates?.filter((c: Candidate) => c.status === 'REJECTED').length || 0,
        'Hired': allCandidates?.filter((c: Candidate) => c.status === 'HIRED').length || 0,
      }

      const newFunnelData = [
        { status: 'Pending Review', count: statusCounts['Pending Review'], color: '#f59e0b' },
        { status: 'Reviewed', count: statusCounts['Reviewed'], color: '#3b82f6' },
        { status: 'Shortlisted', count: statusCounts['Shortlisted'], color: '#8b5cf6' },
        { status: 'Rejected', count: statusCounts['Rejected'], color: '#ef4444' },
        { status: 'Hired', count: statusCounts['Hired'], color: '#10b981' },
      ]
      setFunnelData(newFunnelData)

      // 3. Top jobs by candidate count
      const jobCandidateCounts = jobs?.map((job: Job) => ({
        title: job.title.length > 20 ? job.title.substring(0, 20) + '...' : job.title,
        candidates: allCandidates?.filter((c: Candidate) => c.jobs?.id === job.id).length || 0,
        color: '#3b82f6',
      }))
        .sort((a, b) => b.candidates - a.candidates)
        .slice(0, 5) || []
      setTopJobsData(jobCandidateCounts)

      // 4. Score distribution
      const scoreRanges = [
        { range: '0-59', count: 0 },
        { range: '60-69', count: 0 },
        { range: '70-79', count: 0 },
        { range: '80-89', count: 0 },
        { range: '90-100', count: 0 },
      ]

      allCandidates?.forEach((candidate: Candidate) => {
        if (candidate.ai_score !== null) {
          const score = candidate.ai_score
          if (score < 60) scoreRanges[0].count++
          else if (score < 70) scoreRanges[1].count++
          else if (score < 80) scoreRanges[2].count++
          else if (score < 90) scoreRanges[3].count++
          else scoreRanges[4].count++
        }
      })

      const newScoreData = scoreRanges.filter((r) => r.count > 0)
      setScoreData(newScoreData)
    }

    // Subscribe to relevant table changes
    const candidatesChannel = supabase
      .channel('dashboard-candidates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
          filter: `user_id=eq.${userId}`,
        },
        () => refreshChartData()
      )
      .subscribe()

    const activityChannel = supabase
      .channel('dashboard-activity-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
          filter: `user_id=eq.${userId}`,
        },
        () => refreshChartData()
      )
      .subscribe()

    const jobsChannel = supabase
      .channel('dashboard-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `user_id=eq.${userId}`,
        },
        () => refreshChartData()
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(candidatesChannel)
      supabase.removeChannel(activityChannel)
      supabase.removeChannel(jobsChannel)
    }
  }, [userId])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-2 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-50">
              <LineChart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl">AI Credits Usage</CardTitle>
              <p className="text-sm text-muted-foreground">Last 7 days activity</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CreditsUsageChart data={creditsData} />
        </CardContent>
      </Card>

      <Card className="border-2 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Candidate Pipeline</CardTitle>
              <p className="text-sm text-muted-foreground">Candidates by status</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CandidatesFunnelChart data={funnelData} />
        </CardContent>
      </Card>

      <Card className="border-2 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-50">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Top Performing Jobs</CardTitle>
              <p className="text-sm text-muted-foreground">By candidate count</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TopJobsChart data={topJobsData} />
        </CardContent>
      </Card>

      <Card className="border-2 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-50">
              <PieChart className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Score Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">Candidate quality overview</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScoreDistributionChart data={scoreData} />
        </CardContent>
      </Card>
    </div>
  )
}
