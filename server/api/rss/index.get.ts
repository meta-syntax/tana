import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types'

export default defineEventHandler(async (event) => {
  const userId = await requireAuth(event)

  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('rss_feeds')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch feeds' })
  }

  return data
})
