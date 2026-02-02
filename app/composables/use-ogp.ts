import type { OgpData } from '~/types'

export const useOgp = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchOgp = async (url: string): Promise<OgpData | null> => {
    // URLが空の場合は何もしない
    if (!url.trim()) {
      return null
    }

    // URLのバリデーション
    try {
      new URL(url)
    } catch {
      error.value = '有効なURLを入力してください'
      return null
    }

    loading.value = true
    error.value = null

    try {
      return await $fetch<OgpData>('/api/ogp', {
        method: 'POST',
        body: { url }
      })
    } catch (e) {
      console.error('OGP fetch error:', e)
      error.value = 'OGP情報の取得に失敗しました'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    fetchOgp
  }
}
