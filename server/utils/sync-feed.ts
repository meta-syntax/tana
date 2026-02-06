import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, RssFeedRow } from '~/types'

interface SyncResult {
  newArticles: number
}

export const syncFeed = async (
  client: SupabaseClient<Database>,
  feed: RssFeedRow
): Promise<SyncResult> => {
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
      .eq('user_id', feed.user_id)
      .in('url', urls)

    const existingUrls = new Set((existingBookmarks ?? []).map((b: { url: string }) => b.url))

    const toInsert = newItems
      .filter(item => !existingUrls.has(item.url))
      .map(item => ({
        user_id: feed.user_id,
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
    .eq('id', feed.id)

  return { newArticles: newItems.length }
}

export const recordSyncError = async (
  client: SupabaseClient<Database>,
  feed: RssFeedRow,
  error: unknown
): Promise<number> => {
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
    .eq('id', feed.id)

  return newErrorCount
}
