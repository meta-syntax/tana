import { beforeEach, describe, expect, it, vi } from 'vitest'

// h3 ユーティリティのモック（Nitro auto-importのグローバルをstub）
const mockGetRequestIP = vi.fn()
const mockReadBody = vi.fn()
const mockCreateError = vi.fn((opts: { statusCode: number, statusMessage: string }) => {
  const error = new Error(opts.statusMessage) as Error & { statusCode: number, statusMessage: string }
  error.statusCode = opts.statusCode
  error.statusMessage = opts.statusMessage
  return error
})
const mockDefineEventHandler = vi.fn((handler: (...args: unknown[]) => unknown) => handler)

vi.stubGlobal('defineEventHandler', mockDefineEventHandler)
vi.stubGlobal('getRequestIP', mockGetRequestIP)
vi.stubGlobal('readBody', mockReadBody)
vi.stubGlobal('createError', mockCreateError)

// SSRF utils のモック（詳細テストは ssrf.test.ts で実施）
const mockValidateHost = vi.fn()
vi.stubGlobal('validateHost', mockValidateHost)

// metascraperのモック
const mockScraper = vi.fn()
vi.mock('metascraper', () => ({
  default: () => mockScraper
}))
vi.mock('metascraper-title', () => ({ default: () => ({}) }))
vi.mock('metascraper-description', () => ({ default: () => ({}) }))
vi.mock('metascraper-image', () => ({ default: () => ({}) }))

// fetchのモック
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// テストごとにユニークなURLを生成してキャッシュの影響を回避
let urlCounter = 0
const uniqueUrl = (base = 'https://example.com') => `${base}/test-${++urlCounter}`

const createMockEvent = () => ({} as unknown)

