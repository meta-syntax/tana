import type { OgpData } from '~/types'

const MAX_RETRIES = 2
const INITIAL_BACKOFF = 500

const isRetryable = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as { statusCode: number }).statusCode
    return statusCode >= 500
  }
  // ネットワークエラー（statusCode なし）はリトライ対象
  return true
}

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

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

    let lastError: unknown

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await $fetch<OgpData>('/api/ogp', {
          method: 'POST',
          body: { url }
        })
        loading.value = false
        return result
      } catch (e) {
        lastError = e

        // クライアントエラー（4xx）はリトライしない
        if (!isRetryable(e)) {
          break
        }

        // 最後の試行でなければバックオフして再試行
        if (attempt < MAX_RETRIES) {
          await sleep(INITIAL_BACKOFF * Math.pow(2, attempt))
        }
      }
    }

    console.error('OGP fetch error:', lastError)
    error.value = 'OGP情報の取得に失敗しました'
    loading.value = false
    return null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    fetchOgp
  }
}
