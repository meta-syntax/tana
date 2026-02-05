// Database types (Supabase)
export type { Database, Json } from './database.types'
export type { BookmarkRow, BookmarkInsert, BookmarkUpdate, TagRow, TagInsert, TagUpdate, BookmarkTagRow } from './database-helpers'

// Domain types
export type { Bookmark, BookmarkInput, BookmarkWithJoinedTags, CardSize, PerPage, SortField, SortOrder, BookmarkSort } from './bookmark'

// Tag types
export type { Tag, TagInput, TagRowWithCountJoin, TagWithCount } from './tag'

// OGP types
export interface OgpData {
  title: string | null
  description: string | null
  image: string | null
}
