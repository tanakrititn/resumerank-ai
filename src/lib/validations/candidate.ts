import { z } from 'zod'
import { sanitizeHtml, removeControlCharacters, isValidEmail } from '@/lib/utils/sanitize'
import { config } from '@/lib/config'

const MAX_FILE_SIZE = config.limits.maxFileSize
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export const createCandidateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be less than 200 characters')
    .transform((val) => sanitizeHtml(removeControlCharacters(val))),
  email: z
    .string()
    .email('Invalid email address')
    .max(254)
    .refine((val) => isValidEmail(val), 'Invalid email format')
    .transform((val) => val.toLowerCase().trim()),
  phone: z
    .string()
    .max(50, 'Phone must be less than 50 characters')
    .transform((val) => sanitizeHtml(removeControlCharacters(val)))
    .optional(),
  resume: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    )
    .refine(
      (file) => ALLOWED_FILE_TYPES.includes(file.type),
      'Only PDF and DOCX files are allowed'
    )
    .refine(
      (file) => {
        // Check file extension matches MIME type
        const ext = file.name.toLowerCase().split('.').pop()
        if (file.type === 'application/pdf') return ext === 'pdf'
        if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          return ext === 'docx'
        }
        return false
      },
      'File extension does not match file type'
    ),
})

export const updateCandidateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(200)
    .transform((val) => sanitizeHtml(removeControlCharacters(val)))
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .max(254)
    .refine((val) => isValidEmail(val), 'Invalid email format')
    .transform((val) => val.toLowerCase().trim())
    .optional(),
  phone: z
    .string()
    .max(50)
    .transform((val) => sanitizeHtml(removeControlCharacters(val)))
    .optional(),
  status: z
    .enum(['PENDING_REVIEW', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED'])
    .optional(),
  notes: z
    .string()
    .max(5000, 'Notes must be less than 5000 characters')
    .transform((val) => sanitizeHtml(removeControlCharacters(val)))
    .optional(),
})

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>
