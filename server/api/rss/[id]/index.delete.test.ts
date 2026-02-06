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

vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('requireAuth', mockRequireAuth)
vi.stubGlobal('requireRouteParam', mockRequireRouteParam)

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

describe('RSS フィード削除 API (DELETE /api/rss/[id])', () => {
  let handler: (event: any) => Promise<any>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue('user-123')
    mockRequireRouteParam.mockReturnValue('feed-1')

    const mod = await import('./index.delete')
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

  it('削除時にDBエラーの場合 500 を返す', async () => {
    const client = createMockClient(
      { data: { id: 'feed-1' }, error: null },
      { error: { message: 'delete error' } }
    )
    mockServerSupabaseClient.mockResolvedValue(client)

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Failed to delete feed'
    })
  })

  it('正常にフィードを削除する', async () => {
    const client = createMockClient(
      { data: { id: 'feed-1' }, error: null },
      { error: null }
    )
    mockServerSupabaseClient.mockResolvedValue(client)

    const result = await handler(createMockEvent())

    expect(result).toEqual({ success: true })
    expect(mockRequireRouteParam).toHaveBeenCalledWith(expect.anything(), 'id')
  })
})
