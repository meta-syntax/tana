import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database, RssFeedRow } from '~/types'

const BATCH_SIZE = 5

export default defineEventHandler(async (event): Promise<{ synced: number, errors: number }> => {
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
          await syncFeed(admin, feed)
          return true
        } catch (error) {
          await recordSyncError(admin, feed, error)
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
