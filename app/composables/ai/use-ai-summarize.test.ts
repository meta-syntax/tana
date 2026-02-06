import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useAiSummarize } from './use-ai-summarize'
import { handleAiError } from './handle-ai-error'

// $fetch のモック
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// handleAiError のモック
vi.mock('./handle-ai-error', () => ({
  handleAiError: vi.fn()
}))
const mockHandleAiError = vi.mocked(handleAiError)

describe('useAiSummarize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('正常系: summaryを返す', async () => {
    mockFetch.mockResolvedValue({ summary: 'テストページの要約です。', cached: false })

    const { summarize } = useAiSummarize()

    const result = await summarize('bm-1', 'https://example.com')

    expect(result).toBe('テストページの要約です。')
    expect(mockFetch).toHaveBeenCalledWith('/api/ai/summarize', {
      method: 'POST',
      body: { bookmark_id: 'bm-1', url: 'https://example.com' }
    })
  })

  it('429エラーで利用上限メッセージがセットされる', async () => {
    const rateLimitError = { statusCode: 429, statusMessage: 'Rate limited' }
    mockFetch.mockRejectedValue(rateLimitError)
    mockHandleAiError.mockReturnValue('本日の利用上限に達しました')

    const { summarize, error } = useAiSummarize()

    const result = await summarize('bm-1', 'https://example.com')

    expect(result).toBeNull()
    expect(error.value).toBe('本日の利用上限に達しました')
    expect(mockHandleAiError).toHaveBeenCalledWith(rateLimitError, '要約の生成に失敗しました')
  })

  it('その他のエラーでフォールバックメッセージがセットされる', async () => {
    const serverError = { statusCode: 500, statusMessage: 'Server error' }
    mockFetch.mockRejectedValue(serverError)
    mockHandleAiError.mockReturnValue('要約の生成に失敗しました')

    const { summarize, error } = useAiSummarize()

    const result = await summarize('bm-1', 'https://example.com')

    expect(result).toBeNull()
    expect(error.value).toBe('要約の生成に失敗しました')
  })

  it('loading状態が正しく遷移する', async () => {
    let resolvePromise: (value: any) => void
    mockFetch.mockReturnValue(new Promise((resolve) => {
      resolvePromise = resolve
    }))

    const { summarize, loading } = useAiSummarize()

    expect(loading.value).toBe(false)

    const promise = summarize('bm-1', 'https://example.com')
    expect(loading.value).toBe(true)

    resolvePromise!({ summary: 'テスト要約', cached: false })
    await promise

    expect(loading.value).toBe(false)
  })

  it('エラー後もloading状態がfalseになる', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    mockHandleAiError.mockReturnValue('要約の生成に失敗しました')

    const { summarize, loading } = useAiSummarize()

    await summarize('bm-1', 'https://example.com')

    expect(loading.value).toBe(false)
  })
})
