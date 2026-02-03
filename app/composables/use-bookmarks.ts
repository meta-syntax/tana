import type { Bookmark, BookmarkInput, Database } from '~/types'

export const useBookmarks = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const toast = useToast()

  // useLazyAsyncDataでSSR + CSR両方でフェッチ
  const { data: bookmarks, status, refresh: refreshBookmarks } = useLazyAsyncData(
    'bookmarks',
    async () => {
      if (!user.value?.sub) return []

      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch bookmarks:', error)
        throw error
      }

      return (data ?? []) as Bookmark[]
    },
    {
      default: () => [] as Bookmark[],
      watch: [user] // ユーザーが変わったら再フェッチ
    }
  )

  // ローディング状態
  const loading = computed(() => status.value === 'pending')

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
    await refreshBookmarks()

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

    toast.add({
      title: '削除完了',
      description: 'ブックマークを削除しました',
      color: 'success'
    })

    return true
  }

  // 検索フィルタリング
  const filterBookmarks = (query: string): Bookmark[] => {
    if (!query.trim()) return bookmarks.value

    const normalizedQuery = query.toLowerCase()
    return bookmarks.value.filter((bookmark) => {
      const title = bookmark.title?.toLowerCase() ?? ''
      const url = bookmark.url.toLowerCase()
      const description = bookmark.description?.toLowerCase() ?? ''
      return title.includes(normalizedQuery)
        || url.includes(normalizedQuery)
        || description.includes(normalizedQuery)
    })
  }

  // 統計情報を計算
  const stats = computed(() => {
    const total = bookmarks.value.length
    const pendingOgp = bookmarks.value.filter((b: Bookmark) => !b.thumbnail_url && !b.title).length

    // 今週の追加数を計算
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const thisWeek = bookmarks.value.filter((b: Bookmark) => b.created_at && new Date(b.created_at) >= oneWeekAgo).length

    return { total, pendingOgp, thisWeek }
  })

  return {
    bookmarks,
    loading,
    stats,
    filterBookmarks,
    refreshBookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark
  }
}
