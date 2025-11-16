import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { broadcastBulkCandidateChange } from '@/lib/utils/realtime-broadcast'
import type { Tag } from '@/lib/utils/tags'

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

    const {
      candidateIds,
      action,
      tags: tagsToModify,
    }: {
      candidateIds: string[]
      action: 'add' | 'remove' | 'replace'
      tags: Tag[]
    } = await request.json()

    // Validate inputs
    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid candidate IDs' },
        { status: 400 }
      )
    }

    if (!action || !['add', 'remove', 'replace'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "add", "remove", or "replace"' },
        { status: 400 }
      )
    }

    if (!tagsToModify || !Array.isArray(tagsToModify)) {
      return NextResponse.json({ error: 'Tags must be an array' }, { status: 400 })
    }

    console.log(`Bulk tag operation: ${action} tags for ${candidateIds.length} candidates`)

    // Verify all candidates belong to user's jobs
    const { data: candidates, error: checkError } = await supabase
      .from('candidates')
      .select('id, job_id, tags, jobs!inner(user_id)')
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

    // Update tags based on action
    const updatePromises = candidates?.map(async (candidate: any) => {
      let newTags: Tag[] = candidate.tags || []

      switch (action) {
        case 'add':
          // Add tags that don't already exist
          tagsToModify.forEach((tagToAdd) => {
            const exists = newTags.some(
              (t) => t.name.toLowerCase() === tagToAdd.name.toLowerCase()
            )
            if (!exists) {
              newTags.push(tagToAdd)
            }
          })
          break

        case 'remove':
          // Remove matching tags
          newTags = newTags.filter(
            (t) =>
              !tagsToModify.some(
                (tagToRemove) =>
                  tagToRemove.name.toLowerCase() === t.name.toLowerCase()
              )
          )
          break

        case 'replace':
          // Replace all tags
          newTags = tagsToModify
          break
      }

      return supabase
        .from('candidates')
        .update({ tags: newTags })
        .eq('id', candidate.id)
    })

    const results = await Promise.all(updatePromises || [])
    const failedUpdates = results.filter((r) => r.error)

    if (failedUpdates.length > 0) {
      console.error('Some updates failed:', failedUpdates)
    }

    // Log activity for each candidate
    const activityLogs = candidateIds.map((candidateId) => ({
      user_id: user.id,
      action: 'BULK_TAG_UPDATE',
      resource_type: 'candidate',
      resource_id: candidateId,
      metadata: { operation: action, tags: tagsToModify },
    }))

    await supabase.from('activity_log').insert(activityLogs)

    // Broadcast real-time updates for each affected job
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
      console.error('Failed to broadcast bulk tag update:', error)
    }

    console.log(`Successfully updated tags for ${candidateIds.length} candidates`)

    return NextResponse.json({
      success: true,
      count: candidateIds.length,
      failed: failedUpdates.length,
    })
  } catch (error) {
    console.error('Bulk tag error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
