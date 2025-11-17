import { GoogleGenerativeAI } from '@google/generative-ai'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import { env } from '@/lib/env'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
const fileManager = new GoogleAIFileManager(env.GEMINI_API_KEY)

export interface AnalysisResult {
  score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendation: string
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 2000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Check if it's a retryable error (503, rate limit, etc.)
      const errorMessage = error instanceof Error ? error.message : String(error)
      const isRetryable =
        errorMessage.includes('503') ||
        errorMessage.includes('overloaded') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('RESOURCE_EXHAUSTED')

      if (!isRetryable || attempt === maxRetries - 1) {
        throw error
      }

      // Exponential backoff: 2s, 4s, 8s
      const delay = initialDelay * Math.pow(2, attempt)
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

export async function analyzeResumeFile(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  jobDescription: string
): Promise<{ result?: AnalysisResult; error?: string }> {
  let tempFilePath: string | null = null

  try {
    // Write buffer to temporary file
    tempFilePath = join(tmpdir(), `resume-${Date.now()}-${fileName}`)
    await writeFile(tempFilePath, fileBuffer)

    // Upload file to Gemini
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType,
      displayName: fileName,
    })

    console.log('Gemini file uploaded:', uploadResult.file.uri)

    // Use Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

    const prompt = `
You are an expert HR recruiter analyzing a resume for a job position.

**Job Description:**
${jobDescription}

**Task:**
Analyze the resume document provided and evaluate how well this candidate matches the job requirements. Provide a detailed assessment.

**Response Format (JSON only, no markdown):**
{
  "score": <number between 0-100>,
  "summary": "<2-3 sentence overview>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "recommendation": "<HIRE|INTERVIEW|REJECT>"
}

**Scoring Guidelines:**
- 90-100: Exceptional match, all key requirements met
- 70-89: Strong match, most requirements met
- 50-69: Moderate match, some requirements met
- 30-49: Weak match, few requirements met
- 0-29: Poor match, minimal requirements met

Be objective and specific. Focus on skills, experience, and qualifications.
`

    // Use retry logic for Gemini API call
    const result = await retryWithBackoff(async () => {
      return await model.generateContent([
        {
          fileData: {
            mimeType: uploadResult.file.mimeType,
            fileUri: uploadResult.file.uri,
          },
        },
        { text: prompt },
      ])
    })

    const response = result.response
    const text = response.text()

    // Clean up response
    let cleanText = text.trim()
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '')
    }

    // Parse JSON
    const analysis: AnalysisResult = JSON.parse(cleanText)

    // Validate structure
    if (
      typeof analysis.score !== 'number' ||
      analysis.score < 0 ||
      analysis.score > 100
    ) {
      throw new Error('Invalid score in analysis')
    }

    if (!analysis.summary || !Array.isArray(analysis.strengths)) {
      throw new Error('Invalid analysis structure')
    }

    // Clean up temp file
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {})
    }

    return { result: analysis }
  } catch (error) {
    console.error('Gemini analysis error:', error)

    // Clean up temp file on error
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {})
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to analyze resume with AI',
    }
  }
}

export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<{ result?: AnalysisResult; error?: string }> {
  try {
    // Use Gemini 1.5 Flash (Free tier)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

    const prompt = `
You are an expert HR recruiter analyzing a resume for a job position.

**Job Description:**
${jobDescription}

**Resume Content:**
${resumeText}

**Task:**
Analyze how well this candidate matches the job requirements. Provide a detailed assessment.

**Response Format (JSON only, no markdown):**
{
  "score": <number between 0-100>,
  "summary": "<2-3 sentence overview>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "recommendation": "<HIRE|INTERVIEW|REJECT>"
}

**Scoring Guidelines:**
- 90-100: Exceptional match, all key requirements met
- 70-89: Strong match, most requirements met
- 50-69: Moderate match, some requirements met
- 30-49: Weak match, few requirements met
- 0-29: Poor match, minimal requirements met

Be objective and specific. Focus on skills, experience, and qualifications.
`

    // Use retry logic for Gemini API call
    const result = await retryWithBackoff(async () => {
      return await model.generateContent(prompt)
    })

    const response = result.response
    const text = response.text()

    // Clean up response (remove markdown code blocks if present)
    let cleanText = text.trim()
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '')
    }

    // Parse JSON
    const analysis: AnalysisResult = JSON.parse(cleanText)

    // Validate structure
    if (
      typeof analysis.score !== 'number' ||
      analysis.score < 0 ||
      analysis.score > 100
    ) {
      throw new Error('Invalid score in analysis')
    }

    if (!analysis.summary || !Array.isArray(analysis.strengths)) {
      throw new Error('Invalid analysis structure')
    }

    return { result: analysis }
  } catch (error) {
    console.error('Gemini analysis error:', error)
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to analyze resume with AI',
    }
  }
}

export async function testGeminiConnection(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })
    const result = await model.generateContent('Say "Hello World"')
    const response = await result.response
    const text = response.text()

    if (text) {
      return { success: true }
    } else {
      return { success: false, error: 'Empty response from Gemini' }
    }
  } catch (error) {
    console.error('Gemini connection test error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    }
  }
}
