import type { Bookmark, BookmarkInput, BookmarkSort, Database } from '~/types'

export const useBookmarks = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const toast = useToast()

  // ページネーション・検索・ソート状態
  const page = ref(1)
  const { perPage } = usePerPage()
  const searchQuery = ref('')
  const sort = ref<BookmarkSort>({ field: 'created_at', order: 'desc' })

  // perPage変更時にページを1にリセット
  watch(perPage, () => {
    page.value = 1
  })

  // ブックマーク取得（サーバーサイドページネーション + 検索 + ソート）
  // totalCountもペイロードに含めるため、itemsとtotalをまとめて返す
  const { data: bookmarkData, status, refresh: refreshBookmarks } = useLazyAsyncData(
    'bookmarks',
    async () => {
      if (!user.value?.sub) return { items: [] as Bookmark[], total: 0 }

      const from = (page.value - 1) * perPage.value
      const to = from + perPage.value - 1

      let query = supabase
        .from('bookmarks')
        .select('*', { count: 'exact' })

      // 検索
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.trim().replace(/[%_]/g, '\\$&')
        query = query.or(`title.ilike.%${q}%,url.ilike.%${q}%,description.ilike.%${q}%`)
      }

      // ソート
      query = query.order(sort.value.field, { ascending: sort.value.order === 'asc' })

      // ページネーション
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('Failed to fetch bookmarks:', error)
        throw error
      }

      return { items: (data ?? []) as Bookmark[], total: count ?? 0 }
    },
    {
      default: () => ({ items: [] as Bookmark[], total: 0 }),
      watch: [user, page, perPage, sort]
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

  const addBookmark = async (input: BookmarkInput): Promise<boolean> => {
    if (!user.value?.sub) return false

    // 楽観的にローカルへ追加（仮ID）
    const optimisticBookmark = {
      id: crypto.randomUUID(),
      user_id: user.value.sub,
      url: input.url,
      title: input.title || null,
      description: input.description || null,
      thumbnail_url: input.thumbnail_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Bookmark
    bookmarks.value = [optimisticBookmark, ...bookmarks.value]

    const { error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.value.sub,
        url: input.url,
        title: input.title || null,
        description: input.description || null,
        thumbnail_url: input.thumbnail_url || null
      })

    if (error) {
      // ロールバック
      bookmarks.value = bookmarks.value.filter(b => b.id !== optimisticBookmark.id)
      console.error('Failed to add bookmark:', error)
      toast.add({
        title: 'エラー',
        description: 'ブックマークの追加に失敗しました',
        color: 'error'
      })
      return false
    }

    // サーバーの正式なIDに同期
    await Promise.all([refreshBookmarks(), refreshStats()])

    toast.add({
      title: '追加完了',
      description: 'ブックマークを追加しました',
      color: 'success'
    })

    return true
  }

  const updateBookmark = async (id: string, input: Partial<BookmarkInput>): Promise<boolean> => {
    if (!user.value?.sub) return false

    // スナップショット保存
    const snapshot = [...bookmarks.value]

    // 楽観的にローカルを更新
    bookmarks.value = bookmarks.value.map(b =>
      b.id === id
        ? { ...b, ...input, updated_at: new Date().toISOString() }
        : b
    )

    const { error } = await supabase
      .from('bookmarks')
      .update({
        url: input.url,
        title: input.title,
        description: input.description,
        thumbnail_url: input.thumbnail_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      // ロールバック
      bookmarks.value = snapshot
      console.error('Failed to update bookmark:', error)
      toast.add({
        title: 'エラー',
        description: 'ブックマークの更新に失敗しました',
        color: 'error'
      })
      return false
    }

    await refreshBookmarks()

    toast.add({
      title: '更新完了',
      description: 'ブックマークを更新しました',
      color: 'success'
    })

    return true
  }

  const deleteBookmark = async (id: string): Promise<boolean> => {
    if (!user.value?.sub) return false

    // スナップショット保存
    const snapshot = [...bookmarks.value]

    // 楽観的にローカルから削除
    bookmarks.value = bookmarks.value.filter(b => b.id !== id)

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      // ロールバック
      bookmarks.value = snapshot
      console.error('Failed to delete bookmark:', error)
      toast.add({
        title: 'エラー',
        description: 'ブックマークの削除に失敗しました',
        color: 'error'
      })
      return false
    }

    // 現在ページが空になったら前ページへ戻る
    if (bookmarks.value.length === 0 && page.value > 1) {
      page.value -= 1
    }

    await Promise.all([refreshBookmarks(), refreshStats()])

    toast.add({
      title: '削除完了',
      description: 'ブックマークを削除しました',
      color: 'success'
    })

    return true
  }

  return {
    bookmarks,
    loading,
    stats,
    page,
    perPage,
    totalCount,
    sort,
    search,
    changeSort,
    changePage,
    refreshBookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark
  }
}
