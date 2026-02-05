import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const client = await serverSupabaseClient<Database>(event)

  const { data, error } = await client
    .from('rss_feeds')
    .select('*')
    .eq('user_id', user.sub)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch feeds' })
  }

  return data
})
