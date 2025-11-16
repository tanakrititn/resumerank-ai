'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, Download, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/types/database'

type Candidate = Database['public']['Tables']['candidates']['Row']

const statusColors = {
  PENDING_REVIEW: 'secondary',
  REVIEWED: 'default',
  SHORTLISTED: 'default',
  REJECTED: 'destructive',
  HIRED: 'default',
} as const

interface RealtimeCandidatesListProps {
  jobId: string
  initialCandidates: Candidate[]
}

export default function RealtimeCandidatesList({
  jobId,
  initialCandidates,
}: RealtimeCandidatesListProps) {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionAttempted, setConnectionAttempted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Fetch fresh candidate data from server
  const fetchCandidates = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCandidates(data)
    }
  }

  useEffect(() => {
    const supabase = createClient()

    // Use broadcast channel - works without enabling Database Replication
    const channel = supabase
      .channel(`job:${jobId}:candidates`)
      .on('broadcast', { event: 'candidate-change' }, async (payload) => {
        console.log('Real-time broadcast received:', payload)

        // Fetch fresh data when we receive a broadcast
        await fetchCandidates()
      })
      .subscribe((status) => {
        console.log('Real-time channel status:', status)
        setConnectionAttempted(true)

        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          console.log('✅ Real-time enabled - updates will appear instantly!')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setIsConnected(false)
          console.log('⚠️ Real-time connection failed - use refresh button for updates')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [jobId])

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle>Candidates ({candidates.length})</CardTitle>
            {connectionAttempted && (
              <>
                {isConnected ? (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Wifi className="h-4 w-4" />
                    <span>Live</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <WifiOff className="h-4 w-4" />
                    <span className="text-xs">Realtime off</span>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isConnected && connectionAttempted && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Refresh to see updates"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <Link href={`/jobs/${jobId}/candidates/new`}>
              <Button size="sm">Add Candidate</Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {candidates.length === 0 ? (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              No candidates yet. Add your first candidate to get started!
            </p>
            <Link href={`/jobs/${jobId}/candidates/new`}>
              <Button className="gradient-primary">Add Candidate</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <Link
                key={candidate.id}
                href={`/jobs/${jobId}/candidates/${candidate.id}`}
              >
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">
                          {candidate.name}
                        </h3>
                        <Badge variant={statusColors[candidate.status as keyof typeof statusColors]}>
                          {candidate.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="grid gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Mail className="mr-2 h-4 w-4" />
                          {candidate.email}
                        </div>
                        {candidate.phone && (
                          <div className="flex items-center">
                            <Phone className="mr-2 h-4 w-4" />
                            {candidate.phone}
                          </div>
                        )}
                      </div>

                      {candidate.ai_summary && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {candidate.ai_summary}
                        </p>
                      )}

                      <div className="text-xs text-muted-foreground" suppressHydrationWarning>
                        Added{' '}
                        {formatDistanceToNow(new Date(candidate.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>

                    <div className="ml-4 text-right space-y-2">
                      {candidate.ai_score !== null ? (
                        <div>
                          <div className="text-3xl font-bold">
                            {candidate.ai_score}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            AI Score
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>
                            {candidate.status === 'PENDING_REVIEW'
                              ? 'Analyzing...'
                              : 'Not scored'}
                          </span>
                        </div>
                      )}

                      {candidate.resume_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (candidate.resume_url) {
                              window.open(candidate.resume_url, '_blank', 'noopener,noreferrer')
                            }
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
