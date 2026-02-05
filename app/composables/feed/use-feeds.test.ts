import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useSupabaseClient', () => {
  return () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({ data: [], error: null })
        })
      }),
      update: () => ({
        eq: () => ({ error: null })
      })
    })
  })
})

mockNuxtImport('useSupabaseUser', () => {
  return () => ref({ sub: 'test-user-id' })
})

mockNuxtImport('useToast', () => {
  return () => ({ add: vi.fn() })
})

mockNuxtImport('useLazyAsyncData', () => {
  return (_key: string, _fn: () => unknown, options?: { default?: () => unknown }) => ({
    data: ref(options?.default ? options.default() : null),
    status: ref('success'),
    refresh: vi.fn()
  })
})

vi.stubGlobal('$fetch', vi.fn())

describe('useFeeds', () => {
  it('全プロパティが返却される', async () => {
    const { useFeeds } = await import('./use-feeds')
    const result = useFeeds()

    expect(result).toHaveProperty('feeds')
    expect(result).toHaveProperty('feedsLoading')
    expect(result).toHaveProperty('refreshFeeds')
    expect(result).toHaveProperty('addFeed')
    expect(result).toHaveProperty('deleteFeed')
    expect(result).toHaveProperty('syncFeed')
    expect(result).toHaveProperty('toggleFeedActive')
  })
})
