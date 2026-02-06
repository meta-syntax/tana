import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Nitro auto-import のグローバルスタブ
const mockCreateError = vi.fn((opts: { statusCode: number, statusMessage: string }) => {
  const error = new Error(opts.statusMessage) as Error & { statusCode: number, statusMessage: string }
  error.statusCode = opts.statusCode
  error.statusMessage = opts.statusMessage
  return error
})
const mockDefineEventHandler = vi.fn((handler: (...args: any[]) => any) => handler)
const mockGetHeader = vi.fn()
const mockSyncFeed = vi.fn()
const mockRecordSyncError = vi.fn()

vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('getHeader', mockGetHeader)
vi.stubGlobal('syncFeed', mockSyncFeed)
vi.stubGlobal('recordSyncError', mockRecordSyncError)

// Supabase クライアントのモック
const mockServerSupabaseServiceRole = vi.fn()
vi.mock('#supabase/server', () => ({
  serverSupabaseServiceRole: mockServerSupabaseServiceRole
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

describe('RSS 一括同期 API (POST /api/rss/sync)', () => {
  let handler: (event: any) => Promise<any>
  const originalEnv = process.env.CRON_SECRET

  beforeEach(async () => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = 'test-cron-secret'
    mockGetHeader.mockReturnValue('Bearer test-cron-secret')

    const mod = await import('./sync.post')
    handler = mod.default as any
  })

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.CRON_SECRET = originalEnv
    } else {
      delete process.env.CRON_SECRET
    }
  })

  it('CRON_SECRETが未設定の場合 401 を返す', async () => {
    process.env.CRON_SECRET = ''

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  })

  it('認証ヘッダーが不正の場合 401 を返す', async () => {
    mockGetHeader.mockReturnValue('Bearer wrong-secret')

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  })

  it('認証ヘッダーが存在しない場合 401 を返す', async () => {
    mockGetHeader.mockReturnValue(undefined)

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  })

  it('アクティブなフィードがない場合 synced:0, errors:0 を返す', async () => {
    const client = createMockClient({ data: [], error: null })
    mockServerSupabaseServiceRole.mockReturnValue(client)

    const result = await handler(createMockEvent())

    expect(result).toEqual({ synced: 0, errors: 0 })
  })

  it('フィードがnullの場合 synced:0, errors:0 を返す', async () => {
    const client = createMockClient({ data: null, error: null })
    mockServerSupabaseServiceRole.mockReturnValue(client)

    const result = await handler(createMockEvent())

    expect(result).toEqual({ synced: 0, errors: 0 })
  })

  it('フィード取得でDBエラーの場合 500 を返す', async () => {
    const client = createMockClient({ data: null, error: { message: 'DB error' } })
    mockServerSupabaseServiceRole.mockReturnValue(client)

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Failed to fetch feeds'
    })
  })

  it('全フィード同期成功時に正しいカウントを返す', async () => {
    const feeds = [
      { id: '1', url: 'https://example.com/feed1' },
      { id: '2', url: 'https://example.com/feed2' },
      { id: '3', url: 'https://example.com/feed3' }
    ]
    const client = createMockClient({ data: feeds, error: null })
    mockServerSupabaseServiceRole.mockReturnValue(client)
    mockSyncFeed.mockResolvedValue({ newArticles: 1 })

    const result = await handler(createMockEvent())

    expect(result).toEqual({ synced: 3, errors: 0 })
    expect(mockSyncFeed).toHaveBeenCalledTimes(3)
  })

  it('一部フィード同期失敗時にエラーカウントを正しく返す', async () => {
    const feeds = [
      { id: '1', url: 'https://example.com/feed1' },
      { id: '2', url: 'https://example.com/feed2' },
      { id: '3', url: 'https://example.com/feed3' }
    ]
    const client = createMockClient({ data: feeds, error: null })
    mockServerSupabaseServiceRole.mockReturnValue(client)

    // feed1: 成功, feed2: 失敗, feed3: 成功
    mockSyncFeed
      .mockResolvedValueOnce({ newArticles: 1 })
      .mockRejectedValueOnce(new Error('Sync failed'))
      .mockResolvedValueOnce({ newArticles: 2 })
    mockRecordSyncError.mockResolvedValue(undefined)

    const result = await handler(createMockEvent())

    expect(result).toEqual({ synced: 2, errors: 1 })
    expect(mockRecordSyncError).toHaveBeenCalledTimes(1)
  })

  it('全フィード同期失敗時にエラーカウントを正しく返す', async () => {
    const feeds = [
      { id: '1', url: 'https://example.com/feed1' },
      { id: '2', url: 'https://example.com/feed2' }
    ]
    const client = createMockClient({ data: feeds, error: null })
    mockServerSupabaseServiceRole.mockReturnValue(client)
    mockSyncFeed.mockRejectedValue(new Error('Sync failed'))
    mockRecordSyncError.mockResolvedValue(undefined)

    const result = await handler(createMockEvent())

    expect(result).toEqual({ synced: 0, errors: 2 })
    expect(mockRecordSyncError).toHaveBeenCalledTimes(2)
  })
})
