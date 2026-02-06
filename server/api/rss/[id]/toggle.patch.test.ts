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

describe('RSS フィード有効/無効切替 API (PATCH /api/rss/[id]/toggle)', () => {
  let handler: (event: any) => Promise<any>

  beforeEach(async () => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue('user-123')
    mockRequireRouteParam.mockReturnValue('feed-1')

    const mod = await import('./toggle.patch')
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

  it('有効→無効に切り替える（エラー情報を保持する）', async () => {
    const feedData = {
      id: 'feed-1',
      is_active: true,
      error_count: 3,
      last_error: 'Previous error'
    }
    const client = createMockClient(
      { data: feedData, error: null },
      { error: null }
    )
    mockServerSupabaseClient.mockResolvedValue(client)

    const result = await handler(createMockEvent())

    expect(result).toEqual({ success: true, is_active: false })
    // 無効化時はエラー情報を保持する
    expect(client._chains[1]!.update).toHaveBeenCalledWith(
      expect.objectContaining({
        is_active: false,
        error_count: 3,
        last_error: 'Previous error'
      })
    )
  })

  it('無効→有効に切り替える（エラー情報をリセットする）', async () => {
    const feedData = {
      id: 'feed-1',
      is_active: false,
      error_count: 5,
      last_error: 'Some sync error'
    }
    const client = createMockClient(
      { data: feedData, error: null },
      { error: null }
    )
    mockServerSupabaseClient.mockResolvedValue(client)

    const result = await handler(createMockEvent())

    expect(result).toEqual({ success: true, is_active: true })
    // 有効化時はエラー情報をリセットする
    expect(client._chains[1]!.update).toHaveBeenCalledWith(
      expect.objectContaining({
        is_active: true,
        error_count: 0,
        last_error: null
      })
    )
  })

  it('更新時にDBエラーの場合 500 を返す', async () => {
    const feedData = {
      id: 'feed-1',
      is_active: true,
      error_count: 0,
      last_error: null
    }
    const client = createMockClient(
      { data: feedData, error: null },
      { error: { message: 'update error' } }
    )
    mockServerSupabaseClient.mockResolvedValue(client)

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Failed to update feed status'
    })
  })
})
