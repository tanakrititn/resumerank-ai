import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { candidateId } = await request.json()

    // Verify ownership
    const { data: candidate } = await supabase
      .from('candidates')
      .select('user_id')
      .eq('id', candidateId)
      .single()

    if (!candidate || candidate.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Candidate not found or unauthorized' },
        { status: 403 }
      )
    }

    // Call analyze API
    const authToken = env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)
    const analyzeUrl = `${env.NEXT_PUBLIC_APP_URL}/api/analyze-resume`

    const response = await fetch(analyzeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ candidateId }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error || 'Analysis failed' },
        { status: response.status }
      )
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Trigger analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
