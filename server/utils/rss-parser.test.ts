import { describe, it, expect, vi, beforeEach } from 'vitest'

// Nitro auto-imports のモック
const mockCreateError = vi.fn((opts: { statusCode: number, statusMessage: string }) => {
  const error = new Error(opts.statusMessage) as Error & { statusCode: number, statusMessage: string }
  error.statusCode = opts.statusCode
  error.statusMessage = opts.statusMessage
  return error
})

vi.stubGlobal('createError', mockCreateError)

// SSRFユーティリティのモック
const mockValidateUrl = vi.fn()
const mockValidateHost = vi.fn()

vi.stubGlobal('validateUrl', mockValidateUrl)
vi.stubGlobal('validateHost', mockValidateHost)

// rss-parserライブラリのモック
const mockParseURL = vi.fn()
vi.mock('rss-parser', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      parseURL: mockParseURL
    }))
  }
})

describe('parseFeed', () => {
  beforeEach(() => {
    mockValidateUrl.mockReset()
    mockValidateHost.mockReset()
    mockParseURL.mockReset()

    // デフォルト: URLバリデーション成功
    mockValidateUrl.mockReturnValue(new URL('https://example.com/feed.xml'))
    mockValidateHost.mockResolvedValue(undefined)
  })

  it('有効なRSSフィードをパースして ParsedFeed を返す', async () => {
    mockParseURL.mockResolvedValue({
      title: 'Test Blog',
      description: 'A test blog',
      link: 'https://example.com',
      items: [
        {
          title: 'Article 1',
          link: 'https://example.com/article-1',
          contentSnippet: 'First article content',
          isoDate: '2026-01-15T00:00:00.000Z'
        },
        {
          title: 'Article 2',
          link: 'https://example.com/article-2',
          content: 'Second article full content',
          pubDate: 'Mon, 20 Jan 2026 00:00:00 GMT'
        }
      ]
    })

    const { parseFeed } = await import('./rss-parser')
    const result = await parseFeed('https://example.com/feed.xml')

    expect(result.title).toBe('Test Blog')
    expect(result.description).toBe('A test blog')
    expect(result.siteUrl).toBe('https://example.com')
    expect(result.items).toHaveLength(2)
    expect(result.items[0]!.title).toBe('Article 1')
    expect(result.items[0]!.url).toBe('https://example.com/article-1')
    expect(result.items[0]!.description).toBe('First article content')
    expect(result.items[0]!.publishedAt).toBe('2026-01-15T00:00:00.000Z')
  })

  it('linkがないアイテムはフィルターされる', async () => {
    mockParseURL.mockResolvedValue({
      title: 'Test',
      items: [
        { title: 'Has link', link: 'https://example.com/1' },
        { title: 'No link' }
      ]
    })

    const { parseFeed } = await import('./rss-parser')
    const result = await parseFeed('https://example.com/feed.xml')

    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.title).toBe('Has link')
  })

  it('SSRF検証が呼ばれる', async () => {
    mockParseURL.mockResolvedValue({
      title: 'Test',
      items: []
    })

    const { parseFeed } = await import('./rss-parser')
    await parseFeed('https://example.com/feed.xml')

    expect(mockValidateUrl).toHaveBeenCalledWith('https://example.com/feed.xml')
    expect(mockValidateHost).toHaveBeenCalledWith('example.com')
  })

  it('SSRF検証失敗時にエラーを投げる', async () => {
    const ssrfError = new Error('Access to internal hosts is not allowed') as Error & { statusCode: number }
    ssrfError.statusCode = 400
    mockValidateHost.mockRejectedValue(ssrfError)

    const { parseFeed } = await import('./rss-parser')

    await expect(parseFeed('https://localhost/feed.xml')).rejects.toThrow()
  })

  it('descriptionが500文字に制限される', async () => {
    const longContent = 'a'.repeat(600)
    mockParseURL.mockResolvedValue({
      title: 'Test',
      items: [
        {
          title: 'Article',
          link: 'https://example.com/1',
          contentSnippet: longContent
        }
      ]
    })

    const { parseFeed } = await import('./rss-parser')
    const result = await parseFeed('https://example.com/feed.xml')

    expect(result.items[0]!.description?.length).toBe(500)
  })

  it('タイトルなしのフィードでもnullが返される', async () => {
    mockParseURL.mockResolvedValue({
      items: []
    })

    const { parseFeed } = await import('./rss-parser')
    const result = await parseFeed('https://example.com/feed.xml')

    expect(result.title).toBeNull()
    expect(result.description).toBeNull()
    expect(result.siteUrl).toBeNull()
  })
})
