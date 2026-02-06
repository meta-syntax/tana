import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'

const mockServerSupabaseUser = vi.fn()

vi.mock('#supabase/server', () => ({
  serverSupabaseUser: mockServerSupabaseUser
}))

describe('requireAuth', () => {
  beforeEach(() => {
    mockServerSupabaseUser.mockReset()
  })

  it('認証済みユーザーのsubを返す', async () => {
    mockServerSupabaseUser.mockResolvedValue({ sub: 'user-123' })

    const { requireAuth } = await import('./auth')
    const result = await requireAuth({} as H3Event)

    expect(result).toBe('user-123')
  })

  it('ユーザーがnullの場合401エラーを投げる', async () => {
    mockServerSupabaseUser.mockResolvedValue(null)

    const { requireAuth } = await import('./auth')

    expect(requireAuth({} as H3Event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  })

  it('subが未定義の場合401エラーを投げる', async () => {
    mockServerSupabaseUser.mockResolvedValue({})

    const { requireAuth } = await import('./auth')

    expect(requireAuth({} as H3Event)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  })
})
