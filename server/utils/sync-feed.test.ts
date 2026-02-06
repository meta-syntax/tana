import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockCreateError = vi.fn((opts: { statusCode: number, statusMessage: string }) => {
  const error = new Error(opts.statusMessage) as Error & { statusCode: number, statusMessage: string }
  error.statusCode = opts.statusCode
  error.statusMessage = opts.statusMessage
  return error
})
vi.stubGlobal('createError', mockCreateError)

const mockParseFeed = vi.fn()
vi.stubGlobal('parseFeed', mockParseFeed)

// Supabaseクライアントのモック
const mockBookmarksInsert = vi.fn().mockResolvedValue({ data: null, error: null })
const mockRssFeedsUpdateEq = vi.fn().mockResolvedValue({ data: null, error: null })
const mockRssFeedsUpdate = vi.fn(() => ({ eq: mockRssFeedsUpdateEq }))

const createMockClient = (existingBookmarks: { url: string }[] = []) => ({
  from: vi.fn((table: string) => {
    if (table === 'bookmarks') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            in: vi.fn().mockResolvedValue({ data: existingBookmarks, error: null })
          }))
        })),
        insert: mockBookmarksInsert
      }
    }
    return { update: mockRssFeedsUpdate }
  })
})

const baseFeed = {
  id: 'feed-1',
  user_id: 'user-1',
  url: 'https://example.com/feed.xml',
  title: 'Test Feed',
  description: 'A test feed',
  site_url: 'https://example.com',
  is_active: true,
  error_count: 0,
  last_error: null,
  last_fetched_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
} as const

describe('syncFeed', () => {
  beforeEach(() => {
    mockParseFeed.mockReset()
    mockBookmarksInsert.mockReset().mockResolvedValue({ data: null, error: null })
    mockRssFeedsUpdate.mockClear()
    mockRssFeedsUpdateEq.mockClear().mockResolvedValue({ data: null, error: null })
  })

  it('parseFeedをフィードURLで呼び出す', async () => {
    mockParseFeed.mockResolvedValue({ title: 'T', description: null, siteUrl: null, items: [] })
    const client = createMockClient()

    const { syncFeed } = await import('./sync-feed')
    await syncFeed(client as any, baseFeed)

    expect(mockParseFeed).toHaveBeenCalledWith('https://example.com/feed.xml')
  })

  it('last_fetched_atがnullの場合、全アイテムを対象にする', async () => {
    mockParseFeed.mockResolvedValue({
      title: 'T', description: null, siteUrl: null,
      items: [
        { title: 'A1', url: 'https://example.com/1', description: null, publishedAt: '2026-01-01T00:00:00Z' },
        { title: 'A2', url: 'https://example.com/2', description: null, publishedAt: '2026-01-02T00:00:00Z' }
      ]
    })
    const client = createMockClient()

    const { syncFeed } = await import('./sync-feed')
    const result = await syncFeed(client as any, { ...baseFeed, last_fetched_at: null })

    expect(result.newArticles).toBe(2)
  })

  it('last_fetched_at以降の記事のみフィルターする', async () => {
    mockParseFeed.mockResolvedValue({
      title: 'T', description: null, siteUrl: null,
      items: [
        { title: 'Old', url: 'https://example.com/old', description: null, publishedAt: '2026-01-01T00:00:00Z' },
        { title: 'New', url: 'https://example.com/new', description: null, publishedAt: '2026-01-10T00:00:00Z' }
      ]
    })
    const client = createMockClient()

    const { syncFeed } = await import('./sync-feed')
    const result = await syncFeed(client as any, { ...baseFeed, last_fetched_at: '2026-01-05T00:00:00Z' })

    expect(result.newArticles).toBe(1)
  })

  it('既存ブックマークと重複するURLは挿入しない', async () => {
    mockParseFeed.mockResolvedValue({
      title: 'T', description: null, siteUrl: null,
      items: [
        { title: 'Existing', url: 'https://example.com/exists', description: null, publishedAt: null },
        { title: 'New', url: 'https://example.com/new', description: 'desc', publishedAt: null }
      ]
    })
    const client = createMockClient([{ url: 'https://example.com/exists' }])

    const { syncFeed } = await import('./sync-feed')
    await syncFeed(client as any, baseFeed)

    expect(mockBookmarksInsert).toHaveBeenCalledWith([
      {
        user_id: 'user-1',
        url: 'https://example.com/new',
        title: 'New',
        description: 'desc',
        rss_feed_id: 'feed-1'
      }
    ])
  })

  it('新規アイテムがない場合insertを呼ばない', async () => {
    mockParseFeed.mockResolvedValue({
      title: 'T', description: null, siteUrl: null,
      items: []
    })
    const client = createMockClient()

    const { syncFeed } = await import('./sync-feed')
    await syncFeed(client as any, baseFeed)

    expect(mockBookmarksInsert).not.toHaveBeenCalled()
  })

  it('成功時にフィードメタ情報を更新する', async () => {
    mockParseFeed.mockResolvedValue({
      title: 'Updated Title', description: 'Updated Desc', siteUrl: 'https://updated.com',
      items: []
    })
    const client = createMockClient()

    const { syncFeed } = await import('./sync-feed')
    await syncFeed(client as any, baseFeed)

    expect(mockRssFeedsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        last_error: null,
        error_count: 0,
        title: 'Updated Title',
        description: 'Updated Desc',
        site_url: 'https://updated.com'
      })
    )
  })

  it('parsedのメタ情報がnullの場合、既存の値を保持する', async () => {
    mockParseFeed.mockResolvedValue({
      title: null, description: null, siteUrl: null,
      items: []
    })
    const client = createMockClient()

    const { syncFeed } = await import('./sync-feed')
    await syncFeed(client as any, baseFeed)

    expect(mockRssFeedsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Feed',
        description: 'A test feed',
        site_url: 'https://example.com'
      })
    )
  })
})

