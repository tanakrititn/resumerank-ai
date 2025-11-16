'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createJobSchema, updateJobSchema } from '@/lib/validations/job'
import type { CreateJobInput, UpdateJobInput } from '@/lib/validations/job'

export async function createJob(data: CreateJobInput) {
  try {
    const validated = createJobSchema.parse(data)
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        ...validated,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Create job error:', error)
      return { error: error.message }
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: 'CREATE_JOB',
      resource_type: 'job',
      resource_id: job.id,
      metadata: { title: job.title },
    })

    revalidatePath('/jobs')
    return { success: true, data: job }
  } catch (error) {
    console.error('Create job error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function updateJob(jobId: string, data: UpdateJobInput) {
  try {
    const validated = updateJobSchema.parse(data)
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.is_admin || false

    // Verify ownership (skip for admins)
    if (!isAdmin) {
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('user_id')
        .eq('id', jobId)
        .single()

      if (!existingJob || existingJob.user_id !== user.id) {
        return { error: 'Job not found or unauthorized' }
      }
    }

    // Use admin client if user is admin to bypass RLS
    const client = isAdmin ? createAdminClient() : supabase

    const { data: job, error } = await client
      .from('jobs')
      .update(validated)
      .eq('id', jobId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // Log activity
    const logClient = isAdmin ? createAdminClient() : supabase
    await logClient.from('activity_log').insert({
      user_id: user.id,
      action: isAdmin ? 'ADMIN_UPDATE_JOB' : 'UPDATE_JOB',
      resource_type: 'job',
      resource_id: job.id,
      metadata: { changes: validated },
    })

    revalidatePath('/jobs')
    revalidatePath(`/jobs/${jobId}`)
    revalidatePath('/admin/jobs')
    revalidatePath(`/admin/jobs/${jobId}`)
    return { success: true, data: job }
  } catch (error) {
    console.error('Update job error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function deleteJob(jobId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Verify ownership
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('user_id, title')
      .eq('id', jobId)
      .single()

    if (!existingJob || existingJob.user_id !== user.id) {
      return { error: 'Job not found or unauthorized' }
    }

    // Get all candidates for this job to delete their resume files
    const { data: candidates } = await supabase
      .from('candidates')
      .select('resume_url')
      .eq('job_id', jobId)

    // Delete resume files from storage
    if (candidates && candidates.length > 0) {
      for (const candidate of candidates) {
        if (candidate.resume_url) {
          // Extract file path from URL
          const match = candidate.resume_url.match(/resumes\/(.+)$/)
          if (match) {
            const filePath = match[1]
            await supabase.storage.from('resumes').remove([filePath])
          }
        }
      }
    }

    // Delete the job (this will cascade delete candidates due to ON DELETE CASCADE)
    const { error } = await supabase.from('jobs').delete().eq('id', jobId)

    if (error) {
      return { error: error.message }
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: 'DELETE_JOB',
      resource_type: 'job',
      resource_id: jobId,
      metadata: { title: existingJob.title },
    })

    revalidatePath('/jobs')
    return { success: true }
  } catch (error) {
    console.error('Delete job error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function getJobs() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  // Get candidate counts for each job
  if (data) {
    const jobsWithCounts = await Promise.all(
      data.map(async (job) => {
        const { count } = await supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id)

        return {
          ...job,
          candidatesCount: count || 0
        }
      })
    )

    return { data: jobsWithCounts }
  }

  return { data }
}

export async function getJob(jobId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}
