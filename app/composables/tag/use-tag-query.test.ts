import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockRefresh = vi.fn()

mockNuxtImport('useSupabaseClient', () => {
  return () => ({
    from: (table: string) => {
      if (table === 'tags') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                data: [
                  {
                    id: 'tag-1',
                    user_id: 'user-1',
                    name: 'Vue',
                    color: '#22c55e',
                    created_at: '',
                    updated_at: '',
                    bookmark_tags: [{ count: 5 }]
                  }
                ],
                error: null
              })
            })
          })
        }
      }
      if (table === 'bookmark_tags') {
        return {
          select: () => ({
            eq: () => ({
              data: [{ tag_id: 'tag-1' }, { tag_id: 'tag-2' }],
              error: null
            })
          })
        }
      }
      return {}
    }
  })
})

mockNuxtImport('useSupabaseUser', () => {
  return () => ref({ sub: 'test-user-id' })
})

mockNuxtImport('useLazyAsyncData', () => {
  return (_key: string, _fn: () => unknown, options?: { default?: () => unknown }) => ({
    data: ref(options?.default ? options.default() : null),
    status: ref('success'),
    refresh: mockRefresh
  })
})

describe('useTagQuery', () => {
  it('tags の初期値が空配列', async () => {
    const { useTagQuery } = await import('./use-tag-query')
    const supabase = { from: vi.fn() } as any
    const user = ref({ sub: 'test-user-id' }) as any

    const { tags } = useTagQuery({ supabase, user })
    expect(tags.value).toEqual([])
  })

  it('tagsLoading が status=pending で true', async () => {
    // useLazyAsyncData のステータスを pending にするためリモック
    mockNuxtImport('useLazyAsyncData', () => {
      return (_key: string, _fn: () => unknown, options?: { default?: () => unknown }) => ({
        data: ref(options?.default ? options.default() : null),
        status: ref('pending'),
        refresh: mockRefresh
      })
    })

    const { useTagQuery } = await import('./use-tag-query')
    const supabase = { from: vi.fn() } as any
    const user = ref({ sub: 'test-user-id' }) as any

    const { tagsLoading } = useTagQuery({ supabase, user })
    expect(tagsLoading.value).toBe(true)
  })

  it('getBookmarkTagIds() がタグID配列を返す', async () => {
    const { useTagQuery } = await import('./use-tag-query')
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            data: [{ tag_id: 'tag-1' }, { tag_id: 'tag-2' }],
            error: null
          })
        })
      })
    } as any
    const user = ref({ sub: 'test-user-id' }) as any

    const { getBookmarkTagIds } = useTagQuery({ supabase, user })
    const result = await getBookmarkTagIds('bookmark-1')
    expect(result).toEqual(['tag-1', 'tag-2'])
  })

  it('getBookmarkTagIds() エラー時に空配列を返す', async () => {
    const { useTagQuery } = await import('./use-tag-query')
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            data: null,
            error: { message: 'error' }
          })
        })
      })
    } as any
    const user = ref({ sub: 'test-user-id' }) as any

    const { getBookmarkTagIds } = useTagQuery({ supabase, user })
    const result = await getBookmarkTagIds('bookmark-1')
    expect(result).toEqual([])
  })
})
