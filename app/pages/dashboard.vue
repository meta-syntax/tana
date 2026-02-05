<script setup lang="ts">
import type { Bookmark, BookmarkInput, BookmarkSort, TagInput } from '~/types'

definePageMeta({
  layout: 'dashboard'
})

useSeoMeta({
  title: 'ダッシュボード',
  robots: 'noindex, nofollow'
})

const {
  bookmarks, loading, stats,
  page, perPage, totalCount, sort, selectedTagIds,
  search, changeSort, changePage, filterByTags,
  refreshBookmarks, addBookmark, updateBookmark, deleteBookmark
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

// ソート変更
const handleSortChange = (newSort: BookmarkSort) => {
  changeSort(newSort)
}

// ページ変更
const handlePageChange = (newPage: number) => {
  changePage(newPage)
}

// タグフィルター変更
const handleTagFilterChange = (tagIds: string[]) => {
  filterByTags(tagIds)
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
}

// モーダル内でタグ新規作成
const handleCreateTagFromModal = async (input: { name: string, color: string }) => {
  const tag = await addTag(input)
  if (tag && editingBookmark.value) {
    // 編集中のフォームに新タグを追加するため、refreshTagsで反映
  }
  return tag
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
  // フィルターから削除されたタグを除去
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
        @add="openAddModal"
        @edit="openEditModal"
        @delete="handleDelete"
        @update:page="handlePageChange"
        @update:sort="handleSortChange"
        @update:selected-tag-ids="handleTagFilterChange"
        @manage-tags="isTagManageModalOpen = true"
      />
    </UContainer>

    <BookmarkModal
      v-model:open="isModalOpen"
      :bookmark="editingBookmark"
      :tags="(tags as any) ?? []"
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
