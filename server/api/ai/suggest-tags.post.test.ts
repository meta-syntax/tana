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

vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('requireAuth', mockRequireAuth)
vi.stubGlobal('readBody', mockReadBody)
vi.stubGlobal('checkAiRateLimit', mockCheckAiRateLimit)
vi.stubGlobal('getAnthropicClient', mockGetAnthropicClient)
vi.stubGlobal('extractMessageText', mockExtractMessageText)

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

describe('AI タグ提案 API (POST /api/ai/suggest-tags)', () => {
  let handler: (event: any) => Promise<any>
  const mockMessagesCreate = vi.fn()

  beforeEach(async () => {
    vi.clearAllMocks()
    mockRequireAuth.mockResolvedValue('user-123')
    mockGetAnthropicClient.mockReturnValue({ messages: { create: mockMessagesCreate } })

    const mod = await import('./suggest-tags.post')
    handler = mod.default as any
  })

  it('title/descriptionが両方空の場合 400 を返す', async () => {
    mockReadBody.mockResolvedValue({ title: '', description: '' })

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'title または description が必要です'
    })
  })

  it('bodyが空の場合 400 を返す', async () => {
    mockReadBody.mockResolvedValue(null)

    expect(handler(createMockEvent())).rejects.toMatchObject({
      statusCode: 400
    })
  })

  it('正常系: Claude APIレスポンスをパースし既存タグを紐付ける', async () => {
    mockReadBody.mockResolvedValue({ title: 'TypeScript入門', description: 'プログラミング' })

    const existingTags = [
      { id: 'tag-1', name: 'TypeScript' },
      { id: 'tag-2', name: 'JavaScript' }
    ]
    const client = createMockClient({ data: existingTags, error: null })
    mockServerSupabaseClient.mockResolvedValue(client)

    const mockMessage = {
      content: [{
        type: 'text',
        text: '[{"name":"TypeScript"},{"name":"プログラミング"},{"name":"入門"}]'
      }]
    }
    mockMessagesCreate.mockResolvedValue(mockMessage)
    mockExtractMessageText.mockReturnValue('[{"name":"TypeScript"},{"name":"プログラミング"},{"name":"入門"}]')

    const result = await handler(createMockEvent())

    expect(result.suggestions).toHaveLength(3)
    expect(result.suggestions[0]).toEqual({
      name: 'TypeScript',
      tag_id: 'tag-1',
      is_existing: true
    })
    expect(result.suggestions[1]).toEqual({
      name: 'プログラミング',
      tag_id: null,
      is_existing: false
    })
    expect(result.suggestions[2]).toEqual({
      name: '入門',
      tag_id: null,
      is_existing: false
    })
  })

  it('不正JSONレスポンスで空配列を返す', async () => {
    mockReadBody.mockResolvedValue({ title: 'Test', description: '' })

    const client = createMockClient({ data: [], error: null })
    mockServerSupabaseClient.mockResolvedValue(client)

    const mockMessage = { content: [{ type: 'text', text: 'これはJSONではありません' }] }
    mockMessagesCreate.mockResolvedValue(mockMessage)
    mockExtractMessageText.mockReturnValue('これはJSONではありません')

    const result = await handler(createMockEvent())

    expect(result.suggestions).toEqual([])
  })

  it('既存タグがない場合も正常に動作する', async () => {
    mockReadBody.mockResolvedValue({ title: 'Test', description: 'Desc' })

    const client = createMockClient({ data: null, error: null })
    mockServerSupabaseClient.mockResolvedValue(client)

    mockMessagesCreate.mockResolvedValue({ content: [{ type: 'text', text: '[{"name":"tag1"}]' }] })
    mockExtractMessageText.mockReturnValue('[{"name":"tag1"}]')

    const result = await handler(createMockEvent())

    expect(result.suggestions).toHaveLength(1)
    expect(result.suggestions[0]).toEqual({
      name: 'tag1',
      tag_id: null,
      is_existing: false
    })
  })

  it('checkAiRateLimitが呼ばれる', async () => {
    mockReadBody.mockResolvedValue({ title: 'Test', description: '' })

    const client = createMockClient({ data: [], error: null })
    mockServerSupabaseClient.mockResolvedValue(client)
    mockMessagesCreate.mockResolvedValue({ content: [{ type: 'text', text: '[]' }] })
    mockExtractMessageText.mockReturnValue('[]')

    await handler(createMockEvent())

    expect(mockCheckAiRateLimit).toHaveBeenCalledWith('user-123', 'suggest-tags')
  })
})
