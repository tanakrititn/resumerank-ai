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

    const { candidateIds } = await request.json()

    // Validate inputs
    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid candidate IDs' },
        { status: 400 }
      )
    }

    console.log(`Bulk deleting ${candidateIds.length} candidates`)

    // Get candidates with resume URLs and verify ownership
    const { data: candidates, error: checkError } = await supabase
      .from('candidates')
      .select('id, resume_url, job_id, name, jobs!inner(user_id)')
      .in('id', candidateIds)

    if (checkError) {
      console.error('Check error:', checkError)
      return NextResponse.json(
        { error: 'Failed to verify candidates' },
        { status: 500 }
      )
    }

    if (!candidates || candidates.length === 0) {
      return NextResponse.json(
        { error: 'No candidates found' },
        { status: 404 }
      )
    }

    // Check if all candidates belong to user
    const unauthorizedCandidates = candidates.filter(
      (c: any) => c.jobs.user_id !== user.id
    )

    if (unauthorizedCandidates.length > 0) {
      return NextResponse.json(
        { error: 'Unauthorized to delete some candidates' },
        { status: 403 }
      )
    }

    // Delete resume files from storage
    const deletePromises = candidates
      .filter((c: any) => c.resume_url)
      .map(async (candidate: any) => {
        try {
          const match = candidate.resume_url.match(/resumes\/(.+)$/)
          if (match) {
            const filePath = match[1]
            await supabase.storage.from('resumes').remove([filePath])
            console.log(`Deleted resume file: ${filePath}`)
          }
        } catch (error) {
          console.error(`Failed to delete resume for candidate ${candidate.id}:`, error)
          // Continue with deletion even if file removal fails
        }
      })

    await Promise.all(deletePromises)

    // Delete candidates from database
    const { error: deleteError } = await supabase
      .from('candidates')
      .delete()
      .in('id', candidateIds)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete candidates' },
        { status: 500 }
      )
    }

    // Log activity
    const activityLogs = candidates.map((candidate: any) => ({
      user_id: user.id,
      action: 'BULK_DELETE',
      resource_type: 'candidate',
      resource_id: candidate.id,
      metadata: { candidate_name: candidate.name },
    }))

    await supabase.from('activity_log').insert(activityLogs)

    // Broadcast real-time updates for each affected job (both job page and dashboard)
    try {
      // Group candidates by job
      const jobsMap = new Map<string, { userId: string; candidateIds: string[] }>()

      candidates.forEach((c: any) => {
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

      await broadcastBulkCandidateChange(supabase, jobsData, 'delete')
    } catch (error) {
      console.error('Failed to broadcast bulk delete:', error)
    }

    console.log(`Successfully deleted ${candidates.length} candidates`)

    return NextResponse.json({
      success: true,
      count: candidates.length,
    })
  } catch (error) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
