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
