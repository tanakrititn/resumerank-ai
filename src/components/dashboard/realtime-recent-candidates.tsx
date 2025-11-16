'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, ArrowRight, Loader2, Mail, Briefcase, Clock, CheckCircle2, XCircle, UserCheck, Star, TrendingUp, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/types/database'
import { config } from '@/lib/config'

type Candidate = Database['public']['Tables']['candidates']['Row'] & {
  jobs?: { title: string } | null
}

interface RealtimeRecentCandidatesProps {
  initialCandidates: Candidate[]
  userId: string
}

export default function RealtimeRecentCandidates({
  initialCandidates,
  userId,
}: RealtimeRecentCandidatesProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if real-time is enabled
    if (!config.features.enableRealtime) {
      console.log('⚠️ Dashboard: Real-time is disabled in configuration')
      return
    }

    const supabase = createClient()

    console.log('📡 Dashboard: Setting up real-time subscription for user:', userId)

    // Fetch latest candidates
    const fetchCandidates = async () => {
      const { data } = await supabase
        .from('candidates')
        .select('*, jobs(title)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (data) {
        setCandidates(data as Candidate[])
        console.log('📊 Dashboard: Fetched', data.length, 'recent candidates')
      }
    }

    // Subscribe to all candidate changes for this user
    const channel = supabase
      .channel(`user:${userId}:candidates`)
      .on('broadcast', { event: 'candidate-change' }, async (payload) => {
        console.log('🔔 Dashboard: Real-time candidate update received', payload)
        await fetchCandidates()
      })
      .subscribe((status) => {
        console.log('📶 Dashboard real-time status:', status)

        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          console.log('✅ Dashboard real-time enabled!')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false)
          console.log('⚠️ Dashboard real-time connection failed')
        } else if (status === 'CLOSED') {
          // Normal cleanup - just update state
          setIsConnected(false)
        }
      })

    return () => {
      console.log('🔌 Dashboard: Cleaning up real-time subscription')
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Helper function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return {
          label: 'Pending Review',
          className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
          icon: Clock,
        }
      case 'REVIEWED':
        return {
          label: 'Reviewed',
          className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
          icon: CheckCircle2,
        }
      case 'SHORTLISTED':
        return {
          label: 'Shortlisted',
          className: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
          icon: Star,
        }
      case 'REJECTED':
        return {
          label: 'Rejected',
          className: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
          icon: XCircle,
        }
      case 'HIRED':
        return {
          label: 'Hired',
          className: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
          icon: UserCheck,
        }
      default:
        return {
          label: status,
          className: 'bg-gray-500 text-white',
          icon: Users,
        }
    }
  }

  return (
    <Card className="border-2 shadow-lg overflow-hidden pt-0">
      {/* Gradient Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-6 text-white">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-2xl font-bold">Recent Candidates</CardTitle>
                  {isConnected && (
                    <Badge className="bg-green-500/90 text-white border-0 shadow-lg animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full mr-1.5"></div>
                      Live
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-white/90 text-sm">
                Latest applications and their AI-powered scores
              </p>
            </div>
            <Link href="/jobs">
              <Button size="sm" className="bg-white text-purple-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all">
                View All Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        {/* Decorative blurred circles */}
        <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      <CardContent className="p-6">
        {!candidates || candidates.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-gradient-to-br from-slate-50 to-purple-50 border-2 border-dashed">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 mb-6 shadow-lg">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Candidates Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create a job posting and start receiving applications from talented candidates!
            </p>
            <Link href="/jobs/new">
              <Button size="lg" className="gradient-primary shadow-lg hover:shadow-xl">
                <Sparkles className="mr-2 h-5 w-5" />
                Create Your First Job
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {candidates.map((candidate, index) => {
              const statusBadge = getStatusBadge(candidate.status)
              const StatusIcon = statusBadge.icon

              return (
                <Link
                  key={candidate.id}
                  href={`/jobs/${candidate.job_id}`}
                  className="block group"
                >
                  <div
                    className="relative overflow-hidden rounded-xl border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 animate-scale-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                    <div className="relative z-10 p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar with gradient and initials */}
                        <div className="relative flex-shrink-0">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow">
                            {candidate.name[0].toUpperCase()}
                          </div>
                          {candidate.ai_score !== null && candidate.ai_score >= 80 && (
                            <div className="absolute -top-1 -right-1 p-1 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                              <Star className="h-3 w-3 text-white" fill="white" />
                            </div>
                          )}
                        </div>

                        {/* Candidate Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                                {candidate.name}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="line-clamp-1">{candidate.email}</span>
                              </div>
                            </div>

                            {/* AI Score or Status Badge */}
                            <div className="flex-shrink-0">
                              {candidate.ai_score !== null ? (
                                <div className="text-center">
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 group-hover:from-purple-100 group-hover:to-blue-100 transition-colors">
                                    <TrendingUp className="h-4 w-4 text-purple-600" />
                                    <span className="text-2xl font-bold text-purple-600">
                                      {candidate.ai_score}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">AI Score</p>
                                </div>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 border-0"
                                >
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span className="font-semibold">Analyzing...</span>
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Job Title and Status Row */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-sm">
                              <div className="p-1 rounded-md bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                              </div>
                              <span className="text-muted-foreground line-clamp-1">
                                {(candidate.jobs as any)?.title || 'Unknown Job'}
                              </span>
                            </div>

                            <Badge className={`${statusBadge.className} border-0 shadow-sm font-semibold`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusBadge.label}
                            </Badge>

                            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
