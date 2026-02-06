import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockRefresh = vi.fn()
let mockStatus = ref('success')

mockNuxtImport('useLazyAsyncData', () => {
  return (_key: string, _fn: () => unknown, options?: { default?: () => unknown }) => ({
    data: ref(options?.default ? options.default() : null),
    status: mockStatus,
    refresh: mockRefresh
  })
})

describe('useFeedQuery', () => {
  it('feeds の初期値が空配列', async () => {
    mockStatus = ref('success')
    const { useFeedQuery } = await import('./use-feed-query')
    const supabase = { from: vi.fn() } as any
    const user = ref({ sub: 'test-user-id' }) as any

    const { feeds } = useFeedQuery({ supabase, user })
    expect(feeds.value).toEqual([])
  })

  it('feedsLoading が status=pending で true', async () => {
    mockStatus = ref('pending')
    const { useFeedQuery } = await import('./use-feed-query')
    const supabase = { from: vi.fn() } as any
    const user = ref({ sub: 'test-user-id' }) as any

    const { feedsLoading } = useFeedQuery({ supabase, user })
    expect(feedsLoading.value).toBe(true)
  })

  it('feedsLoading が status=success で false', async () => {
    mockStatus = ref('success')
    const { useFeedQuery } = await import('./use-feed-query')
    const supabase = { from: vi.fn() } as any
    const user = ref({ sub: 'test-user-id' }) as any

    const { feedsLoading } = useFeedQuery({ supabase, user })
    expect(feedsLoading.value).toBe(false)
  })

  it('refreshFeeds が返却される', async () => {
    mockStatus = ref('success')
    const { useFeedQuery } = await import('./use-feed-query')
    const supabase = { from: vi.fn() } as any
    const user = ref({ sub: 'test-user-id' }) as any

    const { refreshFeeds } = useFeedQuery({ supabase, user })
    expect(refreshFeeds).toBeDefined()
  })
})
