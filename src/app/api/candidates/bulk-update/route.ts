import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { broadcastBulkCandidateChange } from '@/lib/utils/realtime-broadcast'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { candidateIds, status } = await request.json()

    // Validate inputs
    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid candidate IDs' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const validStatuses = ['PENDING_REVIEW', 'REVIEWING', 'SHORTLISTED', 'INTERVIEWED', 'REJECTED', 'HIRED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    console.log(`Bulk updating ${candidateIds.length} candidates to status: ${status}`)

    // Verify all candidates belong to user's jobs
    const { data: candidates, error: checkError } = await supabase
      .from('candidates')
      .select('id, job_id, jobs!inner(user_id)')
      .in('id', candidateIds)

    if (checkError) {
      console.error('Check error:', checkError)
      return NextResponse.json(
        { error: 'Failed to verify candidates' },
        { status: 500 }
      )
    }

    // Check if all candidates belong to user
    const unauthorizedCandidates = candidates?.filter(
      (c: any) => c.jobs.user_id !== user.id
    )

    if (unauthorizedCandidates && unauthorizedCandidates.length > 0) {
      return NextResponse.json(
        { error: 'Unauthorized to update some candidates' },
        { status: 403 }
      )
    }

    // Update all candidates
    const { error: updateError } = await supabase
      .from('candidates')
      .update({ status })
      .in('id', candidateIds)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update candidates' },
        { status: 500 }
      )
    }

    // Log activity for each candidate
    const activityLogs = candidateIds.map((candidateId) => ({
      user_id: user.id,
      action: 'BULK_UPDATE_STATUS',
      resource_type: 'candidate',
      resource_id: candidateId,
      metadata: { new_status: status },
    }))

    await supabase.from('activity_log').insert(activityLogs)

    // Broadcast real-time updates for each affected job (both job page and dashboard)
    try {
      // Group candidates by job
      const jobsMap = new Map<string, { userId: string; candidateIds: string[] }>()

      candidates?.forEach((c: any) => {
        const existing = jobsMap.get(c.job_id)
        if (existing) {
          existing.candidateIds.push(c.id)
        } else {
          jobsMap.set(c.job_id, {
            userId: c.jobs.user_id,
            candidateIds: [c.id],
          })
        }
      })

      const jobsData = Array.from(jobsMap.entries()).map(([jobId, data]) => ({
        jobId,
        userId: data.userId,
        candidateIds: data.candidateIds,
      }))

      await broadcastBulkCandidateChange(supabase, jobsData, 'update')
    } catch (error) {
      console.error('Failed to broadcast bulk update:', error)
    }

    console.log(`Successfully updated ${candidateIds.length} candidates`)

    return NextResponse.json({
      success: true,
      count: candidateIds.length,
    })
  } catch (error) {
    console.error('Bulk update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
