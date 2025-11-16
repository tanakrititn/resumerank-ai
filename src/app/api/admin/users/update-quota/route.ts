import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Use regular client for authentication check
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, aiCredits } = await request.json()

    if (!userId || typeof aiCredits !== 'number' || aiCredits < 0) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS for quota operations
    const adminClient = createAdminClient()

    // Use upsert to create or update the quota record
    const { error: updateError } = await adminClient
      .from('user_quotas')
      .upsert(
        {
          user_id: userId,
          ai_credits: aiCredits,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      )

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Log activity with admin client
    await adminClient.from('activity_log').insert({
      user_id: user.id,
      action: 'ADMIN_UPDATE_QUOTA',
      resource_type: 'user',
      resource_id: userId,
      metadata: { ai_credits: aiCredits },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
