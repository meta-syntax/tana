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
      insert: () => ({
        select: () => ({
          single: () => ({ data: null, error: null })
        })
      }),
      update: () => ({
        eq: () => ({ error: null })
      }),
      delete: () => ({
        eq: () => ({
          error: null,
          in: () => ({ error: null })
        })
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

describe('useTags', () => {
  it('全プロパティが返却される', async () => {
    const { useTags } = await import('./use-tags')
    const result = useTags()

    expect(result).toHaveProperty('tags')
    expect(result).toHaveProperty('tagsLoading')
    expect(result).toHaveProperty('refreshTags')
    expect(result).toHaveProperty('addTag')
    expect(result).toHaveProperty('updateTag')
    expect(result).toHaveProperty('deleteTag')
    expect(result).toHaveProperty('getBookmarkTagIds')
    expect(result).toHaveProperty('syncBookmarkTags')
  })
})
