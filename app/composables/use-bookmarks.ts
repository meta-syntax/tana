import type { Database, Bookmark, BookmarkInput } from '~/types'

export const useBookmarks = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const toast = useToast()

  const bookmarks = ref<Bookmark[]>([])
  const loading = ref(false)

  const fetchBookmarks = async () => {
    if (!user.value?.sub) return

    loading.value = true

    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    loading.value = false

    if (error) {
      console.error('Failed to fetch bookmarks:', error)
      toast.add({
        title: 'エラー',
        description: 'ブックマークの取得に失敗しました',
        color: 'error'
      })
      return
    }

    bookmarks.value = (data ?? []) as Bookmark[]
  }

  const addBookmark = async (input: BookmarkInput): Promise<boolean> => {
    if (!user.value?.sub) return false

    loading.value = true

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.value.sub,
        url: input.url,
        title: input.title || null,
        description: input.description || null,
        thumbnail_url: input.thumbnail_url || null
      })
      .select()
      .single()

    loading.value = false

    if (error) {
      console.error('Failed to add bookmark:', error)
      toast.add({
        title: 'エラー',
        description: 'ブックマークの追加に失敗しました',
        color: 'error'
      })
      return false
    }

    bookmarks.value.unshift(data as Bookmark)

    toast.add({
      title: '追加完了',
      description: 'ブックマークを追加しました',
      color: 'success'
    })

    return true
  }

  const updateBookmark = async (id: string, input: Partial<BookmarkInput>): Promise<boolean> => {
    if (!user.value?.sub) return false

    loading.value = true

    const { data, error } = await supabase
      .from('bookmarks')
      .update({
        url: input.url,
        title: input.title,
        description: input.description,
        thumbnail_url: input.thumbnail_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    loading.value = false

    if (error) {
      console.error('Failed to update bookmark:', error)
      toast.add({
        title: 'エラー',
        description: 'ブックマークの更新に失敗しました',
        color: 'error'
      })
      return false
    }

    const index = bookmarks.value.findIndex((b: Bookmark) => b.id === id)
    if (index !== -1) {
      bookmarks.value[index] = data as Bookmark
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

    loading.value = true

    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)

    loading.value = false

    if (error) {
      console.error('Failed to delete bookmark:', error)
      toast.add({
        title: 'エラー',
        description: 'ブックマークの削除に失敗しました',
        color: 'error'
      })
      return false
    }

    bookmarks.value = bookmarks.value.filter((b: Bookmark) => b.id !== id)

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
    fetchBookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark
  }
}
