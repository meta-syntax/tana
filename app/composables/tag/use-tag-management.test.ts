import { describe, it, expect } from 'vitest'
import { useTagManagement } from './use-tag-management'
import type { TagWithCount } from '~/types'
import { DEFAULT_TAG_COLOR } from '~/constants/tag-colors'

const createMockTag = (overrides?: Partial<TagWithCount>): TagWithCount => ({
  id: 'tag-1',
  user_id: 'user-1',
  name: 'テストタグ',
  color: '#3b82f6',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  bookmark_count: 3,
  ...overrides
})

describe('useTagManagement', () => {
  describe('prepareAdd', () => {
    it('空文字の場合 null を返す', () => {
      const { newTagName, prepareAdd } = useTagManagement()
      newTagName.value = '  '
      expect(prepareAdd()).toBeNull()
    })

    it('有効な入力の場合 TagInput を返しフォームをリセットする', () => {
      const { newTagName, newTagColor, prepareAdd } = useTagManagement()
      newTagName.value = 'JavaScript'
      newTagColor.value = '#ef4444'

      const result = prepareAdd()

      expect(result).toEqual({ name: 'JavaScript', color: '#ef4444' })
      expect(newTagName.value).toBe('')
      expect(newTagColor.value).toBe(DEFAULT_TAG_COLOR)
    })
  })

  describe('startEdit / cancelEdit', () => {
    it('startEdit で編集状態がセットされる', () => {
      const tag = createMockTag({ id: 'tag-2', name: 'Vue', color: '#22c55e' })
      const { editingTagId, editingName, editingColor, startEdit } = useTagManagement()

      startEdit(tag)

      expect(editingTagId.value).toBe('tag-2')
      expect(editingName.value).toBe('Vue')
      expect(editingColor.value).toBe('#22c55e')
    })

    it('cancelEdit で編集状態がクリアされる', () => {
      const tag = createMockTag()
      const { editingTagId, editingName, editingColor, startEdit, cancelEdit } = useTagManagement()

      startEdit(tag)
      cancelEdit()

      expect(editingTagId.value).toBeNull()
      expect(editingName.value).toBe('')
      expect(editingColor.value).toBe('')
    })
  })

  describe('prepareSaveEdit', () => {
    it('editingTagId 未設定の場合 null を返す', () => {
      const { prepareSaveEdit } = useTagManagement()
      expect(prepareSaveEdit()).toBeNull()
    })

    it('editingName が空の場合 null を返す', () => {
      const { editingTagId, editingName, prepareSaveEdit } = useTagManagement()
      editingTagId.value = 'tag-1'
      editingName.value = '  '
      expect(prepareSaveEdit()).toBeNull()
    })

    it('有効な場合 { id, input } を返し編集状態をクリアする', () => {
      const tag = createMockTag({ id: 'tag-3', name: 'React', color: '#ec4899' })
      const { editingTagId, startEdit, editingName, prepareSaveEdit } = useTagManagement()

      startEdit(tag)
      editingName.value = 'React Native'

      const result = prepareSaveEdit()

      expect(result).toEqual({
        id: 'tag-3',
        input: { name: 'React Native', color: '#ec4899' }
      })
      expect(editingTagId.value).toBeNull()
    })
  })

  describe('confirmDelete / prepareDelete', () => {
    it('confirmDelete で削除対象と削除モーダルがセットされる', () => {
      const tag = createMockTag()
      const { deletingTag, isDeleteModalOpen, confirmDelete } = useTagManagement()

      confirmDelete(tag)

      expect(deletingTag.value).toEqual(tag)
      expect(isDeleteModalOpen.value).toBe(true)
    })

    it('prepareDelete で deletingTag 未設定なら null を返す', () => {
      const { prepareDelete } = useTagManagement()
      expect(prepareDelete()).toBeNull()
    })

    it('prepareDelete で有効な場合 id を返し状態をクリアする', () => {
      const tag = createMockTag({ id: 'tag-del' })
      const { deletingTag, isDeleteModalOpen, confirmDelete, prepareDelete } = useTagManagement()

      confirmDelete(tag)
      const id = prepareDelete()

      expect(id).toBe('tag-del')
      expect(deletingTag.value).toBeNull()
      expect(isDeleteModalOpen.value).toBe(false)
    })
  })
})
