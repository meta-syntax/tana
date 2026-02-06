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
const mockCheckAiRateLimit = vi.fn()
const mockGetAnthropicClient = vi.fn()
const mockExtractMessageText = vi.fn()
const mockValidateUrl = vi.fn()
const mockValidateHost = vi.fn()

vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('requireAuth', mockRequireAuth)
vi.stubGlobal('readBody', mockReadBody)
vi.stubGlobal('checkAiRateLimit', mockCheckAiRateLimit)
vi.stubGlobal('getAnthropicClient', mockGetAnthropicClient)
vi.stubGlobal('extractMessageText', mockExtractMessageText)
vi.stubGlobal('validateUrl', mockValidateUrl)
vi.stubGlobal('validateHost', mockValidateHost)

// fetchのモック
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

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

describe('AI 要約 API (POST /api/ai/summarize)', () => {
  let handler: (event: any) => Promise<any>
  const mockMessagesCreate = vi.fn()

  beforeEach(async () => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue('user-123')
    mockGetAnthropicClient.mockReturnValue({ messages: { create: mockMessagesCreate } })
    mockValidateHost.mockResolvedValue(undefined)

    const mod = await import('./summarize.post')
    handler = mod.default as any
  })

  it('bookmark_idが空の場合 400 を返す', async () => {
    mockReadBody.mockResolvedValue({ bookmark_id: '', url: 'https://example.com' })

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'bookmark_id と url が必要です'
    })
  })

  it('urlが空の場合 400 を返す', async () => {
    mockReadBody.mockResolvedValue({ bookmark_id: 'bm-1', url: '' })

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'bookmark_id と url が必要です'
    })
  })

  it('bodyがnullの場合 400 を返す', async () => {
    mockReadBody.mockResolvedValue(null)

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('ブックマーク未発見で 404 を返す', async () => {
    mockReadBody.mockResolvedValue({ bookmark_id: 'bm-1', url: 'https://example.com' })

    const client = createMockClient({ data: null, error: { message: 'not found' } })
    mockServerSupabaseClient.mockResolvedValue(client)

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'ブックマークが見つかりません'
    })
  })

  it('キャッシュヒット: 既存summaryがあれば即返却する', async () => {
    mockReadBody.mockResolvedValue({ bookmark_id: 'bm-1', url: 'https://example.com' })

    const client = createMockClient({ data: { id: 'bm-1', summary: '既存の要約テキスト' }, error: null })
    mockServerSupabaseClient.mockResolvedValue(client)

    const result = await handler(createMockEvent())

    expect(result).toEqual({ summary: '既存の要約テキスト', cached: true })
    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockMessagesCreate).not.toHaveBeenCalled()
  })

  it('正常系: HTML取得→テキスト抽出→要約→DB保存', async () => {
    mockReadBody.mockResolvedValue({ bookmark_id: 'bm-1', url: 'https://example.com' })

    // ブックマーク取得: summaryなし
    const updateChain = createMockQueryChain({ data: null, error: null })
    const client = createMockClient(
      { data: { id: 'bm-1', summary: null }, error: null },
      { data: null, error: null } // update用
    )
    // update チェーンを差し替え
    client._chains[1] = updateChain
    mockServerSupabaseClient.mockResolvedValue(client)

    const targetUrl = new URL('https://example.com')
    mockValidateUrl.mockReturnValue(targetUrl)

    // HTML取得
    const longText = 'これはテストページの本文です。'.repeat(10)
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(`<html><head><title>Test</title></head><body><p>${longText}</p></body></html>`)
    })

    // Claude API要約
    mockMessagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'テストページの要約です。' }]
    })
    mockExtractMessageText.mockReturnValue('テストページの要約です。')

    const result = await handler(createMockEvent())

    expect(result).toEqual({ summary: 'テストページの要約です。', cached: false })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockMessagesCreate).toHaveBeenCalledTimes(1)
  })

  it('テキスト不足で 422 を返す', async () => {
    mockReadBody.mockResolvedValue({ bookmark_id: 'bm-1', url: 'https://example.com' })

    const client = createMockClient({ data: { id: 'bm-1', summary: null }, error: null })
    mockServerSupabaseClient.mockResolvedValue(client)

    const targetUrl = new URL('https://example.com')
    mockValidateUrl.mockReturnValue(targetUrl)

    // 非常に短いテキスト
    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<html><body>短い</body></html>')
    })

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 422,
      statusMessage: 'ページから十分なテキストを抽出できませんでした'
    })
  })

  it('checkAiRateLimitが呼ばれる', async () => {
    mockReadBody.mockResolvedValue({ bookmark_id: 'bm-1', url: 'https://example.com' })

    const client = createMockClient({ data: { id: 'bm-1', summary: '既存要約' }, error: null })
    mockServerSupabaseClient.mockResolvedValue(client)

    await handler(createMockEvent())

    expect(mockCheckAiRateLimit).toHaveBeenCalledWith('user-123', 'summarize')
  })
})
