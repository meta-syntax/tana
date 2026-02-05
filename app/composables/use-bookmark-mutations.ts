import type { SupabaseClient } from '@supabase/supabase-js'
import type { Bookmark, BookmarkInput, Database } from '~/types'

interface UseBookmarkMutationsOptions {
  supabase: SupabaseClient<Database>
  user: ReturnType<typeof useSupabaseUser>
  bookmarks: WritableComputedRef<Bookmark[]>
  page: Ref<number>
  refreshBookmarks: () => Promise<void>
  refreshStats: () => Promise<void>
}

export function useBookmarkMutations(options: UseBookmarkMutationsOptions) {
  const { supabase, user, bookmarks, page, refreshBookmarks, refreshStats } = options
  const toast = useToast()

  const addBookmark = async (input: BookmarkInput): Promise<{ success: boolean, id: string | null }> => {
    if (!user.value?.sub) return { success: false, id: null }

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

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.value.sub,
        url: input.url,
        title: input.title || null,
        description: input.description || null,
        thumbnail_url: input.thumbnail_url || null
      })
      .select('id')
      .single()

    if (error) {
      // ロールバック
      bookmarks.value = bookmarks.value.filter(b => b.id !== optimisticBookmark.id)
      console.error('Failed to add bookmark:', error)
      toast.add({
        title: 'エラー',
        description: 'ブックマークの追加に失敗しました',
        color: 'error'
      })
      return { success: false, id: null }
    }

    // サーバーの正式なIDに同期
    await Promise.all([refreshBookmarks(), refreshStats()])

    toast.add({
      title: '追加完了',
      description: 'ブックマークを追加しました',
      color: 'success'
    })

    return { success: true, id: data.id }
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
    addBookmark,
    updateBookmark,
    deleteBookmark
  }
}
