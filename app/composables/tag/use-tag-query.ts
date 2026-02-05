import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, TagRowWithCountJoin, TagWithCount } from '~/types'

interface UseTagQueryOptions {
  supabase: SupabaseClient<Database>
  user: ReturnType<typeof useSupabaseUser>
}

export const useTagQuery = (options: UseTagQueryOptions) => {
  const { supabase, user } = options

  // タグ一覧取得（件数付き）
  const { data: tags, status, refresh: refreshTags } = useLazyAsyncData(
    'tags',
    async () => {
      if (!user.value?.sub) return [] as TagWithCount[]

      const { data, error } = await supabase
        .from('tags')
        .select('*, bookmark_tags(count)')
        .eq('user_id', user.value.sub)
        .order('name')

      if (error) {
        console.error('Failed to fetch tags:', error)
        return [] as TagWithCount[]
      }

      const rows = (data ?? []) as TagRowWithCountJoin[]
      return rows.map((tag): TagWithCount => {
        const { bookmark_tags, ...rest } = tag
        return { ...rest, bookmark_count: bookmark_tags?.[0]?.count ?? 0 }
      })
    },
    {
      default: () => [] as TagWithCount[],
      watch: [user]
    }
  )

  const tagsLoading = computed(() => status.value === 'pending')

  // ブックマークに紐付くタグID取得
  const getBookmarkTagIds = async (bookmarkId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('bookmark_tags')
      .select('tag_id')
      .eq('bookmark_id', bookmarkId)

    if (error) {
      console.error('Failed to get bookmark tags:', error)
      return []
    }

    return (data ?? []).map(row => row.tag_id)
  }

  return {
    tags,
    tagsLoading,
    refreshTags,
    getBookmarkTagIds
  }
}
