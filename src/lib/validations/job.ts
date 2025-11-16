import { z } from 'zod'

export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requirements: z.string().optional(),
  location: z.string().optional(),
  salary_range: z.string().optional(),
  status: z.enum(['OPEN', 'CLOSED', 'PAUSED']).default('OPEN'),
})

export const updateJobSchema = createJobSchema.partial()

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
