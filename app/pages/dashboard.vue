<script setup lang="ts">
import type { Bookmark, TagInput, RssFeed } from '~/types'
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
  refreshBookmarks, addBookmark, updateBookmark, deleteBookmark,
  reorderBookmarks
} = useBookmarks()

const {
  tags,
  addTag, updateTag, deleteTag,
  syncBookmarkTags
} = useTags()

const {
  feeds, feedsLoading,
  addFeed, deleteFeed, syncFeed, toggleFeedActive
} = useFeeds()

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

// フィード管理
const isFeedAddModalOpen = ref(false)
const isFeedDeleteModalOpen = ref(false)
const deletingFeed = ref<RssFeed | null>(null)

const handleAddFeed = async (url: string) => {
  const result = await addFeed({ url })
  if (result) {
    isFeedAddModalOpen.value = false
  }
}

const handleSyncFeed = async (feed: RssFeed) => {
  const success = await syncFeed(feed.id)
  if (success) {
    await refreshBookmarks()
  }
}

const handleConfirmDeleteFeed = (feed: RssFeed) => {
  deletingFeed.value = feed
  isFeedDeleteModalOpen.value = true
}

const handleDeleteFeed = async () => {
  if (!deletingFeed.value) return
  const success = await deleteFeed(deletingFeed.value.id)
  if (success) {
    isFeedDeleteModalOpen.value = false
    deletingFeed.value = null
  }
}

const handleToggleFeedActive = (feed: RssFeed) => {
  toggleFeedActive(feed)
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
              @add="openAddModal"
              @edit="openEditModal"
              @delete="handleDelete"
              @update:page="changePage"
              @update:sort="changeSort"
              @update:selected-tag-ids="filterByTags"
              @manage-tags="isTagManageModalOpen = true"
              @reorder="handleReorder"
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
