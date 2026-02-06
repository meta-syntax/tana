import type { SuggestTagsResponse, TagSuggestion } from '~/types'
import { handleAiError } from './handle-ai-error'

export const useAiTagSuggestion = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const suggestions = ref<TagSuggestion[]>([])

  const suggestTags = async (title: string, description: string) => {
    if (!title && !description) return

    loading.value = true
    error.value = null
    suggestions.value = []

    try {
      const result = await $fetch<SuggestTagsResponse>('/api/ai/suggest-tags', {
        method: 'POST',
        body: { title, description }
      })
      suggestions.value = result.suggestions
    } catch (e) {
      error.value = handleAiError(e, 'タグの提案に失敗しました')
    } finally {
      loading.value = false
    }
  }

  const clearSuggestions = () => {
    suggestions.value = []
    error.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    suggestions: readonly(suggestions),
    suggestTags,
    clearSuggestions
  }
}
