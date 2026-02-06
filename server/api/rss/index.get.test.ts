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

vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('requireAuth', mockRequireAuth)

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

describe('RSS フィード一覧取得 API (GET /api/rss)', () => {
  let handler: (event: any) => Promise<any>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue('user-123')

    const mod = await import('./index.get')
    handler = mod.default as any
  })

  it('正常にフィード一覧を返す', async () => {
    const mockFeeds = [
      { id: '1', title: 'Feed 1', url: 'https://example.com/feed1' },
      { id: '2', title: 'Feed 2', url: 'https://example.com/feed2' }
    ]
    const client = createMockClient({ data: mockFeeds, error: null })
    mockServerSupabaseClient.mockResolvedValue(client)

    const result = await handler(createMockEvent())

    expect(result).toEqual(mockFeeds)
    expect(mockRequireAuth).toHaveBeenCalled()
    expect(client.from).toHaveBeenCalledWith('rss_feeds')
    expect(client._chains[0]!.select).toHaveBeenCalledWith('*')
    expect(client._chains[0]!.eq).toHaveBeenCalledWith('user_id', 'user-123')
    expect(client._chains[0]!.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('DBエラーの場合 500 を返す', async () => {
    const client = createMockClient({ data: null, error: { message: 'DB error' } })
    mockServerSupabaseClient.mockResolvedValue(client)

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Failed to fetch feeds'
    })
  })
})
