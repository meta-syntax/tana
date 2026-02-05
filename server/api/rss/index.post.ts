import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types'

const MAX_FEEDS_PER_USER = 50

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<{ url: string }>(event)
  if (!body?.url?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'URL is required' })
  }

  // URLバリデーション + SSRF検証 + パース検証
  let feed: Awaited<ReturnType<typeof parseFeed>>
  try {
    feed = await parseFeed(body.url.trim())
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid RSS/Atom feed URL'
    })
  }

  const client = await serverSupabaseClient<Database>(event)

  // ユーザーあたり上限チェック
  const { count, error: countError } = await client
    .from('rss_feeds')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.sub)

  if (countError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to check feed count' })
  }

  if ((count ?? 0) >= MAX_FEEDS_PER_USER) {
    throw createError({
      statusCode: 400,
      statusMessage: `Feed limit reached (max ${MAX_FEEDS_PER_USER})`
    })
  }

  // フィード登録
  const { data, error: insertError } = await client
    .from('rss_feeds')
    .insert({
      user_id: user.sub,
      url: body.url.trim(),
      title: feed.title,
      description: feed.description,
      site_url: feed.siteUrl
    })
    .select()
    .single()

  if (insertError) {
    if (insertError.code === '23505') {
      throw createError({
        statusCode: 400,
        statusMessage: 'This feed is already registered'
      })
    }
    throw createError({ statusCode: 500, statusMessage: 'Failed to add feed' })
  }

  return data
})
