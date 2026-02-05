import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockRefresh = vi.fn()

mockNuxtImport('useSupabaseClient', () => {
  return () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          range: () => ({ data: [], error: null, count: 0 })
        }),
        gte: () => ({ count: 0 })
      }),
      or: () => ({
        order: () => ({
          range: () => ({ data: [], error: null, count: 0 })
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
    refresh: mockRefresh
  })
})

describe('useBookmarks', () => {
  beforeEach(() => {
    mockRefresh.mockClear()
  })

  it('sort の初期値が { field: "created_at", order: "desc" }', async () => {
    const { useBookmarks } = await import('./use-bookmarks')
    const { sort } = useBookmarks()
    expect(sort.value).toEqual({ field: 'created_at', order: 'desc' })
  })

  it('search() が page を 1 にリセット', async () => {
    const { useBookmarks } = await import('./use-bookmarks')
    const { page, search } = useBookmarks()
    page.value = 3
    search('test query')
    expect(page.value).toBe(1)
  })

  it('changeSort() が page を 1 にリセット', async () => {
    const { useBookmarks } = await import('./use-bookmarks')
    const { page, changeSort } = useBookmarks()
    page.value = 5
    changeSort({ field: 'title', order: 'asc' })
    expect(page.value).toBe(1)
  })

  it('changePage() がページ番号を設定', async () => {
    const { useBookmarks } = await import('./use-bookmarks')
    const { page, changePage } = useBookmarks()
    changePage(3)
    expect(page.value).toBe(3)
  })

  it('filterByTags() が selectedTagIds をセットし page を 1 にリセット', async () => {
    const { useBookmarks } = await import('./use-bookmarks')
    const { page, selectedTagIds, filterByTags } = useBookmarks()
    page.value = 5
    filterByTags(['tag-1', 'tag-2'])
    expect(selectedTagIds.value).toEqual(['tag-1', 'tag-2'])
    expect(page.value).toBe(1)
  })
})
