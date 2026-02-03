<script setup lang="ts">
import type { Bookmark, BookmarkInput, BookmarkSort } from '~/types'

definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'ダッシュボード',
  robots: 'noindex, nofollow'
})

const {
  bookmarks, loading, stats,
  page, perPage, totalCount, sort,
  search, changeSort, changePage,
  addBookmark, updateBookmark, deleteBookmark
} = useBookmarks()

// 検索（debounce付き）
const searchQuery = ref('')
const debouncedQuery = refDebounced(searchQuery, 400)

watch(debouncedQuery, (query) => {
  search(query)
})

// ソート変更
const handleSortChange = (newSort: BookmarkSort) => {
  changeSort(newSort)
}

// ページ変更
const handlePageChange = (newPage: number) => {
  changePage(newPage)
}

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
  let success: boolean

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
  <main class="py-4 sm:py-8">
    <UContainer class="space-y-6">
      <BookmarkList
        v-model:search-query="searchQuery"
        :bookmarks="bookmarks"
        :loading="loading"
        :total-count="totalCount"
        :page="page"
        :per-page="perPage"
        :sort="sort"
        :stats="stats"
        @add="openAddModal"
        @edit="openEditModal"
        @delete="handleDelete"
        @update:page="handlePageChange"
        @update:sort="handleSortChange"
      />
    </UContainer>

    <BookmarkModal
      v-model:open="isModalOpen"
      :bookmark="editingBookmark"
      @save="handleSave"
    />
  </main>
</template>
