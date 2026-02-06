import { beforeEach, describe, expect, it, vi } from 'vitest'

// Nitro auto-import のグローバルスタブ
const mockCreateError = vi.fn((opts: { statusCode: number, statusMessage: string }) => {
  const error = new Error(opts.statusMessage) as Error & { statusCode: number, statusMessage: string }
  error.statusCode = opts.statusCode
  error.statusMessage = opts.statusMessage
  return error
})
const mockDefineEventHandler = vi.fn((handler: (...args: any[]) => any) => handler)
const mockRequireAuth = vi.fn()
const mockRequireRouteParam = vi.fn()
const mockSyncFeed = vi.fn()
const mockRecordSyncError = vi.fn()

vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('requireAuth', mockRequireAuth)
vi.stubGlobal('requireRouteParam', mockRequireRouteParam)
vi.stubGlobal('syncFeed', mockSyncFeed)
vi.stubGlobal('recordSyncError', mockRecordSyncError)

// Supabase クライアントのモック
const mockServerSupabaseClient = vi.fn()
vi.mock('#supabase/server', () => ({
  serverSupabaseClient: mockServerSupabaseClient
}))

// チェーン可能な Supabase クエリモック（thenable）
const createMockQueryChain = (result: any) => {
  const chain: any = {}
  for (const method of ['select', 'insert', 'update', 'delete', 'eq', 'in', 'order', 'single']) {
    chain[method] = vi.fn(() => chain)
  }
  chain.then = (resolve: any) => resolve(result)
  return chain
}

// Supabase クライアントオブジェクト（from を持つ、thenable ではない）
const createMockClient = (...chainResults: any[]) => {
  let callCount = 0
  const chains = chainResults.map(r => createMockQueryChain(r))
  return {
    from: vi.fn(() => {
      const chain = chains[callCount] || chains[chains.length - 1]!
      callCount++
      return chain
    }),
    _chains: chains
  }
}

const createMockEvent = () => ({}) as any

describe('RSS フィード個別同期 API (POST /api/rss/[id]/sync)', () => {
  let handler: (event: any) => Promise<any>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue('user-123')
    mockRequireRouteParam.mockReturnValue('feed-1')

    const mod = await import('./sync.post')
    handler = mod.default as any
  })

  it('フィードが見つからない場合 404 を返す', async () => {
    const client = createMockClient({ data: null, error: { message: 'not found' } })
    mockServerSupabaseClient.mockResolvedValue(client)

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Feed not found'
    })
  })

  it('syncFeed成功時に新規記事数を返す', async () => {
    const feedData = { id: 'feed-1', url: 'https://example.com/feed', title: 'Test Feed' }
    const client = createMockClient({ data: feedData, error: null })
    mockServerSupabaseClient.mockResolvedValue(client)
    mockSyncFeed.mockResolvedValue({ newArticles: 3 })

    const result = await handler(createMockEvent())

    expect(result).toEqual({ success: true, newArticles: 3 })
    expect(mockSyncFeed).toHaveBeenCalledWith(client, feedData)
  })

  it('syncFeed失敗時にrecordSyncErrorを呼び 502 を返す', async () => {
    const feedData = { id: 'feed-1', url: 'https://example.com/feed', title: 'Test Feed' }
    const client = createMockClient({ data: feedData, error: null })
    mockServerSupabaseClient.mockResolvedValue(client)

    const syncError = new Error('Sync failed')
    mockSyncFeed.mockRejectedValue(syncError)
    mockRecordSyncError.mockResolvedValue(undefined)

    try {
      await handler(createMockEvent())
      expect.fail('Should have thrown')
    } catch (e: any) {
      expect(e.statusCode).toBe(502)
      expect(e.statusMessage).toBe('Failed to sync feed')
    }

    expect(mockRecordSyncError).toHaveBeenCalledWith(client, feedData, syncError)
  })
})
