// Database types (Supabase)
export type { Database, Json, BookmarkRow, BookmarkInsert, BookmarkUpdate, TagRow, TagInsert, TagUpdate, BookmarkTagRow } from './database.types'

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
