import { serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

export const requireAuth = async (event: H3Event): Promise<string> => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return user.sub
}
