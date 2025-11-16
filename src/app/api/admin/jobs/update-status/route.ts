import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Use regular client for authentication check
    const supabase = await createClient()

    // Verify admin authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { jobId, status } = await request.json()

    if (!jobId || !status) {
      return NextResponse.json(
        { error: 'jobId and status are required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['OPEN', 'PAUSED', 'CLOSED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be OPEN, PAUSED, or CLOSED' },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()

    // Get job details for logging
    const { data: job } = await adminClient
      .from('jobs')
      .select('title, user_id, status')
      .eq('id', jobId)
      .single()

    // Update job status
    const { error: updateError } = await adminClient
      .from('jobs')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)

    if (updateError) {
      console.error('Update job status error:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Log activity with admin client
    await adminClient.from('activity_log').insert({
      user_id: user.id,
      action: 'ADMIN_UPDATE_JOB_STATUS',
      resource_type: 'job',
      resource_id: jobId,
      metadata: {
        title: job?.title,
        owner_id: job?.user_id,
        old_status: job?.status,
        new_status: status,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