describe('recordSyncError', () => {
  beforeEach(() => {
    mockRssFeedsUpdate.mockClear()
    mockRssFeedsUpdateEq.mockClear().mockResolvedValue({ data: null, error: null })
  })

  it('Errorオブジェクトのメッセージを記録する', async () => {
    const client = createMockClient()

    const { recordSyncError } = await import('./sync-feed')
    await recordSyncError(client as any, baseFeed, new Error('Connection failed'))

    expect(mockRssFeedsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ last_error: 'Connection failed' })
    )
  })

  it('非Errorオブジェクトの場合 "Unknown error" を記録する', async () => {
    const client = createMockClient()

    const { recordSyncError } = await import('./sync-feed')
    await recordSyncError(client as any, baseFeed, 'string error')

    expect(mockRssFeedsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ last_error: 'Unknown error' })
    )
  })

  it('エラーメッセージを500文字に制限する', async () => {
    const client = createMockClient()
    const longMessage = 'x'.repeat(600)

    const { recordSyncError } = await import('./sync-feed')
    await recordSyncError(client as any, baseFeed, new Error(longMessage))

    expect(mockRssFeedsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ last_error: 'x'.repeat(500) })
    )
  })

  it('error_countをインクリメントする', async () => {
    const client = createMockClient()

    const { recordSyncError } = await import('./sync-feed')
    const count = await recordSyncError(client as any, { ...baseFeed, error_count: 1 }, new Error('fail'))

    expect(count).toBe(2)
    expect(mockRssFeedsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ error_count: 2 })
    )
  })

  it('error_countが3未満の場合 is_active を true に保つ', async () => {
    const client = createMockClient()

    const { recordSyncError } = await import('./sync-feed')
    await recordSyncError(client as any, { ...baseFeed, error_count: 1 }, new Error('fail'))

    expect(mockRssFeedsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: true })
    )
  })

  it('error_countが3以上になる場合 is_active を false にする', async () => {
    const client = createMockClient()

    const { recordSyncError } = await import('./sync-feed')
    await recordSyncError(client as any, { ...baseFeed, error_count: 2 }, new Error('fail'))

    expect(mockRssFeedsUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: false, error_count: 3 })
    )
  })
})
