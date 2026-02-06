import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)

  const id = requireRouteParam(event, 'id')

  const client = await serverSupabaseClient<Database>(event)

  // フィード取得
  const { data: feed, error: feedError } = await client
    .from('rss_feeds')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (feedError || !feed) {
    throw createError({ statusCode: 404, statusMessage: 'Feed not found' })
  }

  try {
    const result = await syncFeed(client, feed)
    return { success: true, newArticles: result.newArticles }
  } catch (error) {
    await recordSyncError(client, feed, error)
    throw createError({ statusCode: 502, statusMessage: 'Failed to sync feed' })
  }
})
