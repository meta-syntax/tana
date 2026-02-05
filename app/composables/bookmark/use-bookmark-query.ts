import type { SupabaseClient } from '@supabase/supabase-js'
import type { Bookmark, BookmarkSort, BookmarkWithJoinedTags, Database, Tag } from '~/types'

interface UseBookmarkQueryOptions {
  supabase: SupabaseClient<Database>
  user: ReturnType<typeof useSupabaseUser>
  page: Ref<number>
  perPage: Readonly<Ref<number>>
  searchQuery: Ref<string>
  sort: Ref<BookmarkSort>
  selectedTagIds: Ref<string[]>
}

/** JOINレスポンスからtagsをフラット化してBookmark型に変換 */
const flattenBookmarkTags = (rows: BookmarkWithJoinedTags[]): Bookmark[] => {
  return rows.map((row) => {
    const tags = (row.bookmark_tags ?? [])
      .map(bt => bt.tags)
      .filter((t): t is Tag => t !== null)
    const { bookmark_tags: _, ...rest } = row
    return { ...rest, tags }
  })
}

export const useBookmarkQuery = (options: UseBookmarkQueryOptions) => {
  const { supabase, user, page, perPage, searchQuery, sort, selectedTagIds } = options

  const { data: bookmarkData, status, refresh: refreshBookmarks } = useLazyAsyncData(
    'bookmarks',
    async () => {
      if (!user.value?.sub) return { items: [] as Bookmark[], total: 0 }

      // タグフィルター: 選択タグがある場合、対象ブックマークIDを先に取得
      let filteredBookmarkIds: string[] | null = null
      if (selectedTagIds.value.length > 0) {
        const { data: btData, error: btError } = await supabase
          .from('bookmark_tags')
          .select('bookmark_id')
          .in('tag_id', selectedTagIds.value)

        if (btError) {
          console.error('Failed to filter by tags:', btError)
          throw btError
        }

        filteredBookmarkIds = [...new Set((btData ?? []).map(row => row.bookmark_id))]
        if (filteredBookmarkIds.length === 0) {
          return { items: [] as Bookmark[], total: 0 }
        }
      }

      const from = (page.value - 1) * perPage.value
      const to = from + perPage.value - 1

      let query = supabase
        .from('bookmarks')
        .select('*, bookmark_tags(tag_id, tags(*))', { count: 'exact' })

      // タグフィルター
      if (filteredBookmarkIds) {
        query = query.in('id', filteredBookmarkIds)
      }

      // 検索
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.trim().replace(/[%_]/g, '\\$&')
        query = query.or(`title.ilike.%${q}%,url.ilike.%${q}%,description.ilike.%${q}%`)
      }

      // ソート（sort_orderは常にASC固定）
      if (sort.value.field === 'sort_order') {
        query = query.order('sort_order', { ascending: true })
      } else {
        query = query.order(sort.value.field, { ascending: sort.value.order === 'asc' })
      }

      // ページネーション
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to fetch bookmarks:', error)
        throw error
      }

      const items = flattenBookmarkTags((data ?? []) as BookmarkWithJoinedTags[])

      return { items, total: count ?? 0 }
    },
    {
      default: () => ({ items: [] as Bookmark[], total: 0 }),
      watch: [user, page, perPage, sort, selectedTagIds]
    }
  )

  // ペイロードから復元される computed
  const bookmarks = computed({
    get: () => bookmarkData.value.items,
    set: (val) => { bookmarkData.value = { ...bookmarkData.value, items: val } }
  })
  const totalCount = computed(() => bookmarkData.value.total)

  // ローディング状態
  const loading = computed(() => status.value === 'pending')

  // 統計情報（軽量取得）
  const { data: stats, refresh: refreshStats } = useLazyAsyncData(
    'bookmark-stats',
    async () => {
      if (!user.value?.sub) return { total: 0, thisWeek: 0 }

      // 総件数
      const { count: total } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })

      // 今週の追加数
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const { count: thisWeek } = await supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString())

      return { total: total ?? 0, thisWeek: thisWeek ?? 0 }
    },
    {
      default: () => ({ total: 0, thisWeek: 0 }),
      watch: [user]
    }
  )

  return {
    bookmarks,
    totalCount,
    loading,
    stats,
    refreshBookmarks,
    refreshStats
  }
}
