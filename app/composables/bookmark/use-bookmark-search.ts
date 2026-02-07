import type { Ref } from 'vue'
import type { Bookmark } from '~/types'

type DisplayState = 'initial-loading' | 'searching' | 'filtering' | 'search-empty' | 'initial-empty' | 'list'

interface UseBookmarkSearchOptions {
  bookmarks: Ref<Bookmark[]>
  searchQuery: Ref<string>
  selectedTagIds: Ref<string[]>
  totalCount: Ref<number>
  loading: Ref<boolean>
}

export const useBookmarkSearch = (options: UseBookmarkSearchOptions) => {
  const { bookmarks, searchQuery, selectedTagIds, totalCount, loading } = options

  const isSearching = ref(false)
  const displayedBookmarks = ref<Bookmark[]>([])
  const lastAppliedQuery = ref('')
  let searchTimerId: ReturnType<typeof setTimeout> | null = null

  // 検索またはタグフィルタがアクティブかどうか
  const isFilterActive = computed(() =>
    searchQuery.value.trim() !== '' || selectedTagIds.value.length > 0
  )

  const clearSearchTimer = () => {
    if (searchTimerId !== null) {
      clearTimeout(searchTimerId)
      searchTimerId = null
    }
  }

  watch(
    bookmarks,
    (newBookmarks) => {
      clearSearchTimer()

      if (isFilterActive.value) {
        isSearching.value = true
        searchTimerId = setTimeout(() => {
          displayedBookmarks.value = newBookmarks
          lastAppliedQuery.value = searchQuery.value
          isSearching.value = false
          searchTimerId = null
        }, 300)
      } else {
        displayedBookmarks.value = newBookmarks
        lastAppliedQuery.value = ''
        isSearching.value = false
      }
    },
    { immediate: true }
  )

  onScopeDispose(clearSearchTimer)

  const searchResultText = computed(() => {
    if (!lastAppliedQuery.value.trim()) return ''
    return `${totalCount.value}件の結果`
  })

  const displayState = computed<DisplayState>(() => {
    // 初回ロード中（データ未到着）
    if (loading.value && bookmarks.value.length === 0) return 'initial-loading'

    // 検索/フィルター実行中（結果待ち）
    if (isSearching.value) {
      return selectedTagIds.value.length > 0 && !searchQuery.value.trim()
        ? 'filtering'
        : 'searching'
    }

    // 結果が空
    if (displayedBookmarks.value.length === 0) {
      if (isFilterActive.value) return 'search-empty'
      if (!loading.value && totalCount.value === 0) return 'initial-empty'
    }

    return 'list'
  })

  return {
    isSearching,
    displayedBookmarks,
    lastAppliedQuery,
    searchResultText,
    displayState
  }
}
