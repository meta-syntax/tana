import type { TagRow } from './database.types'

/** タグ型（DBから取得した完全なデータ） */
export type Tag = TagRow

/** Supabase select('*, bookmark_tags(count)') のレスポンス型 */
export type TagRowWithCountJoin = TagRow & {
  bookmark_tags: { count: number }[]
}

/** タグ作成/更新時の入力型 */
export interface TagInput {
  name: string
  color: string
}

/** タグ＋紐付けブックマーク件数 */
export type TagWithCount = Tag & { bookmark_count: number }
