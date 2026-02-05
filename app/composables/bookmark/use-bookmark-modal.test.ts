import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBookmarkModal } from './use-bookmark-modal'
import type { Bookmark, BookmarkInput } from '~/types'

const createMockBookmark = (): Bookmark => ({
  id: 'bookmark-1',
  user_id: 'user-1',
  url: 'https://example.com',
  title: 'Test Bookmark',
  description: null,
  thumbnail_url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
})

describe('useBookmarkModal', () => {
  let mockUpdateBookmark: ReturnType<typeof vi.fn>
  let mockAddBookmark: ReturnType<typeof vi.fn>
  let mockSyncBookmarkTags: ReturnType<typeof vi.fn>
  let mockRefreshBookmarks: ReturnType<typeof vi.fn>
  let mockAddTag: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockUpdateBookmark = vi.fn().mockResolvedValue(true)
    mockAddBookmark = vi.fn().mockResolvedValue({ success: true, id: 'new-bookmark-id' })
    mockSyncBookmarkTags = vi.fn().mockResolvedValue(true)
    mockRefreshBookmarks = vi.fn().mockResolvedValue(undefined)
    mockAddTag = vi.fn().mockResolvedValue({ id: 'new-tag', name: 'Test', color: '#3b82f6' })
  })

  const createModal = () => useBookmarkModal({
    updateBookmark: mockUpdateBookmark,
    addBookmark: mockAddBookmark,
    syncBookmarkTags: mockSyncBookmarkTags,
    refreshBookmarks: mockRefreshBookmarks,
    addTag: mockAddTag
  })

  it('openAddModal() で isModalOpen=true, editingBookmark=null', () => {
    const { isModalOpen, editingBookmark, openAddModal } = createModal()
    openAddModal()
    expect(isModalOpen.value).toBe(true)
    expect(editingBookmark.value).toBeNull()
  })

  it('openEditModal(bookmark) で isModalOpen=true, editingBookmark=bookmark', () => {
    const bookmark = createMockBookmark()
    const { isModalOpen, editingBookmark, openEditModal } = createModal()
    openEditModal(bookmark)
    expect(isModalOpen.value).toBe(true)
    expect(editingBookmark.value).toEqual(bookmark)
  })

  it('handleSave() 編集モード: updateBookmark→syncBookmarkTags→refreshBookmarks→モーダル閉じる', async () => {
    const bookmark = createMockBookmark()
    const { isModalOpen, openEditModal, handleSave } = createModal()

    openEditModal(bookmark)

    const data: BookmarkInput = {
      url: 'https://updated.com',
      title: 'Updated',
      tag_ids: ['tag-1']
    }

    await handleSave(data)

    expect(mockUpdateBookmark).toHaveBeenCalledWith('bookmark-1', data)
    expect(mockSyncBookmarkTags).toHaveBeenCalledWith('bookmark-1', ['tag-1'])
    expect(mockRefreshBookmarks).toHaveBeenCalled()
    expect(isModalOpen.value).toBe(false)
  })

  it('handleSave() 新規モード: addBookmark→syncBookmarkTags→refreshBookmarks→モーダル閉じる', async () => {
    const { isModalOpen, openAddModal, handleSave } = createModal()

    openAddModal()

    const data: BookmarkInput = {
      url: 'https://new.com',
      title: 'New',
      tag_ids: ['tag-1', 'tag-2']
    }

    await handleSave(data)

    expect(mockAddBookmark).toHaveBeenCalledWith(data)
    expect(mockSyncBookmarkTags).toHaveBeenCalledWith('new-bookmark-id', ['tag-1', 'tag-2'])
    expect(mockRefreshBookmarks).toHaveBeenCalled()
    expect(isModalOpen.value).toBe(false)
  })

  it('handleSave() 新規モード（タグなし）: addBookmark→syncBookmarkTags呼ばれない→モーダル閉じる', async () => {
    const { isModalOpen, openAddModal, handleSave } = createModal()

    openAddModal()

    const data: BookmarkInput = {
      url: 'https://new.com',
      title: 'New',
      tag_ids: []
    }

    await handleSave(data)

    expect(mockAddBookmark).toHaveBeenCalledWith(data)
    expect(mockSyncBookmarkTags).not.toHaveBeenCalled()
    expect(isModalOpen.value).toBe(false)
  })

  it('handleCreateTagFromModal() が addTag に委譲する', async () => {
    const { handleCreateTagFromModal } = createModal()

    const result = await handleCreateTagFromModal({ name: 'NewTag', color: '#ef4444' })

    expect(mockAddTag).toHaveBeenCalledWith({ name: 'NewTag', color: '#ef4444' })
    expect(result).toEqual({ id: 'new-tag', name: 'Test', color: '#3b82f6' })
  })
})
