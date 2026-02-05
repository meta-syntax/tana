import type { Database, Tag, TagInput, TagRowWithCountJoin, TagWithCount } from '~/types'

export const useTags = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const toast = useToast()

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

  // タグ追加
  const addTag = async (input: TagInput): Promise<Tag | null> => {
    if (!user.value?.sub) return null

    const { data, error } = await supabase
      .from('tags')
      .insert({
        user_id: user.value.sub,
        name: input.name.trim(),
        color: input.color
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to add tag:', error)
      if (error.code === '23505') {
        toast.add({
          title: 'エラー',
          description: '同じ名前のタグが既に存在します',
          color: 'error'
        })
      } else {
        toast.add({
          title: 'エラー',
          description: 'タグの追加に失敗しました',
          color: 'error'
        })
      }
      return null
    }

    await refreshTags()
    return data as Tag
  }

  // タグ更新
  const updateTag = async (id: string, input: TagInput): Promise<boolean> => {
    const { error } = await supabase
      .from('tags')
      .update({
        name: input.name.trim(),
        color: input.color,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Failed to update tag:', error)
      toast.add({
        title: 'エラー',
        description: 'タグの更新に失敗しました',
        color: 'error'
      })
      return false
    }

    await refreshTags()
    return true
  }

  // タグ削除
  const deleteTag = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete tag:', error)
      toast.add({
        title: 'エラー',
        description: 'タグの削除に失敗しました',
        color: 'error'
      })
      return false
    }

    await refreshTags()
    toast.add({
      title: '削除完了',
      description: 'タグを削除しました',
      color: 'success'
    })
    return true
  }

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

  // ブックマークとタグの紐付け同期（差分計算）
  const syncBookmarkTags = async (bookmarkId: string, tagIds: string[]): Promise<boolean> => {
    const currentTagIds = await getBookmarkTagIds(bookmarkId)

    const toAdd = tagIds.filter(id => !currentTagIds.includes(id))
    const toRemove = currentTagIds.filter(id => !tagIds.includes(id))

    // 追加
    if (toAdd.length > 0) {
      const { error } = await supabase
        .from('bookmark_tags')
        .insert(toAdd.map(tagId => ({
          bookmark_id: bookmarkId,
          tag_id: tagId
        })))

      if (error) {
        console.error('Failed to add bookmark tags:', error)
        return false
      }
    }

    // 削除
    if (toRemove.length > 0) {
      const { error } = await supabase
        .from('bookmark_tags')
        .delete()
        .eq('bookmark_id', bookmarkId)
        .in('tag_id', toRemove)

      if (error) {
        console.error('Failed to remove bookmark tags:', error)
        return false
      }
    }

    if (toAdd.length > 0 || toRemove.length > 0) {
      await refreshTags()
    }

    return true
  }

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
