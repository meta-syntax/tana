import type { Database } from '~/types'

export const useFeeds = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const { feeds, feedsLoading, refreshFeeds }
    = useFeedQuery({ supabase, user })

  const { addFeed, deleteFeed, syncFeed, toggleFeedActive }
    = useFeedMutations({ refreshFeeds })

  return {
    feeds,
    feedsLoading,
    refreshFeeds,
    addFeed,
    deleteFeed,
    syncFeed,
    toggleFeedActive
  }
}
