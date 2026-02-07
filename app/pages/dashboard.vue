<script setup lang="ts">
import type { Bookmark, TagInput } from '~/types'
import type { TabsItem } from '@nuxt/ui'

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
  refreshBookmarks, addBookmark, updateBookmark, deleteBookmark, bulkDeleteBookmarks,
  reorderBookmarks
} = useBookmarks()

// 選択モード
const {
  selectedIds, isSelectionMode, selectedCount, hasSelection,
  toggleSelection, selectAll, exitSelectionMode, enterSelectionMode
} = useBookmarkSelection()

// フィルタ/ページ変更時に選択をクリア
watch([selectedTagIds, () => page.value], () => {
  if (isSelectionMode.value) {
    exitSelectionMode()
  }
})

const {
  tags,
  addTag, updateTag, deleteTag,
  syncBookmarkTags
} = useTags()

const {
  feeds, feedsLoading,
  addFeed, deleteFeed, syncFeed, toggleFeedActive
} = useFeeds()

// フィード管理モーダル
const {
  isAddModalOpen: isFeedAddModalOpen,
  isDeleteModalOpen: isFeedDeleteModalOpen,
  deletingFeed,
  handleAddFeed, handleSyncFeed, handleConfirmDeleteFeed,
  handleDeleteFeed, handleToggleFeedActive
} = useFeedModal({
  addFeed, deleteFeed, syncFeed, toggleFeedActive, refreshBookmarks
})

// タブ管理
const activeTab = ref('bookmarks')

const tabItems: TabsItem[] = [
  {
    label: 'ブックマーク',
    icon: 'i-heroicons-bookmark',
    value: 'bookmarks',
    slot: 'bookmarks'
  },
  {
    label: 'RSSフィード',
    icon: 'i-heroicons-rss',
    value: 'feeds',
    slot: 'feeds'
  }
]

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

// 一括削除
const isBulkDeleteModalOpen = ref(false)
const bulkDeleting = ref(false)

const handleBulkDelete = async () => {
  if (bulkDeleting.value || !hasSelection.value) return

  bulkDeleting.value = true
  try {
    const ids = Array.from(selectedIds.value)
    await bulkDeleteBookmarks(ids)
    isBulkDeleteModalOpen.value = false
    exitSelectionMode()
  } finally {
    bulkDeleting.value = false
  }
}

const handleSelectAll = () => {
  selectAll(bookmarks.value.map(b => b.id))
}

// タグ管理モーダル
const isTagManageModalOpen = ref(false)

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
      <UTabs
        v-model="activeTab"
        :items="tabItems"
      >
        <template #bookmarks>
          <div class="space-y-6 pt-6">
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
              :is-selection-mode="isSelectionMode"
              :selected-ids="selectedIds"
              @add="openAddModal"
              @edit="openEditModal"
              @delete="handleDelete"
              @update:page="changePage"
              @update:sort="changeSort"
              @update:selected-tag-ids="filterByTags"
              @manage-tags="isTagManageModalOpen = true"
              @reorder="handleReorder"
              @enter-selection="enterSelectionMode"
              @exit-selection="exitSelectionMode"
              @toggle-select="toggleSelection"
              @select-all="handleSelectAll"
              @bulk-delete="isBulkDeleteModalOpen = true"
            />
          </div>
        </template>

        <template #feeds>
          <div class="space-y-6 pt-6">
            <FeedList
              :feeds="feeds ?? []"
              :loading="feedsLoading"
              @add="isFeedAddModalOpen = true"
              @sync="handleSyncFeed"
              @delete="handleConfirmDeleteFeed"
              @toggle-active="handleToggleFeedActive"
            />
          </div>
        </template>
      </UTabs>
    </UContainer>

    <BookmarkModal
      v-model:open="isModalOpen"
      :bookmark="editingBookmark"
      :tags="tags ?? []"
      :on-create-tag="handleCreateTagFromModal"
      @save="handleSave"
    />

    <TagManageModal
      v-model:open="isTagManageModalOpen"
      :tags="tags ?? []"
      @add="addTag"
      @update="handleUpdateTag"
      @delete="handleDeleteTag"
    />

    <BookmarkDeleteModal
      v-model:open="isBulkDeleteModalOpen"
      title=""
      :count="selectedCount"
      @confirm="handleBulkDelete"
    />

    <FeedAddModal
      v-model:open="isFeedAddModalOpen"
      @add="handleAddFeed"
    />

    <FeedDeleteModal
      v-model:open="isFeedDeleteModalOpen"
      :title="deletingFeed?.title || deletingFeed?.url || ''"
      @confirm="handleDeleteFeed"
    />
  </main>
</template>
