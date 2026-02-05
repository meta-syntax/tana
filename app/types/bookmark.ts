import type { BookmarkRow } from './database-helpers'
import type { Tag } from './tag'

/** Supabase JOINクエリ bookmark_tags(tag_id, tags(*)) のレスポンス行型 */
export interface BookmarkTagJoinRow {
  tag_id: string
  tags: Tag | null
}

/** bookmarks + bookmark_tags JOIN クエリのレスポンス型 */
export type BookmarkWithJoinedTags = BookmarkRow & {
  bookmark_tags: BookmarkTagJoinRow[]
}

/** ブックマーク型（DBから取得した完全なデータ） */
export type Bookmark = BookmarkRow & {
  tags?: Tag[]
}

/** ブックマーク作成/更新時のフォーム入力型 */
export interface BookmarkInput {
  url: string
  title?: string | null
  description?: string | null
  thumbnail_url?: string | null
  tag_ids?: string[]
}

/** カードサイズ */
export type CardSize = 'large' | 'medium' | 'small'

/** 1ページあたりの表示件数 */
export type PerPage = 12 | 24 | 48

/** ソート対象フィールド */
export type SortField = 'created_at' | 'title' | 'url' | 'sort_order'

/** ソート順 */
export type SortOrder = 'asc' | 'desc'

/** ソート設定 */
export interface BookmarkSort {
  field: SortField
  order: SortOrder
}
