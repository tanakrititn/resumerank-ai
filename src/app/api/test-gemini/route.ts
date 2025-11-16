import { NextResponse } from 'next/server'
import { testGeminiConnection } from '@/lib/ai/gemini'

export async function GET() {
  try {
    const result = await testGeminiConnection()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Gemini AI is connected and working properly!',
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Connection test failed',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Test Gemini API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
