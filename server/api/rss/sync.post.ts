import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database, RssFeedRow } from '~/types'

const BATCH_SIZE = 5

export default defineEventHandler(async (event) => {
  // CRON_SECRET認証
  const cronSecret = process.env.CRON_SECRET
  const authHeader = getHeader(event, 'authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const admin = serverSupabaseServiceRole<Database>(event)

  // アクティブな全フィードを取得
  const { data: feeds, error: feedsError } = await admin
    .from('rss_feeds')
    .select('*')
    .eq('is_active', true)

  if (feedsError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch feeds' })
  }

  if (!feeds || feeds.length === 0) {
    return { synced: 0, errors: 0 }
  }

  let syncedCount = 0
  let errorCount = 0

  // バッチ処理（5件ずつ並列）
  for (let i = 0; i < feeds.length; i += BATCH_SIZE) {
    const batch = feeds.slice(i, i + BATCH_SIZE)

    const results = await Promise.allSettled(
      batch.map(async (feed: RssFeedRow) => {
        try {
          const parsed = await parseFeed(feed.url)

          // last_fetched_at以降の記事をフィルター
          const newItems = feed.last_fetched_at
            ? parsed.items.filter(item =>
                item.publishedAt && new Date(item.publishedAt) > new Date(feed.last_fetched_at!))
            : parsed.items

          // 既存ブックマークURLで重複チェック
          const urls = newItems.map(item => item.url)
          if (urls.length > 0) {
            const { data: existingBookmarks } = await admin
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
              await admin.from('bookmarks').insert(toInsert)
            }
          }

          // 成功: フィード更新
          await admin
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

          return true
        } catch (error) {
          // 失敗: エラー記録（DB保存は500文字に制限）
          const rawMessage = error instanceof Error ? error.message : 'Unknown error'
          const dbErrorMessage = rawMessage.slice(0, 500)
          const newErrorCount = feed.error_count + 1

          await admin
            .from('rss_feeds')
            .update({
              last_error: dbErrorMessage,
              error_count: newErrorCount,
              is_active: newErrorCount < 3,
              updated_at: new Date().toISOString()
            })
            .eq('id', feed.id)

          throw error
        }
      })
    )

    for (const result of results) {
      if (result.status === 'fulfilled') {
        syncedCount++
      } else {
        errorCount++
      }
    }
  }

  return { synced: syncedCount, errors: errorCount }
})
