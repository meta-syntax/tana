import type { RssFeed, RssFeedInput } from '~/types'

interface UseFeedMutationsOptions {
  refreshFeeds: () => Promise<void>
}

/** $fetch エラーからユーザー向けメッセージを抽出 */
const getFetchErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'statusMessage' in error) {
    return (error as { statusMessage: string }).statusMessage
  }
  return fallback
}

export const useFeedMutations = (options: UseFeedMutationsOptions) => {
  const { refreshFeeds } = options
  const toast = useToast()

  const addFeed = async (input: RssFeedInput): Promise<RssFeed | null> => {
    try {
      const data = await $fetch<RssFeed>('/api/rss', {
        method: 'POST',
        body: { url: input.url }
      })

      await refreshFeeds()
      toast.add({
        title: '追加完了',
        description: 'RSSフィードを追加しました',
        color: 'success'
      })
      return data
    } catch (error) {
      const message = getFetchErrorMessage(error, 'フィードの追加に失敗しました')
      toast.add({
        title: 'エラー',
        description: message,
        color: 'error'
      })
      return null
    }
  }

  const deleteFeed = async (id: string): Promise<boolean> => {
    try {
      await $fetch(`/api/rss/${id}`, { method: 'DELETE' })

      await refreshFeeds()
      toast.add({
        title: '削除完了',
        description: 'フィードを削除しました（ブックマークは残ります）',
        color: 'success'
      })
      return true
    } catch {
      toast.add({
        title: 'エラー',
        description: 'フィードの削除に失敗しました',
        color: 'error'
      })
      return false
    }
  }

  const syncFeed = async (id: string): Promise<boolean> => {
    try {
      const result = await $fetch<{ success: boolean, newArticles: number }>(`/api/rss/${id}/sync`, {
        method: 'POST'
      })

      await refreshFeeds()
      toast.add({
        title: '同期完了',
        description: `${result.newArticles}件の新着記事を取得しました`,
        color: 'success'
      })
      return true
    } catch {
      toast.add({
        title: 'エラー',
        description: 'フィードの同期に失敗しました',
        color: 'error'
      })
      return false
    }
  }

  const toggleFeedActive = async (feed: RssFeed): Promise<boolean> => {
    try {
      const result = await $fetch<{ success: boolean, is_active: boolean }>(`/api/rss/${feed.id}/toggle`, {
        method: 'PATCH'
      })

      await refreshFeeds()
      toast.add({
        title: result.is_active ? '再開しました' : '一時停止しました',
        description: result.is_active ? 'フィードの同期を再開しました' : 'フィードの同期を一時停止しました',
        color: 'success'
      })
      return true
    } catch {
      toast.add({
        title: 'エラー',
        description: 'フィードの状態変更に失敗しました',
        color: 'error'
      })
      return false
    }
  }

  return {
    addFeed,
    deleteFeed,
    syncFeed,
    toggleFeedActive
  }
}
