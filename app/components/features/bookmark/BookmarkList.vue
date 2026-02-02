<script setup lang="ts">
import type { Bookmark } from '~/types'

interface Props {
  bookmarks: Bookmark[]
  loading: boolean
  totalCount: number
}

const props = defineProps<Props>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })

const emit = defineEmits<{
  add: []
  edit: [bookmark: Bookmark]
  delete: [bookmark: Bookmark]
}>()

// 検索状態の管理
const isSearching = ref(false)
const displayedBookmarks = ref<Bookmark[]>([])
const lastAppliedQuery = ref('')

// props.bookmarksの変更を検知（debounce後に発火）
watch(
  () => props.bookmarks,
  (newBookmarks) => {
    if (searchQuery.value.trim()) {
      // 検索クエリがある場合はアニメーション演出
      isSearching.value = true
      setTimeout(() => {
        displayedBookmarks.value = newBookmarks
        lastAppliedQuery.value = searchQuery.value
        isSearching.value = false
      }, 300)
    } else {
      // 検索クリア時は即座に表示
      displayedBookmarks.value = newBookmarks
      lastAppliedQuery.value = ''
      isSearching.value = false
    }
  },
  { immediate: true }
)

// 検索結果が0件かどうか
const isSearchEmpty = computed(() =>
  !isSearching.value && lastAppliedQuery.value.trim() !== '' && displayedBookmarks.value.length === 0
)

// 検索結果の件数表示
const searchResultText = computed(() => {
  if (!lastAppliedQuery.value.trim()) return ''
  return `${displayedBookmarks.value.length}件の結果`
})

// 表示する状態を決定
const displayState = computed(() => {
  if (props.loading && props.bookmarks.length === 0) return 'initial-loading'
  if (isSearching.value) return 'searching'
  if (isSearchEmpty.value) return 'search-empty'
  if (!props.loading && props.totalCount === 0) return 'initial-empty'
  return 'list'
})
</script>

<template>
  <BookmarkListHeader @add="emit('add')" />

  <BookmarkSearchBar
    v-model="searchQuery"
    :is-searching="isSearching"
    :search-result-text="searchResultText"
  />

  <BookmarkLoadingState
    v-if="displayState === 'initial-loading'"
    type="initial"
  />

  <BookmarkLoadingState
    v-else-if="displayState === 'searching'"
    type="searching"
  />

  <BookmarkEmptyState
    v-else-if="displayState === 'search-empty'"
    type="search"
    :search-query="lastAppliedQuery"
    @clear-search="searchQuery = ''"
  />

  <BookmarkEmptyState
    v-else-if="displayState === 'initial-empty'"
    type="initial"
    @add="emit('add')"
  />

  <TransitionGroup
    v-else
    tag="div"
    class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
    move-class="transition-all duration-300 ease-out"
  >
    <BookmarkCard
      v-for="(bookmark, index) in displayedBookmarks"
      :key="bookmark.id"
      :bookmark="bookmark"
      :style="{ animationDelay: `${index * 50}ms` }"
      class="animate-fade-in"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
    />
  </TransitionGroup>
</template>
