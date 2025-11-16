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

    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId is required' },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()

    // Get job details for logging
    const { data: job } = await adminClient
      .from('jobs')
      .select('title, user_id')
      .eq('id', jobId)
      .single()

    // Get all candidates for this job to delete their resume files
    const { data: candidates } = await adminClient
      .from('candidates')
      .select('resume_url')
      .eq('job_id', jobId)

    // Delete resume files from storage
    if (candidates && candidates.length > 0) {
      for (const candidate of candidates) {
        if (candidate.resume_url) {
          try {
            // Extract file path from URL
            const match = candidate.resume_url.match(/resumes\/(.+)$/)
            if (match) {
              const filePath = match[1]
              await adminClient.storage.from('resumes').remove([filePath])
            }
          } catch (storageError) {
            console.error('Storage deletion error:', storageError)
            // Continue with deletion even if storage fails
          }
        }
      }
    }

    // Delete job (will cascade delete candidates via database constraints)
    const { error: deleteError } = await adminClient
      .from('jobs')
      .delete()
      .eq('id', jobId)

    if (deleteError) {
      console.error('Delete job error:', deleteError)
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    // Log activity with admin client
    await adminClient.from('activity_log').insert({
      user_id: user.id,
      action: 'ADMIN_DELETE_JOB',
      resource_type: 'job',
      resource_id: jobId,
      metadata: { title: job?.title, owner_id: job?.user_id },
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
