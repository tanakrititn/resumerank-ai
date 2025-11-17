import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { uploadResumePublic } from '@/lib/utils/file-upload'
import { env } from '@/lib/env'
import { broadcastCandidateChange } from '@/lib/utils/realtime-broadcast'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for AI analysis

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

    // Trigger AI analysis asynchronously using internal function call
    // This is more reliable than HTTP fetch and avoids URL/auth issues
    console.log('Triggering AI analysis for candidate:', candidate.id)

    // Start async analysis but don't block the response
    const analysisPromise = (async () => {
      try {
        console.log('Starting AI analysis import...')
        const { analyzeResumeFile } = await import('@/lib/ai/gemini')
        const { createClient: createServiceClient } = await import('@supabase/supabase-js')
        const { broadcastCandidateChange } = await import('@/lib/utils/realtime-broadcast')

        console.log('Creating Supabase service client...')
        const supabaseService = createServiceClient(
          env.NEXT_PUBLIC_SUPABASE_URL,
          env.SUPABASE_SERVICE_ROLE_KEY
        )

        console.log('Fetching candidate and job details...')
        // Get candidate and job details
        const { data: candidateData, error: candidateError } = await supabaseService
          .from('candidates')
          .select('*, jobs(*)')
          .eq('id', candidate.id)
          .single()

        if (candidateError || !candidateData) {
          console.error('Failed to fetch candidate for analysis:', candidateError)
          return
        }

        console.log('Candidate fetched, validating job data...')
        const jobData = candidateData.jobs as any
        if (!jobData || !jobData.description) {
          console.error('Job description not found')
          return
        }

        console.log('Downloading resume file...')
        // Download resume file
        const resumePath = candidateData.resume_url.split('/resumes/')[1]
        if (!resumePath) {
          console.error('Invalid resume URL:', candidateData.resume_url)
          return
        }

        const { data: fileData, error: downloadError } = await supabaseService.storage
          .from('resumes')
          .download(resumePath)

        if (downloadError || !fileData) {
          console.error('Failed to download resume:', downloadError)
          return
        }

        console.log('Resume downloaded, converting to buffer...')
        // Convert blob to buffer
        const arrayBuffer = await fileData.arrayBuffer()
        const fileBuffer = Buffer.from(arrayBuffer)

        // Determine file type
        const fileExt = resumePath.split('.').pop()?.toLowerCase()
        const mimeType = fileExt === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        const fileName = resumePath.split('/').pop() || 'resume.pdf'

        console.log(`Starting Gemini AI analysis for ${fileName} (${mimeType})...`)

        // Build job description
        const jobDescription = `
Title: ${jobData.title}
Description: ${jobData.description}
${jobData.requirements ? `Requirements: ${jobData.requirements}` : ''}
${jobData.location ? `Location: ${jobData.location}` : ''}
        `.trim()

        // Analyze resume
        const { result, error: analysisError } = await analyzeResumeFile(
          fileBuffer,
          fileName,
          mimeType,
          jobDescription
        )

        if (analysisError || !result) {
          console.error('AI analysis failed:', analysisError)
          return
        }

        console.log('AI analysis completed! Score:', result.score)

        // Update candidate with results
        const { error: updateError } = await supabaseService
          .from('candidates')
          .update({
            ai_score: result.score,
            ai_summary: result.summary,
            ai_strengths: result.strengths || [],
            ai_weaknesses: result.weaknesses || [],
            ai_recommendation: result.recommendation || null,
            status: 'REVIEWED',
          })
          .eq('id', candidate.id)

        if (updateError) {
          console.error('Failed to save analysis results:', updateError)
          return
        }

        console.log('Results saved to database')

        // Broadcast update
        await broadcastCandidateChange(supabaseService, candidateData.job_id, candidateData.user_id, {
          action: 'update',
          candidateId: candidate.id,
          timestamp: new Date().toISOString(),
        })

        console.log('Real-time update broadcast')

        // Update quota
        await supabaseService.rpc('increment_used_credits', { user_id: candidateData.user_id })

        // Log activity
        await supabaseService.from('activity_log').insert({
          user_id: candidateData.user_id,
          action: 'AI_ANALYSIS_COMPLETED',
          resource_type: 'candidate',
          resource_id: candidate.id,
          metadata: { score: result.score, analysis: result },
        })

        console.log('✅ AI analysis completed successfully for candidate:', candidate.id, 'Score:', result.score)
      } catch (error) {
        console.error('❌ AI analysis error:', error)
        console.error('Error details:', error instanceof Error ? error.message : String(error))
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      }
    })()

    // Keep function alive to complete the analysis
    try {
      await analysisPromise
    } catch (error) {
      console.error('Analysis promise error:', error)
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
