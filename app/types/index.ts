// Database types (Supabase)
export type { Database, Json, BookmarkRow, BookmarkInsert, BookmarkUpdate } from './database.types'

// Domain types
export type { Bookmark, BookmarkInput, SortField, SortOrder, BookmarkSort } from './bookmark'

// OGP types
export interface OgpData {
  title: string | null
  description: string | null
  image: string | null
}
