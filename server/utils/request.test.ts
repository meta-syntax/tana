import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { H3Event } from 'h3'

const mockGetRouterParam = vi.fn()
vi.stubGlobal('getRouterParam', mockGetRouterParam)

describe('requireRouteParam', () => {
  beforeEach(() => {
    mockGetRouterParam.mockReset()
  })

  it('パラメータが存在する場合その値を返す', async () => {
    mockGetRouterParam.mockReturnValue('abc-123')

    const { requireRouteParam } = await import('./request')
    const result = requireRouteParam({} as H3Event, 'id')

    expect(result).toBe('abc-123')
    expect(mockGetRouterParam).toHaveBeenCalledWith({}, 'id')
  })

  it('パラメータがundefinedの場合400エラーを投げる', async () => {
    mockGetRouterParam.mockReturnValue(undefined)

    const { requireRouteParam } = await import('./request')

    expect(() => requireRouteParam({} as H3Event, 'id')).toThrow()
    try {
      requireRouteParam({} as H3Event, 'id')
    } catch (e: any) {
      expect(e.statusCode).toBe(400)
    }
  })

  it('エラーメッセージにパラメータ名が含まれる', async () => {
    mockGetRouterParam.mockReturnValue(undefined)

    const { requireRouteParam } = await import('./request')

    expect(() => requireRouteParam({} as H3Event, 'slug')).toThrow()
    try {
      requireRouteParam({} as H3Event, 'slug')
    } catch (e: any) {
      expect(e.statusMessage).toBe('slug is required')
    }
  })
})
