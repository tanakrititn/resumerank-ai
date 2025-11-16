import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUniqueTags, type Tag } from '@/lib/utils/tags'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all candidates' tags for this user
    const { data: candidates, error: fetchError } = await supabase
      .from('candidates')
      .select('tags')
      .eq('user_id', user.id)

    if (fetchError) {
      console.error('Fetch tags error:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch tags' },
        { status: 500 }
      )
    }

    // Extract and deduplicate tags
    const allTags: Tag[][] = candidates
      ?.map((c) => c.tags as Tag[])
      .filter((tags) => tags && tags.length > 0) || []

    const uniqueTags = getUniqueTags(allTags)

    return NextResponse.json({
      tags: uniqueTags,
      count: uniqueTags.length,
    })
  } catch (error) {
    console.error('Get tags API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
