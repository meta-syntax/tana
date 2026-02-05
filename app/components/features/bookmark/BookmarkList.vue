<script setup lang="ts">
import type { Bookmark, BookmarkSort, TagWithCount } from '~/types'

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
  tags?: TagWithCount[]
}

const props = withDefaults(defineProps<Props>(), {
  tags: () => []
})

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const selectedTagIds = defineModel<string[]>('selectedTagIds', { default: () => [] })

const emit = defineEmits<{
  'add': []
  'edit': [bookmark: Bookmark]
  'delete': [bookmark: Bookmark]
  'update:page': [page: number]
  'update:sort': [sort: BookmarkSort]
  'manage-tags': []
}>()

const {
  isSearching, displayedBookmarks, lastAppliedQuery,
  searchResultText, displayState
} = useBookmarkSearch({
  bookmarks: toRef(props, 'bookmarks'),
  searchQuery,
  totalCount: toRef(props, 'totalCount'),
  loading: toRef(props, 'loading')
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
const { skipTransition } = useTransitionControl({
  triggers: [toRef(props, 'page'), toRef(props, 'sort')],
  isLoading: isPageLoading
})
</script>

<template>
  <BookmarkListHeader
    :stats="props.stats"
    @add="emit('add')"
    @manage-tags="emit('manage-tags')"
  />

  <BookmarkSearchBar
    v-model="searchQuery"
    :is-searching="isSearching"
    :search-result-text="searchResultText"
    :sort="props.sort"
    @update:sort="emit('update:sort', $event)"
  />

  <TagFilter
    v-if="props.tags.length > 0"
    v-model="selectedTagIds"
    :tags="props.tags"
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
          class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-default/60 backdrop-blur-[1px]"
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
      data-testid="bookmark-pagination"
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
