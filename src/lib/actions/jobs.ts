'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createJobSchema, updateJobSchema } from '@/lib/validations/job'
import type { CreateJobInput, UpdateJobInput } from '@/lib/validations/job'
import { logger } from '@/lib/logger'

export async function createJob(data: CreateJobInput) {
  let userId: string | undefined
  try {
    const validated = createJobSchema.parse(data)
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    userId = user.id

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        ...validated,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create job', {
        error: error.message,
        userId: user.id,
        jobTitle: validated.title,
      })
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

    logger.info('Job created successfully', {
      jobId: job.id,
      userId: user.id,
      jobTitle: job.title,
    })

    revalidatePath('/jobs')
    return { success: true, data: job }
  } catch (error) {
    logger.error('Failed to create job', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
    })
    return { error: 'An unexpected error occurred' }
  }
}

export async function updateJob(jobId: string, data: UpdateJobInput) {
  let userId: string | undefined
  try {
    const validated = updateJobSchema.parse(data)
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    userId = user.id

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

    logger.info('Job updated successfully', {
      jobId: job.id,
      userId: user.id,
      isAdmin,
      jobTitle: job.title,
    })

    revalidatePath('/jobs')
    revalidatePath(`/jobs/${jobId}`)
    revalidatePath('/admin/jobs')
    revalidatePath(`/admin/jobs/${jobId}`)
    return { success: true, data: job }
  } catch (error) {
    logger.error('Failed to update job', {
      error: error instanceof Error ? error.message : 'Unknown error',
      jobId,
      userId,
    })
    return { error: 'An unexpected error occurred' }
  }
}

export async function deleteJob(jobId: string) {
  let userId: string | undefined
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    userId = user.id

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

    logger.info('Job deleted successfully', {
      jobId,
      userId: user.id,
      jobTitle: existingJob.title,
    })

    revalidatePath('/jobs')
    return { success: true }
  } catch (error) {
    logger.error('Failed to delete job', {
      error: error instanceof Error ? error.message : 'Unknown error',
      jobId,
      userId,
    })
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

export async function duplicateJob(jobId: string) {
  let userId: string | undefined
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    userId = user.id

    // Fetch the existing job
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingJob) {
      logger.error('Failed to fetch job for duplication', {
        error: fetchError?.message,
        jobId,
        userId: user.id,
      })
      return { error: 'Job not found or unauthorized' }
    }

    // Prepare duplicated job data (without user_id for validation)
    const duplicatedJobData = {
      title: `${existingJob.title} (Copy)`,
      description: existingJob.description,
      requirements: existingJob.requirements,
      location: existingJob.location,
      salary_range: existingJob.salary_range,
      department: existingJob.department,
      status: 'OPEN' as const,
    }

    // Validate with createJobSchema
    const validated = createJobSchema.parse(duplicatedJobData)

    // Create the duplicated job with user_id
    const { data: newJob, error: createError } = await supabase
      .from('jobs')
      .insert({
        ...validated,
        user_id: user.id,
      })
      .select()
      .single()

    if (createError || !newJob) {
      logger.error('Failed to create duplicated job', {
        error: createError?.message,
        userId: user.id,
        originalJobId: jobId,
      })
      return { error: createError?.message || 'Failed to duplicate job' }
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: 'DUPLICATE_JOB',
      resource_type: 'job',
      resource_id: newJob.id,
      metadata: {
        originalJobId: jobId,
        originalTitle: existingJob.title,
        newTitle: newJob.title,
      },
    })

    logger.info('Job duplicated successfully', {
      originalJobId: jobId,
      newJobId: newJob.id,
      userId: user.id,
      originalTitle: existingJob.title,
      newTitle: newJob.title,
    })

    revalidatePath('/jobs')
    return { success: true, data: newJob }
  } catch (error) {
    logger.error('Failed to duplicate job', {
      error: error instanceof Error ? error.message : 'Unknown error',
      jobId,
      userId,
    })
    return { error: 'An unexpected error occurred' }
  }
}
