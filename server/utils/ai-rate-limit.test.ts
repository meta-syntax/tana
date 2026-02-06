import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockCreateError = vi.fn((opts: { statusCode: number, statusMessage: string }) => {
  const error = new Error(opts.statusMessage) as Error & { statusCode: number, statusMessage: string }
  error.statusCode = opts.statusCode
  error.statusMessage = opts.statusMessage
  return error
})
vi.stubGlobal('createError', mockCreateError)

// テストごとにユニークなユーザーIDを使用してストアの衝突を回避
let userCounter = 0
const uniqueUser = () => `user-${++userCounter}-${Date.now()}`

describe('checkAiRateLimit', () => {
  let checkAiRateLimit: (userId: string, action: string) => void

  beforeEach(async () => {
    vi.clearAllMocks()

    const mod = await import('./ai-rate-limit')
    checkAiRateLimit = mod.checkAiRateLimit
  })

  it('未登録actionは制限なく通過する', () => {
    const userId = uniqueUser()
    expect(() => checkAiRateLimit(userId, 'unknown-action')).not.toThrow()
    expect(() => checkAiRateLimit(userId, 'unknown-action')).not.toThrow()
  })

  it('制限内リクエストは正常通過する', () => {
    const userId = uniqueUser()
    for (let i = 0; i < 20; i++) {
      expect(() => checkAiRateLimit(userId, 'summarize')).not.toThrow()
    }
  })

  it('制限超過で429エラーを投げる', () => {
    const userId = uniqueUser()
    // summarize は 20回/日
    for (let i = 0; i < 20; i++) {
      checkAiRateLimit(userId, 'summarize')
    }

    expect(() => checkAiRateLimit(userId, 'summarize')).toThrowError(
      expect.objectContaining({
        statusCode: 429
      })
    )
  })

  it('期限切れタイムスタンプは除去される', () => {
    vi.useFakeTimers()
    const now = Date.now()
    vi.setSystemTime(now)

    const userId = uniqueUser()

    // 20回リクエスト（上限）
    for (let i = 0; i < 20; i++) {
      checkAiRateLimit(userId, 'summarize')
    }

    // 24時間経過
    vi.setSystemTime(now + 24 * 60 * 60 * 1000 + 1)

    // 期限切れのため再び利用可能
    expect(() => checkAiRateLimit(userId, 'summarize')).not.toThrow()

    vi.useRealTimers()
  })

  it('異なるユーザーは独立してカウントされる', () => {
    const userA = uniqueUser()
    const userB = uniqueUser()

    for (let i = 0; i < 20; i++) {
      checkAiRateLimit(userA, 'summarize')
    }

    // user-a は上限到達
    expect(() => checkAiRateLimit(userA, 'summarize')).toThrow()

    // user-b はまだ利用可能
    expect(() => checkAiRateLimit(userB, 'summarize')).not.toThrow()
  })
})
