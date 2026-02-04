<script setup lang="ts">
import type { Bookmark, BookmarkSort } from '~/types'

interface Stats {
  total: number
  thisWeek: number
}

interface Props {
  bookmarks: Bookmark[]
  loading: boolean
  totalCount: number
  page: number
  perPage: number
  sort: BookmarkSort
  stats: Stats
}

const props = defineProps<Props>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })

const emit = defineEmits<{
  'add': []
  'edit': [bookmark: Bookmark]
  'delete': [bookmark: Bookmark]
  'update:page': [page: number]
  'update:sort': [sort: BookmarkSort]
}>()

// 検索状態の管理
const isSearching = ref(false)
const displayedBookmarks = ref<Bookmark[]>([])
const lastAppliedQuery = ref('')

// props.bookmarksの変更を検知
watch(
  () => props.bookmarks,
  (newBookmarks) => {
    if (searchQuery.value.trim()) {
      isSearching.value = true
      setTimeout(() => {
        displayedBookmarks.value = newBookmarks
        lastAppliedQuery.value = searchQuery.value
        isSearching.value = false
      }, 300)
    } else {
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
  return `${props.totalCount}件の結果`
})

// 表示する状態を決定
const displayState = computed(() => {
  if (props.loading && props.bookmarks.length === 0) return 'initial-loading'
  if (isSearching.value) return 'searching'
  if (isSearchEmpty.value) return 'search-empty'
  if (!props.loading && props.totalCount === 0 && !searchQuery.value.trim()) return 'initial-empty'
  return 'list'
})

// ページネーションの総ページ数
const totalPages = computed(() => Math.ceil(props.totalCount / props.perPage))

// ページ切り替え・ソート変更時のローディング（既にリスト表示中のとき）
const isPageLoading = computed(() =>
  props.loading && displayedBookmarks.value.length > 0
)

// カードサイズ
const { cardSize, gridClass } = useCardSize()

// ページ/ソート切り替え時はTransitionGroupアニメーションをスキップ
const skipTransition = ref(false)

watch([() => props.page, () => props.sort], () => {
  skipTransition.value = true
})

watch(isPageLoading, (loading) => {
  if (!loading && skipTransition.value) {
    nextTick(() => {
      skipTransition.value = false
    })
  }
})
</script>

<template>
  <BookmarkListHeader
    :stats="props.stats"
    @add="emit('add')"
  />

  <BookmarkSearchBar
    v-model="searchQuery"
    :is-searching="isSearching"
    :search-result-text="searchResultText"
    :sort="props.sort"
    @update:sort="emit('update:sort', $event)"
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

  <template v-else>
    <div class="relative">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isPageLoading"
          class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/60 backdrop-blur-[1px]"
        >
          <UIcon
            name="i-heroicons-arrow-path"
            class="size-8 animate-spin text-(--tana-accent)"
          />
        </div>
      </Transition>

      <TransitionGroup
        tag="div"
        :class="[gridClass, { 'pointer-events-none': isPageLoading }]"
        :enter-active-class="skipTransition ? '' : 'transition-all duration-300 ease-out'"
        :enter-from-class="skipTransition ? '' : 'opacity-0 scale-95'"
        :enter-to-class="skipTransition ? '' : 'opacity-100 scale-100'"
        :leave-active-class="skipTransition ? 'hidden' : 'transition-all duration-200 ease-in'"
        :leave-from-class="skipTransition ? '' : 'opacity-100 scale-100'"
        :leave-to-class="skipTransition ? '' : 'opacity-0 scale-95'"
        :move-class="skipTransition ? '' : 'transition-all duration-300 ease-out'"
      >
        <BookmarkCard
          v-for="(bookmark, index) in displayedBookmarks"
          :key="bookmark.id"
          :bookmark="bookmark"
          :card-size="cardSize"
          :style="index < 9 ? { animationDelay: `${index * 50}ms` } : undefined"
          class="animate-fade-in"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
        />
      </TransitionGroup>
    </div>

    <div
      v-if="totalPages > 1"
      class="flex justify-center pt-4"
    >
      <UPagination
        :page="props.page"
        :total="props.totalCount"
        :items-per-page="props.perPage"
        :sibling-count="1"
        show-edges
        @update:page="emit('update:page', $event)"
      />
    </div>
  </template>
</template>
