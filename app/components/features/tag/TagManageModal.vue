<script setup lang="ts">
import type { TagInput, TagWithCount } from '~/types'
import { DEFAULT_TAG_COLOR } from '~/constants/tag-colors'

interface Props {
  tags: TagWithCount[]
}

const props = defineProps<Props>()

const isOpen = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  add: [input: TagInput]
  update: [id: string, input: TagInput]
  delete: [id: string]
}>()

// 新規タグフォーム
const newTagName = ref('')
const newTagColor = ref(DEFAULT_TAG_COLOR)

const handleAdd = () => {
  const name = newTagName.value.trim()
  if (!name) return

  emit('add', { name, color: newTagColor.value })
  newTagName.value = ''
  newTagColor.value = DEFAULT_TAG_COLOR
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

const saveEdit = () => {
  if (!editingTagId.value || !editingName.value.trim()) return

  emit('update', editingTagId.value, {
    name: editingName.value.trim(),
    color: editingColor.value
  })
  cancelEdit()
}

// 削除
const deletingTag = ref<TagWithCount | null>(null)
const isDeleteModalOpen = ref(false)

const confirmDelete = (tag: TagWithCount) => {
  deletingTag.value = tag
  isDeleteModalOpen.value = true
}

const handleDelete = () => {
  if (!deletingTag.value) return
  emit('delete', deletingTag.value.id)
  deletingTag.value = null
  isDeleteModalOpen.value = false
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="タグ管理"
    description="タグの追加・編集・削除ができます"
  >
    <template #body>
      <div class="space-y-5">
        <!-- 新規追加フォーム -->
        <form
          class="space-y-3"
          @submit.prevent="handleAdd"
        >
          <div class="flex gap-2">
            <UInput
              v-model="newTagName"
              placeholder="新しいタグ名..."
              size="lg"
              class="flex-1"
            />
            <UButton
              type="submit"
              :disabled="!newTagName.trim()"
              icon="i-heroicons-plus"
              class="bg-(--tana-accent) text-white hover:bg-(--tana-accent-strong)"
            >
              追加
            </UButton>
          </div>
          <TagColorPicker v-model="newTagColor" />
        </form>

        <USeparator />

        <!-- タグ一覧 -->
        <div
          v-if="props.tags.length === 0"
          class="py-4 text-center text-sm text-muted"
        >
          タグがまだありません
        </div>

        <ul
          v-else
          class="space-y-2"
        >
          <li
            v-for="tag in props.tags"
            :key="tag.id"
            class="rounded-lg border border-default p-3"
          >
            <!-- 表示モード -->
            <div
              v-if="editingTagId !== tag.id"
              class="flex items-center gap-3"
            >
              <TagBadge
                :name="tag.name"
                :color="tag.color"
              />
              <span class="text-xs text-muted">
                {{ tag.bookmark_count }}件
              </span>
              <div class="ml-auto flex items-center gap-1">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  icon="i-heroicons-pencil-square"
                  @click="startEdit(tag)"
                />
                <UButton
                  variant="ghost"
                  color="error"
                  size="xs"
                  icon="i-heroicons-trash"
                  @click="confirmDelete(tag)"
                />
              </div>
            </div>

            <!-- 編集モード -->
            <div
              v-else
              class="space-y-2"
            >
              <div class="flex gap-2">
                <UInput
                  v-model="editingName"
                  size="sm"
                  class="flex-1"
                  @keyup.enter="saveEdit"
                  @keyup.escape="cancelEdit"
                />
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  @click="cancelEdit"
                >
                  キャンセル
                </UButton>
                <UButton
                  size="xs"
                  :disabled="!editingName.trim()"
                  class="bg-(--tana-accent) text-white hover:bg-(--tana-accent-strong)"
                  @click="saveEdit"
                >
                  保存
                </UButton>
              </div>
              <TagColorPicker v-model="editingColor" />
            </div>
          </li>
        </ul>
      </div>
    </template>
  </UModal>

  <!-- 削除確認モーダル -->
  <TagDeleteModal
    v-if="deletingTag"
    v-model:open="isDeleteModalOpen"
    :tag-name="deletingTag.name"
    :bookmark-count="deletingTag.bookmark_count"
    @confirm="handleDelete"
  />
</template>
