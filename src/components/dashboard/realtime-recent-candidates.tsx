'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database'

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
    const supabase = createClient()

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
      }
    }

    // Subscribe to all candidate changes for this user
    const channel = supabase
      .channel(`user:${userId}:candidates`)
      .on('broadcast', { event: 'candidate-change' }, async () => {
        console.log('Dashboard: Real-time candidate update received')
        await fetchCandidates()
      })
      .subscribe((status) => {
        console.log('Dashboard real-time status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Also subscribe to database changes as fallback
  useEffect(() => {
    const supabase = createClient()

    const fetchCandidates = async () => {
      const { data } = await supabase
        .from('candidates')
        .select('*, jobs(title)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (data) {
        setCandidates(data as Candidate[])
      }
    }

    // Subscribe to postgres changes
    const channel = supabase
      .channel('dashboard-candidates-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Dashboard: Database change detected:', payload)
          fetchCandidates()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">Recent Candidates</CardTitle>
              {isConnected && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  Live
                </Badge>
              )}
            </div>
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
        {!candidates || candidates.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">No candidates yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create a job and start receiving applications!
            </p>
            <Link href="/jobs/new">
              <Button className="gradient-primary">Create Your First Job</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate, index) => (
              <Link
                key={candidate.id}
                href={`/jobs/${candidate.job_id}`}
                className="block"
              >
                <div
                  className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 hover:shadow-md transition-all duration-200 animate-slide-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-medium flex-shrink-0">
                      {candidate.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(candidate.jobs as any)?.title || 'Unknown Job'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {candidate.ai_score !== null ? (
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {candidate.ai_score}
                        </p>
                        <p className="text-xs text-muted-foreground">out of 100</p>
                      </div>
                    ) : (
                      <Badge
                        variant={
                          candidate.status === 'PENDING_REVIEW'
                            ? 'secondary'
                            : 'outline'
                        }
                        className="flex items-center gap-1"
                      >
                        {candidate.status === 'PENDING_REVIEW' && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        {candidate.status === 'PENDING_REVIEW'
                          ? 'Analyzing...'
                          : 'Not scored'}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
