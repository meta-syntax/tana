import type { Ref } from 'vue'
import type { Bookmark } from '~/types'

type DisplayState = 'initial-loading' | 'searching' | 'search-empty' | 'initial-empty' | 'list'

interface UseBookmarkSearchOptions {
  bookmarks: Ref<Bookmark[]>
  searchQuery: Ref<string>
  totalCount: Ref<number>
  loading: Ref<boolean>
}

export const useBookmarkSearch = (options: UseBookmarkSearchOptions) => {
  const { bookmarks, searchQuery, totalCount, loading } = options

  const isSearching = ref(false)
  const displayedBookmarks = ref<Bookmark[]>([])
  const lastAppliedQuery = ref('')
  let searchTimerId: ReturnType<typeof setTimeout> | null = null

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

      if (searchQuery.value.trim()) {
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

  const isSearchEmpty = computed(() =>
    !isSearching.value && lastAppliedQuery.value.trim() !== '' && displayedBookmarks.value.length === 0
  )

  const searchResultText = computed(() => {
    if (!lastAppliedQuery.value.trim()) return ''
    return `${totalCount.value}件の結果`
  })

  const displayState = computed<DisplayState>(() => {
    if (loading.value && bookmarks.value.length === 0) return 'initial-loading'
    if (isSearching.value) return 'searching'
    if (isSearchEmpty.value) return 'search-empty'
    if (!loading.value && totalCount.value === 0 && !searchQuery.value.trim()) return 'initial-empty'
    return 'list'
  })

  return {
    isSearching,
    displayedBookmarks,
    lastAppliedQuery,
    isSearchEmpty,
    searchResultText,
    displayState
  }
}