describe('OGP API ハンドラ', () => {
  let handler: (event: unknown) => Promise<unknown>

  beforeEach(async () => {
    // IPをテストごとにユニークにしてレート制限を回避
    mockGetRequestIP.mockReturnValue(`test-${urlCounter}-${Date.now()}`)
    mockReadBody.mockReset()
    mockValidateHost.mockReset()
    mockValidateHost.mockResolvedValue(undefined)
    mockScraper.mockReset()
    mockFetch.mockReset()

    const mod = await import('./index.post')
    handler = mod.default as (event: unknown) => Promise<unknown>
  })

  describe('URLバリデーション', () => {
    it('URLが空の場合 400 を返す', async () => {
      mockReadBody.mockResolvedValue({ url: '' })

      expect(handler(createMockEvent())).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: 'URL is required'
      })
    })

    it('無効なURL形式の場合 400 を返す', async () => {
      mockReadBody.mockResolvedValue({ url: 'not-a-url' })

      expect(handler(createMockEvent())).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: 'Invalid URL format'
      })
    })

    it('ftp:プロトコルの場合 400 を返す', async () => {
      mockReadBody.mockResolvedValue({ url: 'ftp://example.com/file' })

      expect(handler(createMockEvent())).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: 'Only HTTP and HTTPS protocols are allowed'
      })
    })
  })

  describe('SSRF対策の呼び出し', () => {
    it('validateHostが呼ばれる', async () => {
      const url = uniqueUrl()
      mockReadBody.mockResolvedValue({ url })
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve('<html></html>')
      })
      mockScraper.mockResolvedValue({ title: null, description: null, image: null })

      await handler(createMockEvent())

      expect(mockValidateHost).toHaveBeenCalledWith(new URL(url).hostname)
    })

    it('validateHostが失敗した場合エラーが伝播する', async () => {
      mockReadBody.mockResolvedValue({ url: uniqueUrl() })
      mockValidateHost.mockRejectedValue(
        mockCreateError({ statusCode: 400, statusMessage: 'Access to internal hosts is not allowed' })
      )

      expect(handler(createMockEvent())).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: 'Access to internal hosts is not allowed'
      })
    })
  })

  describe('レート制限', () => {
    it('制限内のリクエストは正常に処理される', async () => {
      const url = uniqueUrl()
      mockReadBody.mockResolvedValue({ url })
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve('<html><head><title>Example</title></head></html>')
      })
      mockScraper.mockResolvedValue({ title: 'Example', description: null, image: null })

      const result = await handler(createMockEvent())
      expect(result).toEqual({ title: 'Example', description: null, image: null })
    })

    it('20リクエスト超過の場合 429 を返す', async () => {
      // 固定IPを使ってレート制限をテスト
      const rateLimitIp = `rate-limit-test-${Date.now()}`
      mockGetRequestIP.mockReturnValue(rateLimitIp)
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve('<html><head><title>Example</title></head></html>')
      })
      mockScraper.mockResolvedValue({ title: 'Example', description: null, image: null })

      // 20リクエストを消費（各回ユニークURLでキャッシュを回避）
      for (let i = 0; i < 20; i++) {
        mockReadBody.mockResolvedValue({ url: uniqueUrl() })
        await handler(createMockEvent())
      }

      // 21回目でレート制限
      mockReadBody.mockResolvedValue({ url: uniqueUrl() })
      expect(handler(createMockEvent())).rejects.toMatchObject({
        statusCode: 429,
        statusMessage: 'Too many requests. Please try again later.'
      })
    })
  })

  describe('リダイレクト処理', () => {
    it('リダイレクトレスポンスの場合 502 を返す', async () => {
      mockReadBody.mockResolvedValue({ url: uniqueUrl() })
      mockFetch.mockResolvedValue({
        ok: false,
        status: 301,
        headers: new Headers({ location: 'https://www.example.com' }),
        text: () => Promise.resolve('')
      })

      expect(handler(createMockEvent())).rejects.toMatchObject({
        statusCode: 502,
        statusMessage: 'Redirect not followed: 301'
      })
    })
  })

  describe('キャッシュ', () => {
    it('同一URL2回目の呼び出しではfetchは1回だけ呼ばれる', async () => {
      const cachedUrl = uniqueUrl('https://cached-example.com')
      mockReadBody.mockResolvedValue({ url: cachedUrl })
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve('<html><head><title>Cached</title></head></html>')
      })
      mockScraper.mockResolvedValue({ title: 'Cached', description: 'Desc', image: 'https://img.example.com/og.png' })

      // 1回目
      const result1 = await handler(createMockEvent())
      expect(result1).toEqual({ title: 'Cached', description: 'Desc', image: 'https://img.example.com/og.png' })

      // 2回目（キャッシュヒット）
      const result2 = await handler(createMockEvent())
      expect(result2).toEqual({ title: 'Cached', description: 'Desc', image: 'https://img.example.com/og.png' })

      // fetchは1回だけ呼ばれる
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('成功パス', () => {
    it('有効なURLの場合 OGPデータを返す', async () => {
      mockReadBody.mockResolvedValue({ url: uniqueUrl('https://example.com') })
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers(),
        text: () => Promise.resolve('<html><head><meta property="og:title" content="Article Title"></head></html>')
      })
      mockScraper.mockResolvedValue({
        title: 'Article Title',
        description: 'Article description',
        image: 'https://example.com/image.jpg'
      })

      const result = await handler(createMockEvent())
      expect(result).toEqual({
        title: 'Article Title',
        description: 'Article description',
        image: 'https://example.com/image.jpg'
      })
    })
  })

  describe('エラーハンドリング', () => {
    it('fetch先がエラーステータスの場合 502 を返す', async () => {
      mockReadBody.mockResolvedValue({ url: uniqueUrl('https://example.com') })
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers(),
        text: () => Promise.resolve('')
      })

      expect(handler(createMockEvent())).rejects.toMatchObject({
        statusCode: 502,
        statusMessage: 'Failed to fetch URL: 404'
      })
    })

    it('タイムアウトの場合 504 を返す', async () => {
      mockReadBody.mockResolvedValue({ url: uniqueUrl('https://slow-example.com') })

      const timeoutError = new Error('The operation was aborted due to timeout')
      timeoutError.name = 'TimeoutError'
      mockFetch.mockRejectedValue(timeoutError)

      expect(handler(createMockEvent())).rejects.toMatchObject({
        statusCode: 504,
        statusMessage: 'Request timeout'
      })
    })
  })
})
