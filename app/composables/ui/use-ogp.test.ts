import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useOgp } from './use-ogp'

describe('useOgp', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('$fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('空URL → null（エラーなし）', async () => {
    const { fetchOgp, error } = useOgp()
    const result = await fetchOgp('')
    expect(result).toBeNull()
    expect(error.value).toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('空白のみURL → null（エラーなし）', async () => {
    const { fetchOgp, error } = useOgp()
    const result = await fetchOgp('   ')
    expect(result).toBeNull()
    expect(error.value).toBeNull()
  })

  it('無効URL → error設定 + null', async () => {
    const { fetchOgp, error } = useOgp()
    const result = await fetchOgp('not-a-url')
    expect(result).toBeNull()
    expect(error.value).toBe('有効なURLを入力してください')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('有効URL + API成功 → OgpData返却', async () => {
    const ogpData = { title: 'Test', description: 'Desc', image: 'https://example.com/img.png' }
    mockFetch.mockResolvedValueOnce(ogpData)

    const { fetchOgp, error } = useOgp()
    const result = await fetchOgp('https://example.com')

    expect(result).toEqual(ogpData)
    expect(error.value).toBeNull()
    expect(mockFetch).toHaveBeenCalledWith('/api/ogp', {
      method: 'POST',
      body: { url: 'https://example.com' }
    })
  })

  it('API失敗 → エラーメッセージ設定 + null（リトライ後も失敗）', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { fetchOgp, error } = useOgp()
    const result = await fetchOgp('https://example.com')

    expect(result).toBeNull()
    expect(error.value).toBe('OGP情報の取得に失敗しました')
    // 初回 + リトライ2回 = 合計3回呼ばれる
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('API 4xxエラー → リトライせずエラー', async () => {
    const clientError = { statusCode: 400, statusMessage: 'Bad Request' }
    mockFetch.mockRejectedValueOnce(clientError)

    const { fetchOgp, error } = useOgp()
    const result = await fetchOgp('https://example.com')

    expect(result).toBeNull()
    expect(error.value).toBe('OGP情報の取得に失敗しました')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('API 5xxエラー後にリトライ成功', async () => {
    const ogpData = { title: 'Test', description: 'Desc', image: null }
    const serverError = { statusCode: 500, statusMessage: 'Server Error' }
    mockFetch.mockRejectedValueOnce(serverError)
    mockFetch.mockResolvedValueOnce(ogpData)

    const { fetchOgp, error } = useOgp()
    const result = await fetchOgp('https://example.com')

    expect(result).toEqual(ogpData)
    expect(error.value).toBeNull()
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('loading状態の遷移', async () => {
    let resolvePromise: (value: unknown) => void
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mockFetch.mockReturnValueOnce(pendingPromise)

    const { fetchOgp, loading } = useOgp()
    expect(loading.value).toBe(false)

    const fetchPromise = fetchOgp('https://example.com')
    expect(loading.value).toBe(true)

    resolvePromise!({ title: 'Test', description: null, image: null })
    await fetchPromise

    expect(loading.value).toBe(false)
  })
})
