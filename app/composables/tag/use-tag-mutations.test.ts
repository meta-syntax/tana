/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const mockToastAdd = vi.fn()

mockNuxtImport('useToast', () => {
  return () => ({ add: mockToastAdd })
})

describe('useTagMutations', () => {
  let mockRefreshTags: ReturnType<typeof vi.fn>
  let mockGetBookmarkTagIds: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockToastAdd.mockClear()
    mockRefreshTags = vi.fn()
    mockGetBookmarkTagIds = vi.fn().mockResolvedValue([])
  })

  describe('addTag', () => {
    it('成功時に Tag を返し refreshTags を呼ぶ', async () => {
      const mockTag = { id: 'tag-new', name: 'Vue', color: '#22c55e' }
      const supabase = {
        from: () => ({
          insert: () => ({
            select: () => ({
              single: () => ({ data: mockTag, error: null })
            })
          })
        })
      } as any
      const user = ref({ sub: 'user-1' }) as any

      const { useTagMutations } = await import('./use-tag-mutations')
      const { addTag } = useTagMutations({
        supabase,
        user,
        refreshTags: mockRefreshTags,
        getBookmarkTagIds: mockGetBookmarkTagIds
      })

      const result = await addTag({ name: 'Vue', color: '#22c55e' })
      expect(result).toEqual(mockTag)
      expect(mockRefreshTags).toHaveBeenCalled()
    })

    it('重複エラー(23505)でエラートースト表示し null を返す', async () => {
      const supabase = {
        from: () => ({
          insert: () => ({
            select: () => ({
              single: () => ({ data: null, error: { code: '23505', message: 'duplicate' } })
            })
          })
        })
      } as any
      const user = ref({ sub: 'user-1' }) as any

      const { useTagMutations } = await import('./use-tag-mutations')
      const { addTag } = useTagMutations({
        supabase,
        user,
        refreshTags: mockRefreshTags,
        getBookmarkTagIds: mockGetBookmarkTagIds
      })

      const result = await addTag({ name: 'Vue', color: '#22c55e' })
      expect(result).toBeNull()
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ description: '同じ名前のタグが既に存在します' })
      )
    })

    it('user 未設定で null を返す', async () => {
      const supabase = { from: vi.fn() } as any
      const user = ref(null) as any

      const { useTagMutations } = await import('./use-tag-mutations')
      const { addTag } = useTagMutations({
        supabase,
        user,
        refreshTags: mockRefreshTags,
        getBookmarkTagIds: mockGetBookmarkTagIds
      })

      const result = await addTag({ name: 'Vue', color: '#22c55e' })
      expect(result).toBeNull()
    })
  })

  describe('updateTag', () => {
    it('成功時に true を返し refreshTags を呼ぶ', async () => {
      const supabase = {
        from: () => ({
          update: () => ({
            eq: () => ({ error: null })
          })
        })
      } as any
      const user = ref({ sub: 'user-1' }) as any

      const { useTagMutations } = await import('./use-tag-mutations')
      const { updateTag } = useTagMutations({
        supabase,
        user,
        refreshTags: mockRefreshTags,
        getBookmarkTagIds: mockGetBookmarkTagIds
      })

      const result = await updateTag('tag-1', { name: 'React', color: '#3b82f6' })
      expect(result).toBe(true)
      expect(mockRefreshTags).toHaveBeenCalled()
    })

    it('エラー時に false を返しトーストを表示する', async () => {
      const supabase = {
        from: () => ({
          update: () => ({
            eq: () => ({ error: { message: 'failed' } })
          })
        })
      } as any
      const user = ref({ sub: 'user-1' }) as any

      const { useTagMutations } = await import('./use-tag-mutations')
      const { updateTag } = useTagMutations({
        supabase,
        user,
        refreshTags: mockRefreshTags,
        getBookmarkTagIds: mockGetBookmarkTagIds
      })

      const result = await updateTag('tag-1', { name: 'React', color: '#3b82f6' })
      expect(result).toBe(false)
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'タグの更新に失敗しました' })
      )
    })
  })

  describe('deleteTag', () => {
    it('成功時に true を返し成功トーストと refreshTags を呼ぶ', async () => {
      const supabase = {
        from: () => ({
          delete: () => ({
            eq: () => ({ error: null })
          })
        })
      } as any
      const user = ref({ sub: 'user-1' }) as any

      const { useTagMutations } = await import('./use-tag-mutations')
      const { deleteTag } = useTagMutations({
        supabase,
        user,
        refreshTags: mockRefreshTags,
        getBookmarkTagIds: mockGetBookmarkTagIds
      })

      const result = await deleteTag('tag-1')
      expect(result).toBe(true)
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'success' })
      )
      expect(mockRefreshTags).toHaveBeenCalled()
    })

    it('エラー時に false を返しエラートーストを表示する', async () => {
      const supabase = {
        from: () => ({
          delete: () => ({
            eq: () => ({ error: { message: 'failed' } })
          })
        })
      } as any
      const user = ref({ sub: 'user-1' }) as any

      const { useTagMutations } = await import('./use-tag-mutations')
      const { deleteTag } = useTagMutations({
        supabase,
        user,
        refreshTags: mockRefreshTags,
        getBookmarkTagIds: mockGetBookmarkTagIds
      })

      const result = await deleteTag('tag-1')
      expect(result).toBe(false)
      expect(mockToastAdd).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'タグの削除に失敗しました' })
      )
    })
  })

  describe('syncBookmarkTags', () => {
    it('追加のみの場合 insert が呼ばれる', async () => {
      const mockInsert = vi.fn().mockReturnValue({ error: null })
      mockGetBookmarkTagIds.mockResolvedValue([])

      const supabase = {
        from: (table: string) => {
          if (table === 'bookmark_tags') {
            return {
              select: () => ({
                eq: () => ({ data: [], error: null })
              }),
              insert: mockInsert
            }
          }
          return {}
        }
      } as any
      const user = ref({ sub: 'user-1' }) as any

      const { useTagMutations } = await import('./use-tag-mutations')
      const { syncBookmarkTags } = useTagMutations({
        supabase,
        user,
        refreshTags: mockRefreshTags,
        getBookmarkTagIds: mockGetBookmarkTagIds
      })

      const result = await syncBookmarkTags('bookmark-1', ['tag-1', 'tag-2'])
      expect(result).toBe(true)
      expect(mockRefreshTags).toHaveBeenCalled()
    })

    it('削除のみの場合 delete が呼ばれる', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        eq: () => ({
          in: () => ({ error: null })
        })
      })
      mockGetBookmarkTagIds.mockResolvedValue(['tag-1', 'tag-2'])

      const supabase = {
        from: (table: string) => {
          if (table === 'bookmark_tags') {
            return {
              select: () => ({
                eq: () => ({
                  data: [{ tag_id: 'tag-1' }, { tag_id: 'tag-2' }],
                  error: null
                })
              }),
              delete: mockDelete
            }
          }
          return {}
        }
      } as any
      const user = ref({ sub: 'user-1' }) as any

      const { useTagMutations } = await import('./use-tag-mutations')
      const { syncBookmarkTags } = useTagMutations({
        supabase,
        user,
        refreshTags: mockRefreshTags,
        getBookmarkTagIds: mockGetBookmarkTagIds
      })

      const result = await syncBookmarkTags('bookmark-1', [])
      expect(result).toBe(true)
      expect(mockRefreshTags).toHaveBeenCalled()
    })

    it('変更なしの場合 refreshTags が呼ばれない', async () => {
      mockGetBookmarkTagIds.mockResolvedValue(['tag-1'])

      const supabase = {
        from: () => ({
          select: () => ({
            eq: () => ({
              data: [{ tag_id: 'tag-1' }],
              error: null
            })
          })
        })
      } as any
      const user = ref({ sub: 'user-1' }) as any

      const { useTagMutations } = await import('./use-tag-mutations')
      const { syncBookmarkTags } = useTagMutations({
        supabase,
        user,
        refreshTags: mockRefreshTags,
        getBookmarkTagIds: mockGetBookmarkTagIds
      })

      const result = await syncBookmarkTags('bookmark-1', ['tag-1'])
      expect(result).toBe(true)
      expect(mockRefreshTags).not.toHaveBeenCalled()
    })
  })
})
