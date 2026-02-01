<script setup lang="ts">
import type { Bookmark, BookmarkInput } from '~/types'

const { bookmarks, loading, stats, fetchBookmarks, addBookmark, updateBookmark, deleteBookmark } = useBookmarks()

definePageMeta({
  layout: 'dashboard'
})

// ブックマーク取得
onMounted(() => {
  fetchBookmarks()
})

// モーダル制御
const isModalOpen = ref(false)
const editingBookmark = ref<Bookmark | null>(null)

const openAddModal = () => {
  editingBookmark.value = null
  isModalOpen.value = true
}

const openEditModal = (bookmark: Bookmark) => {
  editingBookmark.value = bookmark
  isModalOpen.value = true
}

// 保存処理
const handleSave = async (data: BookmarkInput) => {
  let success = false

  if (editingBookmark.value) {
    success = await updateBookmark(editingBookmark.value.id, data)
  } else {
    success = await addBookmark(data)
  }

  if (success) {
    isModalOpen.value = false
    editingBookmark.value = null
  }
}

// 削除処理
const handleDelete = async (bookmark: Bookmark) => {
  await deleteBookmark(bookmark.id)
}
</script>

<template>
  <main class="py-8">
    <UContainer class="space-y-6">
      <DashboardStats :stats="stats" />

      <BookmarkList
        :bookmarks="bookmarks"
        :loading="loading"
        @add="openAddModal"
        @edit="openEditModal"
        @delete="handleDelete"
      />
    </UContainer>

    <BookmarkModal
      v-model:open="isModalOpen"
      :bookmark="editingBookmark"
      @save="handleSave"
    />
  </main>
</template>
