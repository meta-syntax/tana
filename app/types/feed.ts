import type { RssFeedRow } from './database-helpers'

/** RSSフィード型（DBから取得した完全なデータ） */
export type RssFeed = RssFeedRow

/** フィード追加時の入力型 */
export interface RssFeedInput {
  url: string
}

/** フィードステータス */
export type FeedStatus = 'active' | 'error' | 'inactive'
