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

// DNS解決のモック
const mockDnsResolve = vi.fn()
vi.mock('node:dns/promises', () => ({
  default: { resolve: (...args: unknown[]) => mockDnsResolve(...args) },
  resolve: (...args: unknown[]) => mockDnsResolve(...args)
}))

// SSRF utils のモック（Nitro auto-import: server/utils/ssrf.tsから自動インポート）
const mockValidateHost = vi.fn(async (hostname: string) => {
  if (hostname === 'localhost' || hostname === '0.0.0.0') {
    throw mockCreateError({
      statusCode: 400,
      statusMessage: 'Access to internal hosts is not allowed'
    })
  }
  const PRIVATE_IP_PATTERNS = [
    /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
    /^169\.254\./, /^0\./, /^::1$/, /^fe80:/i, /^fc00:/i, /^fd[0-9a-f]{2}:/i
  ]
  const checkPrivateIp = (ip: string) => PRIVATE_IP_PATTERNS.some(p => p.test(ip))

  if (/^[\d.]+$/.test(hostname) || hostname.includes(':')) {
    if (checkPrivateIp(hostname)) {
      throw mockCreateError({
        statusCode: 400,
        statusMessage: 'Access to internal hosts is not allowed'
      })
    }
    return
  }

  try {
    const addresses = await mockDnsResolve(hostname)
    for (const addr of addresses) {
      if (checkPrivateIp(addr)) {
        throw mockCreateError({
          statusCode: 400,
          statusMessage: 'Access to internal hosts is not allowed'
        })
      }
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw mockCreateError({
      statusCode: 400,
      statusMessage: 'Failed to resolve hostname'
    })
  }
})
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
    mockDnsResolve.mockReset()
    mockScraper.mockReset()
    mockFetch.mockReset()

    const mod = await import('./ogp.post')
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

  describe('SSRF対策', () => {
    it('localhost の場合 400 を返す', async () => {
      mockReadBody.mockResolvedValue({ url: 'http://localhost/admin' })

      expect(handler(createMockEvent())).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: 'Access to internal hosts is not allowed'
      })
    })

    it('プライベートIP (10.x) の場合 400 を返す', async () => {
      mockReadBody.mockResolvedValue({ url: 'http://10.0.0.1/internal' })

      expect(handler(createMockEvent())).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: 'Access to internal hosts is not allowed'
      })
    })

    it('プライベートIP (192.168.x) の場合 400 を返す', async () => {
      mockReadBody.mockResolvedValue({ url: 'http://192.168.1.1/internal' })

      expect(handler(createMockEvent())).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: 'Access to internal hosts is not allowed'
      })
    })

    it('プライベートIP (172.16.x) の場合 400 を返す', async () => {
      mockReadBody.mockResolvedValue({ url: 'http://172.16.0.1/internal' })

      expect(handler(createMockEvent())).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: 'Access to internal hosts is not allowed'
      })
    })

    it('DNS解決結果がプライベートIPの場合 400 を返す', async () => {
      mockReadBody.mockResolvedValue({ url: uniqueUrl('https://evil.example.com') })
      mockDnsResolve.mockResolvedValue(['192.168.0.1'])

      expect(handler(createMockEvent())).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: 'Access to internal hosts is not allowed'
      })
    })

    it('DNS解決失敗の場合 400 を返す', async () => {
      mockReadBody.mockResolvedValue({ url: uniqueUrl('https://nonexistent.example.com') })
      mockDnsResolve.mockRejectedValue(new Error('ENOTFOUND'))

      expect(handler(createMockEvent())).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: 'Failed to resolve hostname'
      })
    })
  })

  describe('レート制限', () => {
    it('制限内のリクエストは正常に処理される', async () => {
      const url = uniqueUrl()
      mockReadBody.mockResolvedValue({ url })
      mockDnsResolve.mockResolvedValue(['93.184.216.34'])
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
      mockDnsResolve.mockResolvedValue(['93.184.216.34'])
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
      mockDnsResolve.mockResolvedValue(['93.184.216.34'])
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
      mockDnsResolve.mockResolvedValue(['93.184.216.34'])
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
      mockDnsResolve.mockResolvedValue(['93.184.216.34'])
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
      mockDnsResolve.mockResolvedValue(['93.184.216.34'])
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
      mockDnsResolve.mockResolvedValue(['93.184.216.34'])

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
