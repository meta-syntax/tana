import type { Bookmark, BookmarkInput, Tag, TagInput } from '~/types'

interface UseBookmarkModalOptions {
  updateBookmark: (id: string, data: BookmarkInput) => Promise<boolean>
  addBookmark: (data: BookmarkInput) => Promise<{ success: boolean, id: string | null }>
  syncBookmarkTags: (bookmarkId: string, tagIds: string[]) => Promise<boolean>
  refreshBookmarks: () => Promise<void>
  addTag: (input: TagInput) => Promise<Tag | null>
}

export const useBookmarkModal = (options: UseBookmarkModalOptions) => {
  const { updateBookmark, addBookmark, syncBookmarkTags, refreshBookmarks, addTag } = options

  const isModalOpen = ref(false)
  const editingBookmark = ref<Bookmark | null>(null)
  const saving = ref(false)

  const openAddModal = () => {
    editingBookmark.value = null
    isModalOpen.value = true
  }

  const openEditModal = (bookmark: Bookmark) => {
    editingBookmark.value = bookmark
    isModalOpen.value = true
  }

  const handleSave = async (data: BookmarkInput) => {
    if (saving.value) return
    saving.value = true

    try {
      const tagIds = data.tag_ids ?? []

      if (editingBookmark.value) {
        const success = await updateBookmark(editingBookmark.value.id, data)
        if (success) {
          await syncBookmarkTags(editingBookmark.value.id, tagIds)
          await refreshBookmarks()
          isModalOpen.value = false
          editingBookmark.value = null
        }
      } else {
        const result = await addBookmark(data)
        if (result.success && result.id) {
          if (tagIds.length > 0) {
            await syncBookmarkTags(result.id, tagIds)
            await refreshBookmarks()
          }
          isModalOpen.value = false
          editingBookmark.value = null
        }
      }
    } finally {
      saving.value = false
    }
  }

  const handleCreateTagFromModal = async (input: { name: string, color: string }) => {
    return await addTag(input)
  }

  return {
    isModalOpen,
    editingBookmark,
    saving: readonly(saving),
    openAddModal,
    openEditModal,
    handleSave,
    handleCreateTagFromModal
  }
}
