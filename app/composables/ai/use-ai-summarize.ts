import type { SummarizeResponse } from '~/types'
import { handleAiError } from './handle-ai-error'

export const useAiSummarize = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const summarize = async (bookmarkId: string, url: string): Promise<string | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await $fetch<SummarizeResponse>('/api/ai/summarize', {
        method: 'POST',
        body: { bookmark_id: bookmarkId, url }
      })
      return result.summary
    } catch (e) {
      error.value = handleAiError(e, '要約の生成に失敗しました')
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    summarize
  }
}
