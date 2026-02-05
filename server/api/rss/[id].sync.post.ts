import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Feed ID is required' })
  }

  const client = await serverSupabaseClient<Database>(event)

  // フィード取得
  const { data: feed, error: feedError } = await client
    .from('rss_feeds')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.sub)
    .single()

  if (feedError || !feed) {
    throw createError({ statusCode: 404, statusMessage: 'Feed not found' })
  }

  try {
    const parsed = await parseFeed(feed.url)

    // last_fetched_at以降の記事をフィルター
    const newItems = feed.last_fetched_at
      ? parsed.items.filter(item =>
          item.publishedAt && new Date(item.publishedAt) > new Date(feed.last_fetched_at!))
      : parsed.items

    // 既存ブックマークURLを取得（重複チェック）
    const urls = newItems.map(item => item.url)
    if (urls.length > 0) {
      const { data: existingBookmarks } = await client
        .from('bookmarks')
        .select('url')
        .eq('user_id', user.sub)
        .in('url', urls)

      const existingUrls = new Set((existingBookmarks ?? []).map((b: { url: string }) => b.url))

      const toInsert = newItems
        .filter(item => !existingUrls.has(item.url))
        .map(item => ({
          user_id: user.sub,
          url: item.url,
          title: item.title,
          description: item.description,
          rss_feed_id: feed.id
        }))

      if (toInsert.length > 0) {
        await client.from('bookmarks').insert(toInsert)
      }
    }

    // 成功: フィード更新
    await client
      .from('rss_feeds')
      .update({
        last_fetched_at: new Date().toISOString(),
        last_error: null,
        error_count: 0,
        title: parsed.title ?? feed.title,
        description: parsed.description ?? feed.description,
        site_url: parsed.siteUrl ?? feed.site_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    return {
      success: true,
      newArticles: newItems.length
    }
  } catch (error) {
    // 失敗: エラー記録（DB保存は500文字に制限）
    const rawMessage = error instanceof Error ? error.message : 'Unknown error'
    const dbErrorMessage = rawMessage.slice(0, 500)
    const newErrorCount = feed.error_count + 1

    await client
      .from('rss_feeds')
      .update({
        last_error: dbErrorMessage,
        error_count: newErrorCount,
        is_active: newErrorCount < 3,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to sync feed'
    })
  }
})
