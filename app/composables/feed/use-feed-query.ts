import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, RssFeed } from '~/types'

interface UseFeedQueryOptions {
  supabase: SupabaseClient<Database>
  user: ReturnType<typeof useSupabaseUser>
}

export const useFeedQuery = (options: UseFeedQueryOptions) => {
  const { supabase, user } = options

  const { data: feeds, status, refresh: refreshFeeds } = useLazyAsyncData(
    'rss-feeds',
    async () => {
      if (!user.value?.sub) return [] as RssFeed[]

      const { data, error } = await supabase
        .from('rss_feeds')
        .select('*')
        .eq('user_id', user.value.sub)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch feeds:', error)
        return [] as RssFeed[]
      }

      return (data ?? []) as RssFeed[]
    },
    {
      default: () => [] as RssFeed[],
      watch: [user]
    }
  )

  const feedsLoading = computed(() => status.value === 'pending')

  return {
    feeds,
    feedsLoading,
    refreshFeeds
  }
}
