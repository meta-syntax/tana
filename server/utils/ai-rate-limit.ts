const WINDOW_MS = 24 * 60 * 60 * 1000 // 24時間

const LIMITS: Record<string, number> = {
  'suggest-tags': 50,
  'summarize': 20
}

const rateLimitStore = new Map<string, number[]>()

export const checkAiRateLimit = (userId: string, action: string): void => {
  const limit = LIMITS[action]
  if (!limit) return

  const key = `${userId}:${action}`
  const now = Date.now()
  const timestamps = rateLimitStore.get(key) ?? []
  const valid = timestamps.filter(t => now - t < WINDOW_MS)

  if (valid.length >= limit) {
    rateLimitStore.set(key, valid)
    throw createError({
      statusCode: 429,
      statusMessage: `AI ${action} の利用上限（${limit}回/日）に達しました`
    })
  }

  valid.push(now)
  rateLimitStore.set(key, valid)
}
