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

// レート制限（IPベース、スライディングウィンドウ）
const RATE_LIMIT_WINDOW = 60 * 1000 // 1分
const RATE_LIMIT_MAX = 20
const rateLimitMap = new Map<string, number[]>()

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) ?? []
  const valid = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)

  if (valid.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, valid)
    return false
  }

  valid.push(now)
  rateLimitMap.set(ip, valid)
  return true
}

export default defineEventHandler(async (event) => {
  // レート制限チェック
  const clientIp = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (!checkRateLimit(clientIp)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please try again later.'
    })
  }

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

  // HTTPSとHTTPのみ許可
  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Only HTTP and HTTPS protocols are allowed'
    })
  }

  // SSRF対策: ホスト名を検証
  await validateHost(targetUrl.hostname)

  // キャッシュチェック（LRU: ヒット時に再挿入して末尾へ移動）
  const cacheKey = targetUrl.toString()
  const cached = ogpCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    ogpCache.delete(cacheKey)
    ogpCache.set(cacheKey, cached)
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
      redirect: 'manual',
      signal: AbortSignal.timeout(10000) // 10秒タイムアウト
    })

    // リダイレクト先もSSRF検証
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location')
      if (location) {
        const redirectUrl = new URL(location, targetUrl)
        await validateHost(redirectUrl.hostname)
      }
      throw createError({
        statusCode: 502,
        statusMessage: `Redirect not followed: ${response.status}`
      })
    }

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

    // キャッシュに保存（上限超過時はLRUで最も古いエントリを削除）
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
