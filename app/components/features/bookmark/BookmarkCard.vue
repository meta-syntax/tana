<script setup lang="ts">
import type { Bookmark, CardSize } from '~/types'
import { extractHostname } from '~/utils/display-url'

interface Props {
  bookmark: Bookmark
  cardSize?: CardSize
  showDragHandle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cardSize: 'large',
  showDragHandle: false
})

const emit = defineEmits<{
  edit: [bookmark: Bookmark]
  delete: [bookmark: Bookmark]
}>()

const displayTitle = computed(() => props.bookmark.title || props.bookmark.url)
const displayUrl = computed(() => extractHostname(props.bookmark.url))

// 相対時間（クライアントサイドのみ）
const { relativeTime, updateRelativeTime } = useRelativeTime(
  computed(() => props.bookmark.created_at)
)

onMounted(updateRelativeTime)

// AI要約
const { loading: aiSummarizeLoading, error: aiSummarizeError, summarize } = useAiSummarize()
const localSummary = ref<string | null>(props.bookmark.summary ?? null)
const isSummaryExpanded = ref(false)

watch(() => props.bookmark.summary, (newSummary) => {
  if (newSummary) {
    localSummary.value = newSummary
  }
})

const handleSummarize = async () => {
  const result = await summarize(props.bookmark.id, props.bookmark.url)
  if (result) {
    localSummary.value = result
    isSummaryExpanded.value = true
  }
}

// 削除モーダル
const isDeleteModalOpen = ref(false)

const handleDelete = () => {
  isDeleteModalOpen.value = false
  emit('delete', props.bookmark)
}

// 動的クラス
const {
  cardClasses, thumbnailWrapperClasses, contentClasses,
  titleClasses, descriptionClasses
} = useBookmarkCardStyles(toRef(props, 'cardSize'), toRef(props, 'showDragHandle'))
</script>

<template>
  <div
    data-testid="bookmark-card"
    :class="cardClasses"
    class="group relative"
  >
    <div
      v-if="showDragHandle"
      class="drag-handle absolute left-2 top-2 z-10 flex cursor-grab items-center justify-center rounded-md bg-default/80 p-1 opacity-100 backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100 active:cursor-grabbing"
    >
      <UIcon
        name="i-heroicons-bars-3"
        class="size-5 text-muted"
      />
    </div>

    <div
      data-testid="bookmark-thumbnail"
      class="overflow-hidden transition-all duration-300"
      :class="thumbnailWrapperClasses"
    >
      <BookmarkThumbnail
        :url="bookmark.url"
        :thumbnail-url="bookmark.thumbnail_url"
        :title="displayTitle"
      />
    </div>

    <div
      class="transition-all duration-300"
      :class="contentClasses"
    >
      <a
        :href="bookmark.url"
        target="_blank"
        rel="noopener noreferrer"
        class="block"
      >
        <h3 :class="titleClasses">
          {{ displayTitle }}
        </h3>
      </a>

      <div
        v-if="bookmark.tags && bookmark.tags.length > 0 && cardSize !== 'small'"
        class="mt-1.5 flex flex-wrap gap-1"
      >
        <TagBadge
          v-for="tag in bookmark.tags"
          :key="tag.id"
          :name="tag.name"
          :color="tag.color"
        />
      </div>

      <div
        v-if="bookmark.description"
        data-testid="bookmark-description"
        class="overflow-hidden transition-all duration-300"
        :class="descriptionClasses"
      >
        <p class="line-clamp-2 text-sm text-muted">
          {{ bookmark.description }}
        </p>
      </div>

      <!-- AI要約: large -->
      <div
        v-if="cardSize === 'large'"
        class="mt-2"
        @click.prevent
      >
        <template v-if="localSummary">
          <button
            class="flex items-center gap-1 text-xs text-muted hover:text-highlighted transition-colors"
            @click="isSummaryExpanded = !isSummaryExpanded"
          >
            <UIcon
              name="i-heroicons-sparkles"
              class="size-3"
            />
            <span>AI要約</span>
            <UIcon
              :name="isSummaryExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
              class="size-3"
            />
          </button>
          <p
            v-if="isSummaryExpanded"
            class="mt-1 text-xs text-muted leading-relaxed"
          >
            {{ localSummary }}
          </p>
        </template>
        <template v-else>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-heroicons-sparkles"
            :loading="aiSummarizeLoading"
            @click="handleSummarize"
          >
            AIで要約
          </UButton>
          <span
            v-if="aiSummarizeError"
            class="ml-1 text-xs text-red-500"
          >
            {{ aiSummarizeError }}
          </span>
        </template>
      </div>

      <!-- AI要約: medium -->
      <div
        v-else-if="cardSize === 'medium'"
        class="mt-1.5"
        @click.prevent
      >
        <template v-if="localSummary">
          <UTooltip :text="localSummary">
            <p class="flex items-center gap-1 text-xs text-muted">
              <UIcon
                name="i-heroicons-sparkles"
                class="size-3 shrink-0"
              />
              <span class="line-clamp-1">{{ localSummary }}</span>
            </p>
          </UTooltip>
        </template>
        <template v-else>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-heroicons-sparkles"
            :loading="aiSummarizeLoading"
            @click="handleSummarize"
          >
            AIで要約
          </UButton>
          <span
            v-if="aiSummarizeError"
            class="ml-1 text-xs text-red-500"
          >
            {{ aiSummarizeError }}
          </span>
        </template>
      </div>

      <!-- AI要約: small（要約済みのみ表示） -->
      <div
        v-else-if="cardSize === 'small' && localSummary"
        class="mt-1"
        @click.prevent
      >
        <UTooltip :text="localSummary">
          <UIcon
            name="i-heroicons-sparkles"
            class="size-3.5 text-muted hover:text-highlighted transition-colors"
          />
        </UTooltip>
      </div>

      <BookmarkMeta
        :domain="displayUrl"
        :relative-time="relativeTime"
        :size="cardSize"
      />
    </div>

    <BookmarkActions
      @edit="emit('edit', bookmark)"
      @delete="isDeleteModalOpen = true"
    />

    <BookmarkDeleteModal
      v-model:open="isDeleteModalOpen"
      :title="displayTitle"
      @confirm="handleDelete"
    />
  </div>
</template>
