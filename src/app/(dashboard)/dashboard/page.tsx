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
    ?.filter((a) => a.action === 'AI_ANALYSIS')
    .reduce((acc: { [key: string]: number }, activity) => {
      const date = new Date(activity.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

  const creditsChartData = Object.entries(creditsData || {})
    .map(([date, credits]) => ({ date, credits: credits as number }))
    .slice(-7) // Last 7 days

  // 2. Candidates funnel by status
  const statusCounts = {
    'Applied': allCandidates?.filter((c) => c.status === 'PENDING_REVIEW').length || 0,
    'Reviewing': allCandidates?.filter((c) => c.status === 'REVIEWING').length || 0,
    'Shortlisted': allCandidates?.filter((c) => c.status === 'SHORTLISTED').length || 0,
    'Interviewing': allCandidates?.filter((c) => c.status === 'INTERVIEWING').length || 0,
    'Offer': allCandidates?.filter((c) => c.status === 'OFFER').length || 0,
  }

  const funnelChartData = [
    { status: 'Applied', count: statusCounts['Applied'], color: '#3b82f6' },
    { status: 'Reviewing', count: statusCounts['Reviewing'], color: '#8b5cf6' },
    { status: 'Shortlisted', count: statusCounts['Shortlisted'], color: '#ec4899' },
    { status: 'Interviewing', count: statusCounts['Interviewing'], color: '#f59e0b' },
    { status: 'Offer', count: statusCounts['Offer'], color: '#10b981' },
  ].filter((item) => item.count > 0)

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
              className="bg-white text-primary hover:bg-white/90 shadow-md"
            >
              Create New Job
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className="border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300 animate-scale-in overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Analytics Charts */}
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
            <CreditsUsageChart data={creditsChartData} />
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
            <CandidatesFunnelChart data={funnelChartData} />
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
            <TopJobsChart data={jobCandidateCounts} />
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
            <ScoreDistributionChart data={scoreChartData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Candidates */}
      <Card className="border-2 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Recent Candidates</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Latest applications to your job postings
              </p>
            </div>
            <Link href="/jobs">
              <Button variant="outline" size="sm">
                View All Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!recentCandidates || recentCandidates.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium mb-2">No candidates yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create a job and start receiving applications!
              </p>
              <Link href="/jobs/new">
                <Button className="gradient-primary">
                  Create Your First Job
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCandidates.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 hover:shadow-md transition-all duration-200 animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-medium">
                      {candidate.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(candidate.jobs as any)?.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {candidate.ai_score !== null ? (
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {candidate.ai_score}
                        </p>
                        <p className="text-xs text-muted-foreground">out of 100</p>
                      </div>
                    ) : (
                      <Badge variant={candidate.status === 'PENDING_REVIEW' ? 'secondary' : 'outline'}>
                        {candidate.status === 'PENDING_REVIEW' ? 'Analyzing...' : 'Not scored'}
                      </Badge>
                    )}
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
