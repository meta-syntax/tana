import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useAiTagSuggestion } from './use-ai-tag-suggestion'
import { handleAiError } from './handle-ai-error'

// $fetch のモック
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// handleAiError のモック
vi.mock('./handle-ai-error', () => ({
  handleAiError: vi.fn()
}))
const mockHandleAiError = vi.mocked(handleAiError)

describe('useAiTagSuggestion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('空入力では$fetchが呼ばれない', async () => {
    const { suggestTags } = useAiTagSuggestion()

    await suggestTags('', '')

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('正常系: suggestionsにデータがセットされる', async () => {
    const mockSuggestions = [
      { name: 'TypeScript', tag_id: 'tag-1', is_existing: true },
      { name: '開発', tag_id: null, is_existing: false }
    ]
    mockFetch.mockResolvedValue({ suggestions: mockSuggestions })

    const { suggestTags, suggestions } = useAiTagSuggestion()

    await suggestTags('TypeScript入門', 'プログラミング学習')

    expect(suggestions.value).toEqual(mockSuggestions)
    expect(mockFetch).toHaveBeenCalledWith('/api/ai/suggest-tags', {
      method: 'POST',
      body: { title: 'TypeScript入門', description: 'プログラミング学習' }
    })
  })

  it('titleのみでも$fetchが呼ばれる', async () => {
    mockFetch.mockResolvedValue({ suggestions: [] })

    const { suggestTags } = useAiTagSuggestion()

    await suggestTags('Test Title', '')

    expect(mockFetch).toHaveBeenCalled()
  })

  it('429エラーで利用上限メッセージがセットされる', async () => {
    const rateLimitError = { statusCode: 429, statusMessage: 'Rate limited' }
    mockFetch.mockRejectedValue(rateLimitError)
    mockHandleAiError.mockReturnValue('本日の利用上限に達しました')

    const { suggestTags, error } = useAiTagSuggestion()

    await suggestTags('Test', 'Desc')

    expect(error.value).toBe('本日の利用上限に達しました')
    expect(mockHandleAiError).toHaveBeenCalledWith(rateLimitError, 'タグの提案に失敗しました')
  })

  it('その他のエラーでフォールバックメッセージがセットされる', async () => {
    const serverError = { statusCode: 500, statusMessage: 'Server error' }
    mockFetch.mockRejectedValue(serverError)
    mockHandleAiError.mockReturnValue('タグの提案に失敗しました')

    const { suggestTags, error } = useAiTagSuggestion()

    await suggestTags('Test', 'Desc')

    expect(error.value).toBe('タグの提案に失敗しました')
  })

  it('loading状態が正しく遷移する', async () => {
    let resolvePromise: (value: any) => void
    mockFetch.mockReturnValue(new Promise((resolve) => {
      resolvePromise = resolve
    }))

    const { suggestTags, loading } = useAiTagSuggestion()

    expect(loading.value).toBe(false)

    const promise = suggestTags('Test', 'Desc')
    expect(loading.value).toBe(true)

    resolvePromise!({ suggestions: [] })
    await promise

    expect(loading.value).toBe(false)
  })

  it('clearSuggestionsでsuggestionsとerrorがリセットされる', async () => {
    mockFetch.mockResolvedValue({
      suggestions: [{ name: 'tag', tag_id: null, is_existing: false }]
    })

    const { suggestTags, suggestions, error, clearSuggestions } = useAiTagSuggestion()

    await suggestTags('Test', 'Desc')
    expect(suggestions.value).toHaveLength(1)

    clearSuggestions()
    expect(suggestions.value).toEqual([])
    expect(error.value).toBeNull()
  })
})
