import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { analyzeResumeFile } from '@/lib/ai/gemini'
import { env } from '@/lib/env'
import { broadcastCandidateChange } from '@/lib/utils/realtime-broadcast'
import { rateLimitAIAnalysis } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

interface ReanalyzeRequest {
  candidateIds: string[]
  userId: string
}

interface ReanalyzeResult {
  candidateId: string
  success: boolean
  score?: number
  summary?: string
  error?: string
  isTemporary?: boolean
}

/**
 * Re-analyze one or multiple candidates
 * Supports both single and bulk re-analysis
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { candidateIds } = body

    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'candidateIds array is required' },
        { status: 400 }
      )
    }

    // Limit bulk operations
    if (candidateIds.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 candidates can be re-analyzed at once' },
        { status: 400 }
      )
    }

    // Use service role client for analysis
    const supabaseService = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Verify all candidates belong to user
    const { data: candidates, error: fetchError } = await supabaseService
      .from('candidates')
      .select('id, user_id, resume_url, job_id, name, jobs(title, description, requirements, location)')
      .in('id', candidateIds)

    if (fetchError || !candidates) {
      return NextResponse.json(
        { error: 'Failed to fetch candidates' },
        { status: 500 }
      )
    }

    // Verify ownership
    const unauthorized = candidates.some(c => c.user_id !== user.id)
    if (unauthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Some candidates do not belong to you' },
        { status: 403 }
      )
    }

    // Check candidates without resume URLs
    const missingResume = candidates.filter(c => !c.resume_url)
    if (missingResume.length > 0) {
      logger.warn('Some candidates missing resume URLs', {
        candidateIds: missingResume.map(c => c.id),
        userId: user.id,
      })
    }

    // Process each candidate
    const results: ReanalyzeResult[] = []

    for (const candidate of candidates) {
      // Skip if no resume
      if (!candidate.resume_url) {
        results.push({
          candidateId: candidate.id,
          success: false,
          error: 'No resume file found',
        })
        continue
      }

      // Rate limit check
      const { success: rateLimitOk } = await rateLimitAIAnalysis(user.id)
      if (!rateLimitOk) {
        results.push({
          candidateId: candidate.id,
          success: false,
          error: 'Rate limit exceeded. Please wait and try again.',
          isTemporary: true,
        })
        continue
      }

      try {
        const job = candidate.jobs as any

        if (!job || !job.description) {
          results.push({
            candidateId: candidate.id,
            success: false,
            error: 'Job description not found',
          })
          continue
        }

        // Download resume
        const resumePath = candidate.resume_url.split('/resumes/')[1]
        if (!resumePath) {
          results.push({
            candidateId: candidate.id,
            success: false,
            error: 'Invalid resume URL',
          })
          continue
        }

        const { data: fileData, error: downloadError } = await supabaseService.storage
          .from('resumes')
          .download(resumePath)

        if (downloadError || !fileData) {
          logger.error('Failed to download resume for re-analysis', {
            error: downloadError?.message,
            candidateId: candidate.id,
            resumePath,
          })
          results.push({
            candidateId: candidate.id,
            success: false,
            error: 'Failed to download resume',
          })
          continue
        }

        // Convert to buffer
        const arrayBuffer = await fileData.arrayBuffer()
        const fileBuffer = Buffer.from(arrayBuffer)

        // Determine file type
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

        // Analyze with Gemini
        const { result, error: analysisError } = await analyzeResumeFile(
          fileBuffer,
          fileName,
          mimeType,
          jobDescription
        )

        if (analysisError || !result) {
          const isTemporaryError =
            analysisError?.includes('503') ||
            analysisError?.includes('overloaded') ||
            analysisError?.includes('rate limit') ||
            analysisError?.includes('RESOURCE_EXHAUSTED')

          logger.error('Re-analysis failed', {
            error: analysisError,
            candidateId: candidate.id,
            isTemporary: isTemporaryError,
          })

          results.push({
            candidateId: candidate.id,
            success: false,
            error: isTemporaryError
              ? 'AI service temporarily overloaded'
              : analysisError || 'Analysis failed',
            isTemporary: isTemporaryError,
          })
          continue
        }

        // Update candidate
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
          logger.error('Failed to save re-analysis results', {
            error: updateError.message,
            candidateId: candidate.id,
          })
          results.push({
            candidateId: candidate.id,
            success: false,
            error: 'Failed to save results',
          })
          continue
        }

        // Broadcast real-time update
        try {
          await broadcastCandidateChange(supabaseService, candidate.job_id, user.id, {
            action: 'update',
            candidateId: candidate.id,
            timestamp: new Date().toISOString(),
          })
        } catch (error) {
          logger.warn('Failed to broadcast re-analysis update', {
            error: error instanceof Error ? error.message : 'Unknown error',
            candidateId: candidate.id,
          })
        }

        // Log activity
        await supabaseService.from('activity_log').insert({
          user_id: user.id,
          action: 'AI_REANALYSIS_COMPLETED',
          resource_type: 'candidate',
          resource_id: candidate.id,
          metadata: {
            score: result.score,
            previousAnalysis: candidate.name,
            reanalysis: true
          },
        })

        results.push({
          candidateId: candidate.id,
          success: true,
          score: result.score,
          summary: result.summary,
        })

        logger.info('Re-analysis completed successfully', {
          candidateId: candidate.id,
          userId: user.id,
          score: result.score,
        })

      } catch (error) {
        logger.error('Re-analysis error for candidate', {
          error: error instanceof Error ? error.message : 'Unknown error',
          candidateId: candidate.id,
        })
        results.push({
          candidateId: candidate.id,
          success: false,
          error: 'Internal error during analysis',
        })
      }
    }

    // Calculate summary
    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    const temporary = results.filter(r => r.isTemporary).length

    return NextResponse.json({
      success: true,
      summary: {
        total: candidateIds.length,
        successful,
        failed,
        temporary,
      },
      results,
    })

  } catch (error) {
    logger.error('Re-analyze API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
