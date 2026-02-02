import type { Database, Bookmark, BookmarkInput } from '~/types'

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
      console.error('Failed to add bookmark:', error)
      toast.add({
        title: 'エラー',
        description: 'ブックマークの追加に失敗しました',
        color: 'error'
      })
      return false
    }

    // キャッシュを再取得
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
      console.error('Failed to update bookmark:', error)
      toast.add({
        title: 'エラー',
        description: 'ブックマークの更新に失敗しました',
        color: 'error'
      })
      return false
    }

    // キャッシュを再取得
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

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete bookmark:', error)
      toast.add({
        title: 'エラー',
        description: 'ブックマークの削除に失敗しました',
        color: 'error'
      })
      return false
    }

    // キャッシュを再取得
    await refreshBookmarks()

    toast.add({
      title: '削除完了',
      description: 'ブックマークを削除しました',
      color: 'success'
    })

    return true
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
    refreshBookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark
  }
}
