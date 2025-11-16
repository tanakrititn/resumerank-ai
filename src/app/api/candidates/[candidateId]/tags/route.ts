import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { broadcastCandidateChange } from '@/lib/utils/realtime-broadcast'
import type { Tag } from '@/lib/utils/tags'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { candidateId } = await params
    const { tags }: { tags: Tag[] } = await request.json()

    // Validate tags
    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: 'Tags must be an array' }, { status: 400 })
    }

    // Verify candidate ownership
    const { data: candidate, error: fetchError } = await supabase
      .from('candidates')
      .select('id, job_id, user_id, jobs!inner(user_id)')
      .eq('id', candidateId)
      .single()

    if (fetchError || !candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    if ((candidate.jobs as any).user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this candidate' },
        { status: 403 }
      )
    }

    // Update tags
    const { error: updateError } = await supabase
      .from('candidates')
      .update({ tags })
      .eq('id', candidateId)

    if (updateError) {
      console.error('Update tags error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update tags' },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: 'UPDATE_TAGS',
      resource_type: 'candidate',
      resource_id: candidateId,
      metadata: { tags },
    })

    // Broadcast real-time update
    try {
      await broadcastCandidateChange(supabase, candidate.job_id, user.id, {
        action: 'update',
        candidateId,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to broadcast tag update:', error)
    }

    return NextResponse.json({
      success: true,
      tags,
    })
  } catch (error) {
    console.error('Update tags API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
