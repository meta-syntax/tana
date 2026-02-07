import type { RssFeed, RssFeedInput } from '~/types'

interface UseFeedModalOptions {
  addFeed: (input: RssFeedInput) => Promise<RssFeed | null>
  deleteFeed: (id: string) => Promise<boolean>
  syncFeed: (id: string) => Promise<boolean>
  toggleFeedActive: (feed: RssFeed) => Promise<boolean>
  refreshBookmarks: () => Promise<void>
}

export const useFeedModal = (options: UseFeedModalOptions) => {
  const { addFeed, deleteFeed, syncFeed, toggleFeedActive, refreshBookmarks } = options

  const isAddModalOpen = ref(false)
  const isDeleteModalOpen = ref(false)
  const deletingFeed = ref<RssFeed | null>(null)

  const handleAddFeed = async (url: string) => {
    const result = await addFeed({ url })
    if (result) {
      isAddModalOpen.value = false
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
    isDeleteModalOpen.value = true
  }

  const handleDeleteFeed = async () => {
    if (!deletingFeed.value) return
    const success = await deleteFeed(deletingFeed.value.id)
    if (success) {
      isDeleteModalOpen.value = false
      deletingFeed.value = null
    }
  }

  const handleToggleFeedActive = (feed: RssFeed) => {
    toggleFeedActive(feed)
  }

  return {
    isAddModalOpen,
    isDeleteModalOpen,
    deletingFeed: readonly(deletingFeed),
    handleAddFeed,
    handleSyncFeed,
    handleConfirmDeleteFeed,
    handleDeleteFeed,
    handleToggleFeedActive
  }
}
