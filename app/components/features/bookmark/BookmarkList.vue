<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
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
  isDragEnabled?: boolean
  isReordering?: boolean
  isSelectionMode?: boolean
  selectedIds?: Set<string>
}

const props = withDefaults(defineProps<Props>(), {
  tags: () => [],
  isDragEnabled: false,
  isReordering: false,
  isSelectionMode: false,
  selectedIds: () => new Set<string>()
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
  'reorder': [newList: Bookmark[], oldIndex: number, newIndex: number]
  'toggle-select': [id: string]
  'bulk-delete': []
  'select-all': []
  'exit-selection': []
  'enter-selection': []
}>()

const {
  isSearching, displayedBookmarks, lastAppliedQuery,
  searchResultText, displayState
} = useBookmarkSearch({
  bookmarks: toRef(props, 'bookmarks'),
  searchQuery,
  selectedTagIds,
  totalCount: toRef(props, 'totalCount'),
  loading: toRef(props, 'loading')
})

// フィルター状態
const hasActiveFilters = computed(() =>
  searchQuery.value.trim() !== '' || selectedTagIds.value.length > 0
)

const clearAll = () => {
  searchQuery.value = ''
  selectedTagIds.value = []
}

// 選択モード時はドラッグ無効
const effectiveDragEnabled = computed(() =>
  props.isDragEnabled && !props.isSelectionMode
)

const selectedCount = computed(() => props.selectedIds.size)

// ドラッグ用ローカルリスト
const draggableList = ref<Bookmark[]>([])

watch(displayedBookmarks, (val) => {
  draggableList.value = [...val]
}, { immediate: true })

const onDragEnd = (e: { oldIndex?: number, newIndex?: number }) => {
  if (e.oldIndex == null || e.newIndex == null || e.oldIndex === e.newIndex) return
  emit('reorder', [...draggableList.value], e.oldIndex, e.newIndex)
}

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
    :is-selection-mode="props.isSelectionMode"
    @add="emit('add')"
    @manage-tags="emit('manage-tags')"
    @enter-selection="emit('enter-selection')"
    @exit-selection="emit('exit-selection')"
  />

  <BookmarkSearchBar
    v-model="searchQuery"
    :is-searching="isSearching"
    :search-result-text="searchResultText"
    :sort="props.sort"
    :has-active-filters="hasActiveFilters"
    @update:sort="emit('update:sort', $event)"
    @clear-all="clearAll"
  />

  <div
    v-if="props.tags.length > 0"
    class="space-y-2"
  >
    <div
      v-if="selectedTagIds.length > 0"
      class="flex items-center gap-2"
    >
      <span class="text-sm font-medium text-highlighted">
        {{ selectedTagIds.length }}件のタグで絞り込み中
      </span>
      <UButton
        size="xs"
        variant="soft"
        color="neutral"
        icon="i-heroicons-x-mark"
        @click="selectedTagIds = []"
      >
        解除
      </UButton>
    </div>
    <TagFilter
      v-model="selectedTagIds"
      :tags="props.tags"
    />
  </div>

  <BookmarkLoadingState
    v-if="displayState === 'initial-loading'"
    type="initial"
  />

  <BookmarkLoadingState
    v-else-if="displayState === 'searching'"
    type="searching"
  />

  <BookmarkLoadingState
    v-else-if="displayState === 'filtering'"
    type="filtering"
  />

  <BookmarkEmptyState
    v-else-if="displayState === 'search-empty'"
    type="search"
    :search-query="lastAppliedQuery"
    @clear-search="clearAll"
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

      <VueDraggable
        v-if="effectiveDragEnabled"
        v-model="draggableList"
        :class="[gridClass, { 'pointer-events-none': isPageLoading || isReordering }]"
        handle=".drag-handle"
        :animation="200"
        easing="ease-out"
        :delay="150"
        :delay-on-touch-only="true"
        ghost-class="drag-ghost"
        chosen-class="drag-chosen"
        drag-class="drag-active"
        @end="onDragEnd"
      >
        <BookmarkCard
          v-for="bookmark in draggableList"
          :key="bookmark.id"
          :bookmark="bookmark"
          :card-size="cardSize"
          :show-drag-handle="true"
          :is-selection-mode="props.isSelectionMode"
          :is-selected="props.selectedIds.has(bookmark.id)"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
          @toggle-select="emit('toggle-select', $event)"
        />
      </VueDraggable>

      <TransitionGroup
        v-else
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
          :is-selection-mode="props.isSelectionMode"
          :is-selected="props.selectedIds.has(bookmark.id)"
          :style="index < 9 ? { animationDelay: `${index * 50}ms` } : undefined"
          class="animate-fade-in"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
          @toggle-select="emit('toggle-select', $event)"
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

    <BookmarkBulkActionBar
      v-if="props.isSelectionMode"
      :selected-count="selectedCount"
      :total-count="displayedBookmarks.length"
      @select-all="emit('select-all')"
      @delete="emit('bulk-delete')"
      @cancel="emit('exit-selection')"
    />
  </template>
</template>
