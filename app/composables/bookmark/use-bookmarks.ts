import type { BookmarkSort, Database } from '~/types'

export const useBookmarks = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // フィルター状態
  const page = ref(1)
  const { perPage } = usePerPage()
  const searchQuery = ref('')
  const { sort } = useSort()
  const selectedTagIds = ref<string[]>([])

  // perPage変更時にページを1にリセット
  watch(perPage, () => {
    page.value = 1
  })

  // クエリ
  const { bookmarks, totalCount, loading, stats, refreshBookmarks, refreshStats }
    = useBookmarkQuery({ supabase, user, page, perPage, searchQuery, sort, selectedTagIds })

  // ミューテーション
  const { addBookmark, updateBookmark, deleteBookmark, bulkDeleteBookmarks, isReordering, reorderBookmarks }
    = useBookmarkMutations({ supabase, user, bookmarks, page, refreshBookmarks, refreshStats })

  // ドラッグ有効条件: sort_order && 検索なし && タグフィルターなし
  const isDragEnabled = computed(() =>
    sort.value.field === 'sort_order'
    && !searchQuery.value.trim()
    && selectedTagIds.value.length === 0
  )

  // 検索実行（page=1にリセット + refresh）
  const search = (query: string) => {
    searchQuery.value = query
    page.value = 1
    refreshBookmarks()
  }

  // ソート変更
  const changeSort = (newSort: BookmarkSort) => {
    sort.value = newSort
    page.value = 1
  }

  // ページ変更
  const changePage = (newPage: number) => {
    page.value = newPage
  }

  // タグフィルター変更
  const filterByTags = (tagIds: string[]) => {
    selectedTagIds.value = tagIds
    page.value = 1
  }

  return {
    bookmarks,
    loading,
    stats,
    page,
    perPage,
    totalCount,
    sort,
    selectedTagIds,
    isDragEnabled,
    isReordering,
    search,
    changeSort,
    changePage,
    filterByTags,
    refreshBookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    bulkDeleteBookmarks,
    reorderBookmarks
  }
}
