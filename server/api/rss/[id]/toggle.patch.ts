import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types'

export default defineEventHandler(async (event): Promise<{ success: true, is_active: boolean }> => {
  const userId = await requireAuth(event)

  const id = requireRouteParam(event, 'id')

  const client = await serverSupabaseClient<Database>(event)

  // フィード取得
  const { data: feed, error: feedError } = await client
    .from('rss_feeds')
    .select('id, is_active, error_count, last_error')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (feedError || !feed) {
    throw createError({ statusCode: 404, statusMessage: 'Feed not found' })
  }

  const newActive = !feed.is_active

  const { error } = await client
    .from('rss_feeds')
    .update({
      is_active: newActive,
      error_count: newActive ? 0 : feed.error_count,
      last_error: newActive ? null : feed.last_error,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update feed status' })
  }

  return { success: true, is_active: newActive }
})
