import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Users, TrendingUp, Clock, ArrowRight, BarChart3, LineChart, PieChart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import CandidatesFunnelChart from '@/components/dashboard/candidates-funnel-chart'
import CreditsUsageChart from '@/components/dashboard/credits-usage-chart'
import TopJobsChart from '@/components/dashboard/top-jobs-chart'
import ScoreDistributionChart from '@/components/dashboard/score-distribution-chart'
import RealtimeRecentCandidates from '@/components/dashboard/realtime-recent-candidates'
import RealtimeDashboardStats from '@/components/dashboard/realtime-dashboard-stats'
import RealtimeDashboardCharts from '@/components/dashboard/realtime-dashboard-charts'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch statistics
  const [
    { count: jobsCount },
    { count: candidatesCount },
    { data: recentCandidates },
    { data: quota },
    { data: allCandidates },
    { data: jobs },
    { data: activities },
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase
      .from('candidates')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('candidates')
      .select('*, jobs(title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('user_quotas').select('*').eq('user_id', user.id).single(),
    supabase
      .from('candidates')
      .select('*, jobs(id, title)')
      .eq('user_id', user.id),
    supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  const stats = [
    {
      title: 'Total Jobs',
      value: jobsCount || 0,
      icon: Briefcase,
      description: 'Active job postings',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Candidates',
      value: candidatesCount || 0,
      icon: Users,
      description: 'Applications received',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'AI Credits',
      value: `${(quota?.ai_credits || 0) - (quota?.used_credits || 0)}/${quota?.ai_credits || 0}`,
      icon: TrendingUp,
      description: 'Remaining this month',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Pending Review',
      value: recentCandidates?.filter((c) => c.status === 'PENDING_REVIEW').length || 0,
      icon: Clock,
      description: 'Awaiting analysis',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      gradient: 'from-orange-500 to-orange-600',
    },
  ]

  // Process data for charts
  // 1. Credits usage over time (from activity log)
  const creditsData = activities
    ?.filter((a) => a.action === 'AI_ANALYSIS_COMPLETED')
    .reduce((acc: { [key: string]: number }, activity) => {
      const date = new Date(activity.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

  let creditsChartData = Object.entries(creditsData || {})
    .map(([date, credits]) => ({ date, credits: credits as number }))
    .slice(-7) // Last 7 days

  // If no data, generate last 7 days with 0 usage
  if (creditsChartData.length === 0) {
    creditsChartData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        credits: 0
      }
    })
  }

  // 2. Candidates funnel by status
  const statusCounts = {
    'Pending Review': allCandidates?.filter((c) => c.status === 'PENDING_REVIEW').length || 0,
    'Reviewed': allCandidates?.filter((c) => c.status === 'REVIEWED').length || 0,
    'Shortlisted': allCandidates?.filter((c) => c.status === 'SHORTLISTED').length || 0,
    'Rejected': allCandidates?.filter((c) => c.status === 'REJECTED').length || 0,
    'Hired': allCandidates?.filter((c) => c.status === 'HIRED').length || 0,
  }

  // Always show all statuses to display funnel structure (even with 0 counts)
  const funnelChartData = [
    { status: 'Pending Review', count: statusCounts['Pending Review'], color: '#f59e0b' },
    { status: 'Reviewed', count: statusCounts['Reviewed'], color: '#3b82f6' },
    { status: 'Shortlisted', count: statusCounts['Shortlisted'], color: '#8b5cf6' },
    { status: 'Rejected', count: statusCounts['Rejected'], color: '#ef4444' },
    { status: 'Hired', count: statusCounts['Hired'], color: '#10b981' },
  ]

  // 3. Top jobs by candidate count
  const jobCandidateCounts = jobs?.map((job) => ({
    title: job.title.length > 20 ? job.title.substring(0, 20) + '...' : job.title,
    candidates: allCandidates?.filter((c) => (c.jobs as any)?.id === job.id).length || 0,
    color: '#3b82f6',
  }))
    .sort((a, b) => b.candidates - a.candidates)
    .slice(0, 5) || []

  // 4. Score distribution
  const scoreRanges = [
    { range: '0-59', count: 0 },
    { range: '60-69', count: 0 },
    { range: '70-79', count: 0 },
    { range: '80-89', count: 0 },
    { range: '90-100', count: 0 },
  ]

  allCandidates?.forEach((candidate) => {
    if (candidate.ai_score !== null) {
      const score = candidate.ai_score
      if (score < 60) scoreRanges[0].count++
      else if (score < 70) scoreRanges[1].count++
      else if (score < 80) scoreRanges[2].count++
      else if (score < 90) scoreRanges[3].count++
      else scoreRanges[4].count++
    }
  })

  const scoreChartData = scoreRanges.filter((r) => r.count > 0)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-xl gradient-primary p-8 text-white shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-white/90 mb-4">
            Here's what's happening with your recruitment today.
          </p>
          <Link href="/jobs/new">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-md focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Create New Job
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* Stats Grid - Real-time */}
      <RealtimeDashboardStats
        userId={user.id}
        initialStats={{
          jobsCount: jobsCount || 0,
          candidatesCount: candidatesCount || 0,
          aiCreditsRemaining: (quota?.ai_credits || 0) - (quota?.used_credits || 0),
          aiCreditsTotal: quota?.ai_credits || 0,
          pendingReviewCount: recentCandidates?.filter((c) => c.status === 'PENDING_REVIEW').length || 0,
        }}
      />

      {/* Analytics Charts - Real-time */}
      <RealtimeDashboardCharts
        userId={user.id}
        initialCreditsData={creditsChartData}
        initialFunnelData={funnelChartData}
        initialTopJobsData={jobCandidateCounts}
        initialScoreData={scoreChartData}
      />

      {/* Recent Candidates - Real-time */}
      <RealtimeRecentCandidates initialCandidates={recentCandidates || []} userId={user.id} />
    </div>
  )
}
