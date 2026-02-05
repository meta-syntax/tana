import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockToastAdd = vi.fn()
const mockFetch = vi.fn()

mockNuxtImport('useToast', () => {
  return () => ({ add: mockToastAdd })
})

mockNuxtImport('useSupabaseClient', () => {
  return () => ({
    from: () => ({
      update: () => ({
        eq: () => ({ error: null })
      })
    })
  })
})

// $fetchをグローバルにモック
vi.stubGlobal('$fetch', mockFetch)

describe('useFeedMutations', () => {
  let mockRefreshFeeds: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockToastAdd.mockClear()
    mockFetch.mockClear()
    mockRefreshFeeds = vi.fn()
  })

  describe('addFeed', () => {
    it('成功時に RssFeed を返し成功トーストを表示する', async () => {
      const mockFeedData = { id: 'feed-1', url: 'https://example.com/rss', title: 'Example' }
      mockFetch.mockResolvedValue(mockFeedData)

      const { useFeedMutations } = await import('./use-feed-mutations')
      const { addFeed } = useFeedMutations({ refreshFeeds: mockRefreshFeeds })

      const result = await addFeed({ url: 'https://example.com/rss' })
      expect(result).toEqual(mockFeedData)
      expect(mockRefreshFeeds).toHaveBeenCalled()
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'success' })
      )
    })

    it('エラー時に null を返しエラートーストを表示する', async () => {
      mockFetch.mockRejectedValue(new Error('Failed'))

      const { useFeedMutations } = await import('./use-feed-mutations')
      const { addFeed } = useFeedMutations({ refreshFeeds: mockRefreshFeeds })

      const result = await addFeed({ url: 'https://invalid.com/rss' })
      expect(result).toBeNull()
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'error' })
      )
    })
  })

  describe('deleteFeed', () => {
    it('成功時に true を返し成功トーストを表示する', async () => {
      mockFetch.mockResolvedValue({ success: true })

      const { useFeedMutations } = await import('./use-feed-mutations')
      const { deleteFeed } = useFeedMutations({ refreshFeeds: mockRefreshFeeds })

      const result = await deleteFeed('feed-1')
      expect(result).toBe(true)
      expect(mockRefreshFeeds).toHaveBeenCalled()
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'success' })
      )
    })

    it('エラー時に false を返しエラートーストを表示する', async () => {
      mockFetch.mockRejectedValue(new Error('Failed'))

      const { useFeedMutations } = await import('./use-feed-mutations')
      const { deleteFeed } = useFeedMutations({ refreshFeeds: mockRefreshFeeds })

      const result = await deleteFeed('feed-1')
      expect(result).toBe(false)
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'error' })
      )
    })
  })

  describe('syncFeed', () => {
    it('成功時に true を返し新着件数を含む成功トーストを表示する', async () => {
      mockFetch.mockResolvedValue({ success: true, newArticles: 5 })

      const { useFeedMutations } = await import('./use-feed-mutations')
      const { syncFeed } = useFeedMutations({ refreshFeeds: mockRefreshFeeds })

      const result = await syncFeed('feed-1')
      expect(result).toBe(true)
      expect(mockRefreshFeeds).toHaveBeenCalled()
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          description: '5件の新着記事を取得しました'
        })
      )
    })

    it('エラー時に false を返しエラートーストを表示する', async () => {
      mockFetch.mockRejectedValue(new Error('Sync failed'))

      const { useFeedMutations } = await import('./use-feed-mutations')
      const { syncFeed } = useFeedMutations({ refreshFeeds: mockRefreshFeeds })

      const result = await syncFeed('feed-1')
      expect(result).toBe(false)
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'error' })
      )
    })
  })
})
