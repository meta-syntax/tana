<script setup lang="ts">
import type { Bookmark, BookmarkInput } from '~/types'

definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'ダッシュボード',
  robots: 'noindex, nofollow'
})

const { bookmarks, loading, stats, filterBookmarks, addBookmark, updateBookmark, deleteBookmark } = useBookmarks()

// 検索
const searchQuery = ref('')
const debouncedQuery = refDebounced(searchQuery, 400)

const filteredBookmarks = computed(() => filterBookmarks(debouncedQuery.value))

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
const deleting = ref(false)

const handleDelete = async (bookmark: Bookmark) => {
  if (deleting.value) return

  deleting.value = true
  try {
    await deleteBookmark(bookmark.id)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <main class="py-8">
    <UContainer class="space-y-6">
      <DashboardStats :stats="stats" />

      <BookmarkList
        v-model:search-query="searchQuery"
        :bookmarks="filteredBookmarks"
        :loading="loading"
        :total-count="bookmarks.length"
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
