<script setup lang="ts">
import type { Bookmark, TagInput } from '~/types'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'ダッシュボード',
  robots: 'noindex, nofollow'
})

const {
  bookmarks, loading, stats,
  page, perPage, totalCount, sort, selectedTagIds,
  isDragEnabled, isReordering,
  search, changeSort, changePage, filterByTags,
  refreshBookmarks, addBookmark, updateBookmark, deleteBookmark,
  reorderBookmarks
} = useBookmarks()

const {
  tags,
  addTag, updateTag, deleteTag,
  syncBookmarkTags
} = useTags()

// 検索（debounce付き）
const searchQuery = ref('')
const debouncedQuery = refDebounced(searchQuery, 400)

watch(debouncedQuery, (query) => {
  search(query)
})

// モーダル制御
const {
  isModalOpen, editingBookmark,
  openAddModal, openEditModal,
  handleSave, handleCreateTagFromModal
} = useBookmarkModal({
  updateBookmark,
  addBookmark,
  syncBookmarkTags,
  refreshBookmarks,
  addTag
})

// 並び替え処理
const handleReorder = (newList: Bookmark[], oldIndex: number, newIndex: number) => {
  reorderBookmarks(newList, oldIndex, newIndex)
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

// タグ管理モーダル
const isTagManageModalOpen = ref(false)

const handleAddTag = async (input: TagInput) => {
  await addTag(input)
}

const handleUpdateTag = async (id: string, input: TagInput) => {
  await updateTag(id, input)
  await refreshBookmarks()
}

const handleDeleteTag = async (id: string) => {
  await deleteTag(id)
  selectedTagIds.value = selectedTagIds.value.filter(tagId => tagId !== id)
  await refreshBookmarks()
}
</script>

<template>
  <main class="py-4 sm:py-8">
    <UContainer class="space-y-6">
      <BookmarkList
        v-model:search-query="searchQuery"
        v-model:selected-tag-ids="selectedTagIds"
        :bookmarks="bookmarks"
        :loading="loading"
        :total-count="totalCount"
        :page="page"
        :per-page="perPage"
        :sort="sort"
        :stats="stats"
        :tags="tags ?? []"
        :is-drag-enabled="isDragEnabled"
        :is-reordering="isReordering"
        @add="openAddModal"
        @edit="openEditModal"
        @delete="handleDelete"
        @update:page="changePage"
        @update:sort="changeSort"
        @update:selected-tag-ids="filterByTags"
        @manage-tags="isTagManageModalOpen = true"
        @reorder="handleReorder"
      />
    </UContainer>

    <BookmarkModal
      v-model:open="isModalOpen"
      :bookmark="editingBookmark"
      :tags="tags ?? []"
      @save="handleSave"
      @create-tag="handleCreateTagFromModal"
    />

    <TagManageModal
      v-model:open="isTagManageModalOpen"
      :tags="tags ?? []"
      @add="handleAddTag"
      @update="handleUpdateTag"
      @delete="handleDeleteTag"
    />
  </main>
</template>
