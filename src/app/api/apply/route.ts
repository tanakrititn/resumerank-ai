import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { uploadResumePublic } from '@/lib/utils/file-upload'
import { env } from '@/lib/env'
import { broadcastCandidateChange } from '@/lib/utils/realtime-broadcast'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Public Application API Called ===')
    const formData = await request.formData()

    const jobId = formData.get('jobId') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string | null
    const resume = formData.get('resume') as File

    console.log('Form data received:', {
      jobId,
      name,
      email,
      phone,
      resumeName: resume?.name,
      resumeSize: resume?.size,
      resumeType: resume?.type,
    })

    // Validate required fields
    if (!jobId || !name || !email || !resume) {
      console.error('Validation failed - missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use admin client for public applications (bypasses RLS)
    const supabase = createAdminClient()

    // Get job details and verify it's OPEN
    console.log('Fetching job details for:', jobId)
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, user_id, title, status')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      console.error('Job not found:', jobError)
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    console.log('Job found:', { id: job.id, title: job.title, status: job.status })

    if (job.status !== 'OPEN') {
      console.error('Job is not open:', job.status)
      return NextResponse.json(
        { error: 'This job is no longer accepting applications' },
        { status: 400 }
      )
    }

    // Check if email already applied to this job
    console.log('Checking for duplicate application:', email)
    const { data: existingApplication } = await supabase
      .from('candidates')
      .select('id')
      .eq('job_id', jobId)
      .eq('email', email)
      .single()

    if (existingApplication) {
      console.error('Duplicate application detected')
      return NextResponse.json(
        { error: 'You have already applied to this position' },
        { status: 400 }
      )
    }

    // Create candidate record
    console.log('Creating candidate record...')
    const { data: candidate, error: insertError } = await supabase
      .from('candidates')
      .insert({
        job_id: jobId,
        user_id: job.user_id,
        name,
        email,
        phone: phone || null,
        status: 'PENDING_REVIEW',
      })
      .select()
      .single()

    if (insertError || !candidate) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      )
    }

    console.log('Candidate created successfully:', candidate.id)

    // Upload resume file (using public upload with service role)
    console.log('Uploading resume file...')
    const { url, error: uploadError } = await uploadResumePublic(
      resume,
      job.user_id,
      jobId,
      candidate.id
    )

    if (uploadError || !url) {
      console.error('Upload error:', uploadError)
      // Clean up candidate if upload fails
      await supabase.from('candidates').delete().eq('id', candidate.id)
      return NextResponse.json(
        { error: uploadError || 'Failed to upload resume' },
        { status: 500 }
      )
    }

    console.log('Resume uploaded successfully:', url)

    // Update candidate with resume URL
    console.log('Updating candidate with resume URL...')
    const { error: updateError } = await supabase
      .from('candidates')
      .update({ resume_url: url })
      .eq('id', candidate.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to save resume URL' },
        { status: 500 }
      )
    }

    console.log('Candidate updated successfully')

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: job.user_id,
      action: 'PUBLIC_APPLICATION',
      resource_type: 'candidate',
      resource_id: candidate.id,
      metadata: { name, job_title: job.title },
    })

    // Broadcast real-time update to job owner (both job page and dashboard)
    try {
      const { createClient: createServiceClient } = await import(
        '@supabase/supabase-js'
      )
      const supabaseService = createServiceClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      )

      await broadcastCandidateChange(supabaseService, jobId, job.user_id, {
        action: 'insert',
        candidateId: candidate.id,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to broadcast real-time update:', error)
    }

    // Trigger AI analysis asynchronously
    try {
      const authToken = env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)
      const analyzeUrl = `${env.NEXT_PUBLIC_APP_URL}/api/analyze-resume`

      console.log('Triggering AI analysis at:', analyzeUrl)

      fetch(analyzeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ candidateId: candidate.id }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}))
            console.error('AI analysis API error:', {
              status: res.status,
              statusText: res.statusText,
              error: errorData,
            })
          } else {
            const data = await res.json()
            console.log('AI analysis triggered successfully:', data)
          }
        })
        .catch((error) => {
          console.error('Failed to trigger AI analysis:', error)
        })
    } catch (error) {
      console.error('Failed to trigger AI analysis:', error)
    }

    return NextResponse.json({
      success: true,
      candidateId: candidate.id,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
