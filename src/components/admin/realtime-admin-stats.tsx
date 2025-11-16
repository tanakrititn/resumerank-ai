'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Briefcase, FileText, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'

type Stats = {
  usersCount: number
  jobsCount: number
  candidatesCount: number
  avgScore: number
  usersTrend: string
  usersTrendUp: boolean
  jobsTrend: string
  jobsTrendUp: boolean
  candidatesTrend: string
  candidatesTrendUp: boolean
  scoreTrend: string
  scoreTrendUp: boolean
}

export default function RealtimeAdminStats({
  initialStats,
}: {
  initialStats: Stats
}) {
  const [stats, setStats] = useState<Stats>(initialStats)

  useEffect(() => {
    const supabase = createClient()

    // Helper function to calculate percentage change
    const calculateTrend = (current: number, previous: number): { trend: string; trendUp: boolean } => {
      if (previous === 0) {
        return { trend: current > 0 ? '+100%' : '0%', trendUp: current > 0 }
      }
      const change = ((current - previous) / previous) * 100
      const isPositive = change >= 0
      return {
        trend: `${isPositive ? '+' : ''}${Math.round(change)}%`,
        trendUp: isPositive,
      }
    }

    // Calculate date 7 days ago for trend comparison
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoISO = sevenDaysAgo.toISOString()

    // Subscribe to profiles (users) changes
    const profilesChannel = supabase
      .channel('admin-profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          // Refresh users count with trend
          Promise.all([
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('profiles').select('*', { count: 'exact', head: true }).lte('created_at', sevenDaysAgoISO),
          ]).then(([current, previous]) => {
            const currentCount = current.count || 0
            const previousCount = previous.count || 0
            const trend = calculateTrend(currentCount, previousCount)
            setStats((prev) => ({
              ...prev,
              usersCount: currentCount,
              usersTrend: trend.trend,
              usersTrendUp: trend.trendUp,
            }))
          })
        }
      )
      .subscribe()

    // Subscribe to jobs changes
    const jobsChannel = supabase
      .channel('admin-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
        },
        () => {
          // Refresh jobs count with trend
          Promise.all([
            supabase.from('jobs').select('*', { count: 'exact', head: true }),
            supabase.from('jobs').select('*', { count: 'exact', head: true }).lte('created_at', sevenDaysAgoISO),
          ]).then(([current, previous]) => {
            const currentCount = current.count || 0
            const previousCount = previous.count || 0
            const trend = calculateTrend(currentCount, previousCount)
            setStats((prev) => ({
              ...prev,
              jobsCount: currentCount,
              jobsTrend: trend.trend,
              jobsTrendUp: trend.trendUp,
            }))
          })
        }
      )
      .subscribe()

    // Subscribe to candidates changes
    const candidatesChannel = supabase
      .channel('admin-candidates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
        },
        () => {
          // Refresh candidates count and avg score with trends
          Promise.all([
            supabase.from('candidates').select('*', { count: 'exact', head: true }),
            supabase.from('candidates').select('ai_score').not('ai_score', 'is', null),
            supabase.from('candidates').select('*', { count: 'exact', head: true }).lte('created_at', sevenDaysAgoISO),
            supabase.from('candidates').select('ai_score').not('ai_score', 'is', null).lte('created_at', sevenDaysAgoISO),
          ]).then(([countResult, scoresResult, countResult7Days, scoresResult7Days]) => {
            // Current data
            const count = countResult.count || 0
            const scores = scoresResult.data || []
            const avgScore = scores.length > 0
              ? Math.round(scores.reduce((sum, c) => sum + (c.ai_score || 0), 0) / scores.length)
              : 0

            // 7 days ago data
            const count7Days = countResult7Days.count || 0
            const scores7Days = scoresResult7Days.data || []
            const avgScore7Days = scores7Days.length > 0
              ? Math.round(scores7Days.reduce((sum, c) => sum + (c.ai_score || 0), 0) / scores7Days.length)
              : 0

            // Calculate trends
            const candidatesTrend = calculateTrend(count, count7Days)
            const scoreTrend = calculateTrend(avgScore, avgScore7Days)

            setStats((prev) => ({
              ...prev,
              candidatesCount: count,
              avgScore,
              candidatesTrend: candidatesTrend.trend,
              candidatesTrendUp: candidatesTrend.trendUp,
              scoreTrend: scoreTrend.trend,
              scoreTrendUp: scoreTrend.trendUp,
            }))
          })
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(profilesChannel)
      supabase.removeChannel(jobsChannel)
      supabase.removeChannel(candidatesChannel)
    }
  }, [])

  const statsData = [
    {
      title: 'Total Users',
      value: stats.usersCount,
      icon: Users,
      description: 'Registered recruiters',
      trend: stats.usersTrend,
      trendUp: stats.usersTrendUp,
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Jobs',
      value: stats.jobsCount,
      icon: Briefcase,
      description: 'Job postings',
      trend: stats.jobsTrend,
      trendUp: stats.jobsTrendUp,
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Total Candidates',
      value: stats.candidatesCount,
      icon: FileText,
      description: 'Applications received',
      trend: stats.candidatesTrend,
      trendUp: stats.candidatesTrendUp,
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-600',
    },
    {
      title: 'Avg. Score',
      value: stats.avgScore,
      icon: TrendingUp,
      description: 'AI analysis average',
      trend: stats.scoreTrend,
      trendUp: stats.scoreTrendUp,
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-600',
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => {
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
  )
}
