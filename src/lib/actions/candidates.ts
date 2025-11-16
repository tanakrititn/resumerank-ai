'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createCandidateSchema, updateCandidateSchema } from '@/lib/validations/candidate'
import { uploadResume, deleteResume } from '@/lib/utils/file-upload'
import { env } from '@/lib/env'
import type { UpdateCandidateInput } from '@/lib/validations/candidate'

export async function createCandidate(jobId: string, formData: FormData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Verify job ownership
    const { data: job } = await supabase
      .from('jobs')
      .select('user_id')
      .eq('id', jobId)
      .single()

    if (!job || job.user_id !== user.id) {
      return { error: 'Job not found or unauthorized' }
    }

    // Validate input
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      resume: formData.get('resume') as File,
    }

    const validated = createCandidateSchema.parse(data)

    // Check quota
    const { data: quota } = await supabase
      .from('user_quotas')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!quota || quota.used_credits >= quota.ai_credits) {
      return { error: 'AI credits exhausted. Please wait for monthly reset.' }
    }

    // Create candidate record first (to get ID)
    const { data: candidate, error: insertError } = await supabase
      .from('candidates')
      .insert({
        job_id: jobId,
        user_id: user.id,
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        status: 'PENDING_REVIEW',
      })
      .select()
      .single()

    if (insertError || !candidate) {
      console.error('Insert error:', insertError)
      return { error: 'Failed to create candidate' }
    }

    // Upload resume file (no text extraction needed - Gemini will analyze directly)
    const { url, error: uploadError } = await uploadResume(
      validated.resume,
      user.id,
      jobId,
      candidate.id
    )

    if (uploadError || !url) {
      // Clean up candidate if upload fails
      await supabase.from('candidates').delete().eq('id', candidate.id)
      return { error: uploadError || 'Failed to upload resume' }
    }

    // Update candidate with resume URL only
    const { error: updateError } = await supabase
      .from('candidates')
      .update({
        resume_url: url,
      })
      .eq('id', candidate.id)

    if (updateError) {
      console.error('Update error:', updateError)
      // Clean up
      await deleteResume(url)
      await supabase.from('candidates').delete().eq('id', candidate.id)
      return { error: 'Failed to update candidate' }
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: 'CREATE_CANDIDATE',
      resource_type: 'candidate',
      resource_id: candidate.id,
      metadata: { name: candidate.name, job_id: jobId },
    })

    // Broadcast real-time update to all connected clients
    try {
      const { createClient: createServiceClient } = await import(
        '@supabase/supabase-js'
      )
      const supabaseService = createServiceClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      )

      await supabaseService.channel(`job:${jobId}:candidates`).send({
        type: 'broadcast',
        event: 'candidate-change',
        payload: {
          action: 'insert',
          candidateId: candidate.id,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('Failed to broadcast real-time update:', error)
    }

    // Trigger AI analysis asynchronously
    try {
      const authToken = env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)
      const analyzeUrl = `${env.NEXT_PUBLIC_APP_URL}/api/analyze-resume`

      // Fire and forget (don't await)
      fetch(analyzeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ candidateId: candidate.id }),
      }).catch((error) => {
        console.error('Failed to trigger AI analysis:', error)
      })
    } catch (error) {
      console.error('Failed to trigger AI analysis:', error)
    }

    revalidatePath(`/jobs/${jobId}`)
    return { success: true, data: candidate }
  } catch (error) {
    console.error('Create candidate error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function updateCandidate(
  candidateId: string,
  data: UpdateCandidateInput
) {
  try {
    const validated = updateCandidateSchema.parse(data)
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Verify ownership
    const { data: existingCandidate } = await supabase
      .from('candidates')
      .select('user_id, job_id')
      .eq('id', candidateId)
      .single()

    if (!existingCandidate || existingCandidate.user_id !== user.id) {
      return { error: 'Candidate not found or unauthorized' }
    }

    const { data: candidate, error } = await supabase
      .from('candidates')
      .update(validated)
      .eq('id', candidateId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: 'UPDATE_CANDIDATE',
      resource_type: 'candidate',
      resource_id: candidate.id,
      metadata: { changes: validated },
    })

    // Broadcast real-time update to all connected clients
    try {
      const { createClient: createServiceClient } = await import(
        '@supabase/supabase-js'
      )
      const supabaseService = createServiceClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      )

      await supabaseService
        .channel(`job:${existingCandidate.job_id}:candidates`)
        .send({
          type: 'broadcast',
          event: 'candidate-change',
          payload: {
            action: 'update',
            candidateId: candidate.id,
            timestamp: new Date().toISOString(),
          },
        })
    } catch (error) {
      console.error('Failed to broadcast real-time update:', error)
    }

    revalidatePath(`/jobs/${existingCandidate.job_id}`)
    return { success: true, data: candidate }
  } catch (error) {
    console.error('Update candidate error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function deleteCandidate(candidateId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Get candidate info
    const { data: existingCandidate } = await supabase
      .from('candidates')
      .select('user_id, job_id, resume_url, name')
      .eq('id', candidateId)
      .single()

    if (!existingCandidate || existingCandidate.user_id !== user.id) {
      return { error: 'Candidate not found or unauthorized' }
    }

    // Delete resume file if exists
    if (existingCandidate.resume_url) {
      await deleteResume(existingCandidate.resume_url)
    }

    // Delete candidate
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', candidateId)

    if (error) {
      return { error: error.message }
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: 'DELETE_CANDIDATE',
      resource_type: 'candidate',
      resource_id: candidateId,
      metadata: { name: existingCandidate.name },
    })

    // Broadcast real-time update to all connected clients
    try {
      const { createClient: createServiceClient } = await import(
        '@supabase/supabase-js'
      )
      const supabaseService = createServiceClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      )

      await supabaseService
        .channel(`job:${existingCandidate.job_id}:candidates`)
        .send({
          type: 'broadcast',
          event: 'candidate-change',
          payload: {
            action: 'delete',
            candidateId,
            timestamp: new Date().toISOString(),
          },
        })
    } catch (error) {
      console.error('Failed to broadcast real-time update:', error)
    }

    revalidatePath(`/jobs/${existingCandidate.job_id}`)
    return { success: true }
  } catch (error) {
    console.error('Delete candidate error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function getCandidates(jobId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Verify job ownership
  const { data: job } = await supabase
    .from('jobs')
    .select('user_id')
    .eq('id', jobId)
    .single()

  if (!job || job.user_id !== user.id) {
    return { error: 'Job not found or unauthorized' }
  }

  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}
