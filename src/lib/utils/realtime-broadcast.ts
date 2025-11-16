import { SupabaseClient } from '@supabase/supabase-js'

interface BroadcastPayload {
  action: 'insert' | 'update' | 'delete'
  candidateId?: string
  candidateIds?: string[]
  timestamp: string
}

/**
 * Broadcast real-time update to multiple channels
 * Broadcasts to both job-specific and user-specific channels
 */
export async function broadcastCandidateChange(
  supabase: SupabaseClient,
  jobId: string,
  userId: string,
  payload: BroadcastPayload
): Promise<void> {
  const channels = [
    `job:${jobId}:candidates`,     // Job-specific channel (for job detail page)
    `user:${userId}:candidates`,   // User-specific channel (for dashboard)
  ]

  for (const channelName of channels) {
    try {
      const channel = supabase.channel(channelName)

      // Subscribe and wait for confirmation
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Subscription timeout')), 3000)

        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout)
            resolve()
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            clearTimeout(timeout)
            reject(new Error(`Subscription failed: ${status}`))
          }
        })
      })

      // Send broadcast
      await channel.send({
        type: 'broadcast',
        event: 'candidate-change',
        payload,
      })

      // Clean up
      await supabase.removeChannel(channel)
    } catch (error) {
      console.error(`Failed to broadcast to ${channelName}:`, error)
    }
  }

  console.log(`Real-time broadcast sent to ${channels.length} channels`)
}

/**
 * Broadcast to multiple jobs and their users
 * Used for bulk operations that affect multiple candidates across different jobs
 */
export async function broadcastBulkCandidateChange(
  supabase: SupabaseClient,
  jobsData: Array<{ jobId: string; userId: string; candidateIds: string[] }>,
  action: 'update' | 'delete'
): Promise<void> {
  for (const { jobId, userId, candidateIds } of jobsData) {
    await broadcastCandidateChange(supabase, jobId, userId, {
      action,
      candidateIds,
      timestamp: new Date().toISOString(),
    })
  }
}
