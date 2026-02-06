import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types'

export default defineEventHandler(async (event): Promise<{ success: true }> => {
  const userId = await requireAuth(event)

  const id = requireRouteParam(event, 'id')

  const client = await serverSupabaseClient<Database>(event)

  // 削除前に存在確認（RLSで自分のフィードのみ対象）
  const { data: feed, error: findError } = await client
    .from('rss_feeds')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (findError || !feed) {
    throw createError({ statusCode: 404, statusMessage: 'Feed not found' })
  }

  const { error } = await client
    .from('rss_feeds')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to delete feed' })
  }

  return { success: true }
})
