import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockCreateError = vi.fn((opts: { statusCode: number, statusMessage: string }) => {
  const error = new Error(opts.statusMessage) as Error & { statusCode: number, statusMessage: string }
  error.statusCode = opts.statusCode
  error.statusMessage = opts.statusMessage
  return error
})
vi.stubGlobal('createError', mockCreateError)

// Anthropic SDKのモック
const MockAnthropicInstance = { messages: { create: vi.fn() } }
const MockAnthropicConstructor = vi.fn(() => MockAnthropicInstance)
vi.mock('@anthropic-ai/sdk', () => ({
  default: MockAnthropicConstructor
}))

describe('extractMessageText', () => {
  let extractMessageText: (message: any) => string

  beforeEach(async () => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = 'test-api-key'
    const mod = await import('./anthropic')
    extractMessageText = mod.extractMessageText
  })

  it('textブロックからテキストを抽出する', () => {
    const message = {
      content: [{ type: 'text', text: 'Hello, world!' }]
    } as any
    expect(extractMessageText(message)).toBe('Hello, world!')
  })

  it('空レスポンスの場合は空文字を返す', () => {
    const message = { content: [] } as any
    expect(extractMessageText(message)).toBe('')
  })

  it('非textブロックの場合は空文字を返す', () => {
    const message = {
      content: [{ type: 'tool_use', id: 'tool-1', name: 'test', input: {} }]
    } as any
    expect(extractMessageText(message)).toBe('')
  })
})

describe('getAnthropicClient', () => {
  const originalApiKey = process.env.ANTHROPIC_API_KEY

  afterEach(() => {
    if (originalApiKey !== undefined) {
      process.env.ANTHROPIC_API_KEY = originalApiKey
    } else {
      delete process.env.ANTHROPIC_API_KEY
    }
  })

  it('APIキーが設定済みの場合クライアントを返す', async () => {
    vi.resetModules()
    vi.stubGlobal('createError', mockCreateError)
    vi.mock('@anthropic-ai/sdk', () => ({
      default: MockAnthropicConstructor
    }))
    MockAnthropicConstructor.mockClear()

    process.env.ANTHROPIC_API_KEY = 'test-api-key'
    const { getAnthropicClient } = await import('./anthropic')

    const client = getAnthropicClient()

    expect(client).toBeDefined()
    expect(MockAnthropicConstructor).toHaveBeenCalledWith({ apiKey: 'test-api-key' })
  })

  it('APIキー未設定で500エラーを投げる', async () => {
    vi.resetModules()
    vi.stubGlobal('createError', mockCreateError)
    vi.mock('@anthropic-ai/sdk', () => ({
      default: MockAnthropicConstructor
    }))

    delete process.env.ANTHROPIC_API_KEY
    const { getAnthropicClient } = await import('./anthropic')

    expect(() => getAnthropicClient()).toThrowError(
      expect.objectContaining({
        statusCode: 500
      })
    )
  })

  it('シングルトン動作: 2回呼んでもコンストラクタは1回', async () => {
    vi.resetModules()
    vi.stubGlobal('createError', mockCreateError)
    vi.mock('@anthropic-ai/sdk', () => ({
      default: MockAnthropicConstructor
    }))
    MockAnthropicConstructor.mockClear()

    process.env.ANTHROPIC_API_KEY = 'test-api-key'
    const { getAnthropicClient } = await import('./anthropic')

    getAnthropicClient()
    getAnthropicClient()

    expect(MockAnthropicConstructor).toHaveBeenCalledTimes(1)
  })
})
