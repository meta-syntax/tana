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
const mockReadBody = vi.fn()
const mockParseFeed = vi.fn()

vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('requireAuth', mockRequireAuth)
vi.stubGlobal('readBody', mockReadBody)
vi.stubGlobal('parseFeed', mockParseFeed)

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

describe('RSS フィード追加 API (POST /api/rss)', () => {
  let handler: (event: any) => Promise<any>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue('user-123')

    const mod = await import('./index.post')
    handler = mod.default as any
  })

  it('URLが空の場合 400 を返す', async () => {
    mockReadBody.mockResolvedValue({ url: '' })

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'URL is required'
    })
  })

  it('URLが未指定の場合 400 を返す', async () => {
    mockReadBody.mockResolvedValue({})

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'URL is required'
    })
  })

  it('parseFeedが失敗した場合 400 を返す', async () => {
    mockReadBody.mockResolvedValue({ url: 'https://example.com/invalid' })
    mockParseFeed.mockRejectedValue(new Error('Parse error'))

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Invalid RSS/Atom feed URL'
    })
  })

  it('parseFeedがstatusCode付きエラーを投げた場合そのまま伝播する', async () => {
    mockReadBody.mockResolvedValue({ url: 'https://example.com/bad' })
    const httpError = mockCreateError({ statusCode: 403, statusMessage: 'Forbidden' })
    mockParseFeed.mockRejectedValue(httpError)

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  })

  it('フィード上限に達している場合 400 を返す', async () => {
    mockReadBody.mockResolvedValue({ url: 'https://example.com/feed' })
    mockParseFeed.mockResolvedValue({
      title: 'Test Feed',
      description: 'A test feed',
      siteUrl: 'https://example.com'
    })

    const client = createMockClient({ count: 50, error: null })
    mockServerSupabaseClient.mockResolvedValue(client)

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Feed limit reached (max 50)'
    })
  })

  it('フィード数取得でDBエラーの場合 500 を返す', async () => {
    mockReadBody.mockResolvedValue({ url: 'https://example.com/feed' })
    mockParseFeed.mockResolvedValue({
      title: 'Test Feed',
      description: 'A test feed',
      siteUrl: 'https://example.com'
    })

    const client = createMockClient({ count: null, error: { message: 'DB error' } })
    mockServerSupabaseClient.mockResolvedValue(client)

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Failed to check feed count'
    })
  })

  it('重複フィードの場合 400 を返す', async () => {
    mockReadBody.mockResolvedValue({ url: 'https://example.com/feed' })
    mockParseFeed.mockResolvedValue({
      title: 'Test Feed',
      description: 'A test feed',
      siteUrl: 'https://example.com'
    })

    const client = createMockClient(
      { count: 5, error: null },
      { data: null, error: { code: '23505', message: 'duplicate key' } }
    )
    mockServerSupabaseClient.mockResolvedValue(client)

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'This feed is already registered'
    })
  })

  it('insert時にDBエラーの場合 500 を返す', async () => {
    mockReadBody.mockResolvedValue({ url: 'https://example.com/feed' })
    mockParseFeed.mockResolvedValue({
      title: 'Test Feed',
      description: 'A test feed',
      siteUrl: 'https://example.com'
    })

    const client = createMockClient(
      { count: 5, error: null },
      { data: null, error: { code: 'PGRST000', message: 'insert error' } }
    )
    mockServerSupabaseClient.mockResolvedValue(client)

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Failed to add feed'
    })
  })

  it('正常にフィードを登録して返す', async () => {
    const feedUrl = 'https://example.com/feed'
    mockReadBody.mockResolvedValue({ url: feedUrl })
    mockParseFeed.mockResolvedValue({
      title: 'Test Feed',
      description: 'A test feed',
      siteUrl: 'https://example.com'
    })

    const insertedFeed = {
      id: 'feed-1',
      user_id: 'user-123',
      url: feedUrl,
      title: 'Test Feed',
      description: 'A test feed',
      site_url: 'https://example.com'
    }

    const client = createMockClient(
      { count: 5, error: null },
      { data: insertedFeed, error: null }
    )
    mockServerSupabaseClient.mockResolvedValue(client)

    const result = await handler(createMockEvent())

    expect(result).toEqual(insertedFeed)
    expect(mockParseFeed).toHaveBeenCalledWith(feedUrl)
  })
})
