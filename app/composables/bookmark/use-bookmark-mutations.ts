import type { SupabaseClient } from '@supabase/supabase-js'
import type { Bookmark, BookmarkInput, Database, Json } from '~/types'

const SORT_ORDER_GAP = 1000
const MIN_GAP = 2

/** 前後のsort_orderから中間値を計算 */
const calcMidSortOrder = (prev: number | null, next: number | null): number => {
  const p = prev ?? 0
  const n = next ?? p + SORT_ORDER_GAP
  return Math.floor((p + n) / 2)
}

/** ページ内全アイテムを1000刻みで再付与 */
const rebuildSortOrders = (items: Bookmark[]): { id: string, sort_order: number }[] => {
  return items.map((item, index) => ({
    id: item.id,
    sort_order: (index + 1) * SORT_ORDER_GAP
  }))
}

interface UseBookmarkMutationsOptions {
  supabase: SupabaseClient<Database>
  user: ReturnType<typeof useSupabaseUser>
  bookmarks: WritableComputedRef<Bookmark[]>
  page: Ref<number>
  refreshBookmarks: () => Promise<void>
  refreshStats: () => Promise<void>
}

export const useBookmarkMutations = (options: UseBookmarkMutationsOptions) => {
  const { supabase, user, bookmarks, page, refreshBookmarks, refreshStats } = options
  const toast = useToast()

  const addBookmark = async (input: BookmarkInput): Promise<{ success: boolean, id: string | null }> => {
    if (!user.value?.sub) return { success: false, id: null }

    // 楽観的にローカルへ追加（仮ID）
    const optimisticBookmark: Bookmark = {
      id: crypto.randomUUID(),
      user_id: user.value.sub,
      url: input.url,
      title: input.title || null,
      description: input.description || null,
      thumbnail_url: input.thumbnail_url || null,
      rss_feed_id: null,
      sort_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    bookmarks.value = [optimisticBookmark, ...bookmarks.value]

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.value.sub,
        url: input.url,
        title: input.title || null,
        description: input.description || null,
        thumbnail_url: input.thumbnail_url || null,
        sort_order: 0
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

  // 並び替え
  const isReordering = ref(false)

  const reorderBookmarks = async (newList: Bookmark[], oldIndex: number, newIndex: number) => {
    if (isReordering.value) return
    if (!user.value?.sub) return

    isReordering.value = true
    const snapshot = [...bookmarks.value]

    // 楽観的UI更新
    bookmarks.value = newList

    try {
      const movedItem = newList[newIndex]
      if (!movedItem) return

      const prevItem = newIndex > 0 ? newList[newIndex - 1] : null
      const nextItem = newIndex < newList.length - 1 ? newList[newIndex + 1] : null

      const prevOrder = prevItem?.sort_order ?? null
      const nextOrder = nextItem?.sort_order ?? null
      const newSortOrder = calcMidSortOrder(prevOrder, nextOrder)

      // ギャップ枯渇チェック: 前後との差が最小ギャップ未満ならリバランス
      const needsRebalance
        = (prevOrder !== null && Math.abs(newSortOrder - prevOrder) < MIN_GAP)
          || (nextOrder !== null && Math.abs(nextOrder - newSortOrder) < MIN_GAP)

      let updates: { id: string, sort_order: number }[]

      if (needsRebalance) {
        updates = rebuildSortOrders(newList)
      } else {
        updates = [{ id: movedItem.id, sort_order: newSortOrder }]
      }

      const p_updates: Json = JSON.parse(JSON.stringify(updates))
      const { error } = await supabase.rpc('reorder_bookmarks', {
        p_user_id: user.value.sub,
        p_updates
      })

      if (error) throw error

      // ローカルのsort_orderも更新
      if (needsRebalance) {
        bookmarks.value = newList.map((b, i) => ({
          ...b,
          sort_order: (i + 1) * SORT_ORDER_GAP
        }))
      } else {
        bookmarks.value = newList.map(b =>
          b.id === movedItem.id ? { ...b, sort_order: newSortOrder } : b
        )
      }
    } catch (e) {
      console.error('Failed to reorder bookmarks:', e)
      bookmarks.value = snapshot
      toast.add({
        title: 'エラー',
        description: '並び替えに失敗しました',
        color: 'error'
      })
    } finally {
      isReordering.value = false
    }
  }

  return {
    addBookmark,
    updateBookmark,
    deleteBookmark,
    isReordering: readonly(isReordering),
    reorderBookmarks
  }
}
