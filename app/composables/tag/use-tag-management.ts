import type { TagInput, TagWithCount } from '~/types'
import { DEFAULT_TAG_COLOR } from '~/constants/tag-colors'

export const useTagManagement = () => {
  // 新規タグフォーム
  const newTagName = ref('')
  const newTagColor = ref(DEFAULT_TAG_COLOR)

  const prepareAdd = (): TagInput | null => {
    const name = newTagName.value.trim()
    if (!name) return null

    const input: TagInput = { name, color: newTagColor.value }
    newTagName.value = ''
    newTagColor.value = DEFAULT_TAG_COLOR
    return input
  }

  // 編集中タグ
  const editingTagId = ref<string | null>(null)
  const editingName = ref('')
  const editingColor = ref('')

  const startEdit = (tag: TagWithCount) => {
    editingTagId.value = tag.id
    editingName.value = tag.name
    editingColor.value = tag.color
  }

  const cancelEdit = () => {
    editingTagId.value = null
    editingName.value = ''
    editingColor.value = ''
  }

  const prepareSaveEdit = (): { id: string, input: TagInput } | null => {
    if (!editingTagId.value || !editingName.value.trim()) return null

    const result = {
      id: editingTagId.value,
      input: {
        name: editingName.value.trim(),
        color: editingColor.value
      }
    }
    cancelEdit()
    return result
  }

  // 削除
  const deletingTag = ref<TagWithCount | null>(null)
  const isDeleteModalOpen = ref(false)

  const confirmDelete = (tag: TagWithCount) => {
    deletingTag.value = tag
    isDeleteModalOpen.value = true
  }

  const prepareDelete = (): string | null => {
    if (!deletingTag.value) return null
    const id = deletingTag.value.id
    deletingTag.value = null
    isDeleteModalOpen.value = false
    return id
  }

  return {
    newTagName,
    newTagColor,
    prepareAdd,
    editingTagId,
    editingName,
    editingColor,
    startEdit,
    cancelEdit,
    prepareSaveEdit,
    deletingTag,
    isDeleteModalOpen,
    confirmDelete,
    prepareDelete
  }
}
