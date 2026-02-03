import metascraper from 'metascraper'
import metascraperTitle from 'metascraper-title'
import metascraperDescription from 'metascraper-description'
import metascraperImage from 'metascraper-image'

const scraper = metascraper([
  metascraperTitle(),
  metascraperDescription(),
  metascraperImage()
])

// インメモリキャッシュ（TTL: 1時間、上限: 500件）
interface CacheEntry {
  data: { title: string | null, description: string | null, image: string | null }
  expiresAt: number
}

const CACHE_TTL = 60 * 60 * 1000 // 1時間
const CACHE_MAX_SIZE = 500
const ogpCache = new Map<string, CacheEntry>()

export default defineEventHandler(async (event) => {
  const body = await readBody<{ url: string }>(event)

  if (!body?.url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL is required'
    })
  }

  // URLのバリデーション
  let targetUrl: URL
  try {
    targetUrl = new URL(body.url)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid URL format'
    })
  }

  // キャッシュチェック
  const cacheKey = targetUrl.toString()
  const cached = ogpCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }
  // 期限切れのエントリを削除
  if (cached) {
    ogpCache.delete(cacheKey)
  }

  try {
    // HTMLを取得
    const response = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en;q=0.9'
      },
      signal: AbortSignal.timeout(10000) // 10秒タイムアウト
    })

    if (!response.ok) {
      throw createError({
        statusCode: 502,
        statusMessage: `Failed to fetch URL: ${response.status}`
      })
    }

    const html = await response.text()

    // metascraperでOGP情報を抽出
    const metadata = await scraper({ html, url: targetUrl.toString() })

    const result = {
      title: metadata.title || null,
      description: metadata.description || null,
      image: metadata.image || null
    }

    // キャッシュに保存（上限超過時は最も古いエントリを削除）
    if (ogpCache.size >= CACHE_MAX_SIZE) {
      const oldestKey = ogpCache.keys().next().value!
      ogpCache.delete(oldestKey)
    }
    ogpCache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL })

    return result
  } catch (error) {
    // タイムアウトエラーの場合
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw createError({
        statusCode: 504,
        statusMessage: 'Request timeout'
      })
    }

    // 既にcreateErrorで作成されたエラーの場合はそのまま投げる
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('OGP fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch OGP data'
    })
  }
})
