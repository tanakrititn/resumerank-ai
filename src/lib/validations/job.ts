import { z } from 'zod'
import { sanitizeHtml, removeControlCharacters } from '@/lib/utils/sanitize'

export const createJobSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .transform((val) => sanitizeHtml(removeControlCharacters(val))),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .transform((val) => sanitizeHtml(removeControlCharacters(val))),
  requirements: z
    .string()
    .max(5000, 'Requirements must be less than 5000 characters')
    .transform((val) => sanitizeHtml(removeControlCharacters(val)))
    .optional(),
  location: z
    .string()
    .max(200, 'Location must be less than 200 characters')
    .transform((val) => sanitizeHtml(removeControlCharacters(val)))
    .optional(),
  salary_range: z
    .string()
    .max(100, 'Salary range must be less than 100 characters')
    .transform((val) => sanitizeHtml(removeControlCharacters(val)))
    .optional(),
  status: z.enum(['OPEN', 'CLOSED', 'PAUSED']).default('OPEN'),
})

export const updateJobSchema = createJobSchema.partial()

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
