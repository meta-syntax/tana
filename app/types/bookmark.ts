import type { BookmarkRow } from './database.types'

/** ブックマーク型（DBから取得した完全なデータ） */
export type Bookmark = BookmarkRow

/** ブックマーク作成/更新時のフォーム入力型 */
export interface BookmarkInput {
  url: string
  title?: string | null
  description?: string | null
  thumbnail_url?: string | null
}

/** カードサイズ */
export type CardSize = 'large' | 'medium' | 'small'

/** 1ページあたりの表示件数 */
export type PerPage = 12 | 24 | 48

/** ソート対象フィールド */
export type SortField = 'created_at' | 'title' | 'url'

/** ソート順 */
export type SortOrder = 'asc' | 'desc'

/** ソート設定 */
export interface BookmarkSort {
  field: SortField
  order: SortOrder
}
