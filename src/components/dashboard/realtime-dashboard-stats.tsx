'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, TrendingUp, Clock } from 'lucide-react'

type Stats = {
  jobsCount: number
  candidatesCount: number
  aiCreditsRemaining: number
  aiCreditsTotal: number
  pendingReviewCount: number
}

export default function RealtimeDashboardStats({
  userId,
  initialStats,
}: {
  userId: string
  initialStats: Stats
}) {
  const [stats, setStats] = useState<Stats>(initialStats)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to jobs changes
    const jobsChannel = supabase
      .channel('user-jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refresh jobs count
          supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .then(({ count }) => {
              setStats((prev) => ({ ...prev, jobsCount: count || 0 }))
            })
        }
      )
      .subscribe()

    // Subscribe to candidates changes
    const candidatesChannel = supabase
      .channel('user-candidates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refresh candidates count and pending review count
          Promise.all([
            supabase
              .from('candidates')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId),
            supabase
              .from('candidates')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
              .eq('status', 'PENDING_REVIEW'),
          ]).then(([allCandidates, pendingCandidates]) => {
            setStats((prev) => ({
              ...prev,
              candidatesCount: allCandidates.count || 0,
              pendingReviewCount: pendingCandidates.count || 0,
            }))
          })
        }
      )
      .subscribe()

    // Subscribe to user_quotas changes
    const quotasChannel = supabase
      .channel('user-quotas-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_quotas',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Refresh quota
          supabase
            .from('user_quotas')
            .select('*')
            .eq('user_id', userId)
            .single()
            .then(({ data }) => {
              if (data) {
                setStats((prev) => ({
                  ...prev,
                  aiCreditsRemaining: (data.ai_credits || 0) - (data.used_credits || 0),
                  aiCreditsTotal: data.ai_credits || 0,
                }))
              }
            })
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(jobsChannel)
      supabase.removeChannel(candidatesChannel)
      supabase.removeChannel(quotasChannel)
    }
  }, [userId])

  const statsData = [
    {
      title: 'Total Jobs',
      value: stats.jobsCount,
      icon: Briefcase,
      description: 'Active job postings',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Candidates',
      value: stats.candidatesCount,
      icon: Users,
      description: 'Applications received',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'AI Credits',
      value: `${stats.aiCreditsRemaining}/${stats.aiCreditsTotal}`,
      icon: TrendingUp,
      description: 'Remaining this month',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pending Review',
      value: stats.pendingReviewCount,
      icon: Clock,
      description: 'Awaiting analysis',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat, index) => {
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
  )
}
