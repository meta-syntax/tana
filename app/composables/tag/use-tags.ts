import type { Database } from '~/types'

export const useTags = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // クエリ
  const { tags, tagsLoading, refreshTags, getBookmarkTagIds }
    = useTagQuery({ supabase, user })

  // ミューテーション
  const { addTag, updateTag, deleteTag, syncBookmarkTags }
    = useTagMutations({ supabase, user, refreshTags, getBookmarkTagIds })

  return {
    tags,
    tagsLoading,
    refreshTags,
    addTag,
    updateTag,
    deleteTag,
    getBookmarkTagIds,
    syncBookmarkTags
  }
}
