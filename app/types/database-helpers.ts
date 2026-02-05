import type { Database } from './database.types'

// Convenience type aliases for Supabase table rows
export type BookmarkRow = Database['public']['Tables']['bookmarks']['Row']
export type BookmarkInsert = Database['public']['Tables']['bookmarks']['Insert']
export type BookmarkUpdate = Database['public']['Tables']['bookmarks']['Update']
export type TagRow = Database['public']['Tables']['tags']['Row']
export type TagInsert = Database['public']['Tables']['tags']['Insert']
export type TagUpdate = Database['public']['Tables']['tags']['Update']
export type BookmarkTagRow = Database['public']['Tables']['bookmark_tags']['Row']
export type RssFeedRow = Database['public']['Tables']['rss_feeds']['Row']
export type RssFeedInsert = Database['public']['Tables']['rss_feeds']['Insert']
export type RssFeedUpdate = Database['public']['Tables']['rss_feeds']['Update']
