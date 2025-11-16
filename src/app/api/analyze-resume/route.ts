import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { analyzeResumeFile } from '@/lib/ai/gemini'
import { env } from '@/lib/env'
import { broadcastCandidateChange } from '@/lib/utils/realtime-broadcast'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

export async function POST(request: NextRequest) {
  try {
    // Verify this is a server-to-server request (simple auth token)
    const authHeader = request.headers.get('authorization')
    const expectedToken = env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { candidateId } = await request.json()

    if (!candidateId) {
      return NextResponse.json(
        { error: 'candidateId is required' },
        { status: 400 }
      )
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Get candidate and job details
    const { data: candidate, error: candidateError } = await supabase
      .from('candidates')
      .select('*, jobs(*)')
      .eq('id', candidateId)
      .single()

    if (candidateError || !candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    // Check if already analyzed
    if (candidate.ai_score !== null) {
      return NextResponse.json({
        message: 'Already analyzed',
        score: candidate.ai_score,
      })
    }

    // Verify resume URL exists
    if (!candidate.resume_url) {
      return NextResponse.json(
        { error: 'Resume URL not found' },
        { status: 400 }
      )
    }

    const job = candidate.jobs as any

    if (!job || !job.description) {
      return NextResponse.json(
        { error: 'Job description not found' },
        { status: 400 }
      )
    }

    // Download resume file from Supabase storage
    const resumePath = candidate.resume_url.split('/resumes/')[1]
    if (!resumePath) {
      return NextResponse.json(
        { error: 'Invalid resume URL' },
        { status: 400 }
      )
    }

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(resumePath)

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError)
      return NextResponse.json(
        { error: 'Failed to download resume' },
        { status: 500 }
      )
    }

    // Convert blob to buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // Determine file type from URL
    const fileExt = resumePath.split('.').pop()?.toLowerCase()
    const mimeType =
      fileExt === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    const fileName = resumePath.split('/').pop() || 'resume.pdf'

    // Build job description
    const jobDescription = `
Title: ${job.title}
Description: ${job.description}
${job.requirements ? `Requirements: ${job.requirements}` : ''}
${job.location ? `Location: ${job.location}` : ''}
    `.trim()

    // Analyze resume file with Gemini
    const { result, error: analysisError } = await analyzeResumeFile(
      fileBuffer,
      fileName,
      mimeType,
      jobDescription
    )

    if (analysisError || !result) {
      console.error('Analysis error:', analysisError)

      // Check if it's a temporary error (503, overloaded, rate limit)
      const isTemporaryError =
        analysisError?.includes('503') ||
        analysisError?.includes('overloaded') ||
        analysisError?.includes('rate limit') ||
        analysisError?.includes('RESOURCE_EXHAUSTED')

      // For temporary errors, keep candidate as PENDING_REVIEW so it can be retried
      // For other errors, we could mark it as failed, but let's keep it pending for now

      return NextResponse.json(
        {
          error: isTemporaryError
            ? 'AI service is temporarily overloaded. Please try again in a few moments.'
            : analysisError || 'Analysis failed',
          isTemporary: isTemporaryError,
        },
        { status: isTemporaryError ? 503 : 500 }
      )
    }

    // Update candidate with AI results
    const { error: updateError } = await supabase
      .from('candidates')
      .update({
        ai_score: result.score,
        ai_summary: result.summary,
        status: 'REVIEWED',
      })
      .eq('id', candidateId)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to save analysis' },
        { status: 500 }
      )
    }

    // Broadcast real-time update to all connected clients (both job page and dashboard)
    const jobId = candidate.job_id
    try {
      await broadcastCandidateChange(supabase, jobId, candidate.user_id, {
        action: 'update',
        candidateId,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to broadcast AI analysis completion:', error)
    }

    // Update quota
    await supabase.rpc('increment_used_credits', { user_id: candidate.user_id })

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: candidate.user_id,
      action: 'AI_ANALYSIS_COMPLETED',
      resource_type: 'candidate',
      resource_id: candidateId,
      metadata: { score: result.score, analysis: result },
    })

    return NextResponse.json({
      success: true,
      score: result.score,
      summary: result.summary,
      analysis: result,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
