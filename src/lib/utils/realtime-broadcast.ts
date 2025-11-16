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

      // Subscribe and wait for confirmation with longer timeout
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          // Don't reject on timeout, just resolve and try to send anyway
          console.warn(`Subscription timeout for ${channelName}, attempting broadcast anyway`)
          resolve()
        }, 5000) // Increased to 5 seconds

        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout)
            resolve()
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            clearTimeout(timeout)
            // Still attempt to send even if subscription fails
            console.warn(`Subscription status ${status} for ${channelName}, attempting broadcast anyway`)
            resolve()
          }
        })
      })

      // Send broadcast (try even if subscription wasn't confirmed)
      try {
        await channel.send({
          type: 'broadcast',
          event: 'candidate-change',
          payload,
        })
      } catch (sendError) {
        console.error(`Failed to send broadcast to ${channelName}:`, sendError)
      }

      // Clean up
      try {
        await supabase.removeChannel(channel)
      } catch (cleanupError) {
        console.error(`Failed to remove channel ${channelName}:`, cleanupError)
      }
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
