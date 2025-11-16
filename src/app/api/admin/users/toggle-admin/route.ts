import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Use regular client for authentication check
    const supabase = await createClient()

    // Verify admin authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, isAdmin } = await request.json()

    if (!userId || typeof isAdmin !== 'boolean') {
      return NextResponse.json(
        { error: 'userId and isAdmin are required' },
        { status: 400 }
      )
    }

    // Prevent self-demotion
    if (userId === user.id && !isAdmin) {
      return NextResponse.json(
        { error: 'Cannot revoke your own admin privileges' },
        { status: 400 }
      )
    }

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()

    // Update user's admin status
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId)

    if (updateError) {
      console.error('Update user error:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Log activity with admin client
    await adminClient.from('activity_log').insert({
      user_id: user.id,
      action: isAdmin ? 'ADMIN_GRANT_ADMIN' : 'ADMIN_REVOKE_ADMIN',
      resource_type: 'user',
      resource_id: userId,
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
