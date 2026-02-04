<script setup lang="ts">
import type { Bookmark, CardSize } from '~/types'

interface Props {
  bookmark: Bookmark
  cardSize?: CardSize
}

const props = withDefaults(defineProps<Props>(), {
  cardSize: 'large'
})

const emit = defineEmits<{
  edit: [bookmark: Bookmark]
  delete: [bookmark: Bookmark]
}>()

// 表示用データの計算
const displayTitle = computed(() => props.bookmark.title || props.bookmark.url)

const displayUrl = computed(() => {
  try {
    return new URL(props.bookmark.url).hostname
  } catch {
    return props.bookmark.url
  }
})

// 相対時間（クライアントサイドのみ）
const { relativeTime, updateRelativeTime } = useRelativeTime(
  computed(() => props.bookmark.created_at)
)

onMounted(updateRelativeTime)

// 削除モーダル
const isDeleteModalOpen = ref(false)

const handleDelete = () => {
  isDeleteModalOpen.value = false
  emit('delete', props.bookmark)
}

// 動的クラス
const cardClasses = computed(() => [
  'group relative overflow-hidden border border-(--tana-border) bg-default transition-all duration-300',
  props.cardSize === 'large'
    ? 'rounded-xl hover:-translate-y-1 hover:shadow-lg'
    : 'rounded-lg hover:shadow-md'
])

const thumbnailWrapperClasses = computed(() => ({
  'max-h-64 opacity-100': props.cardSize === 'large',
  'max-h-28 opacity-100': props.cardSize === 'medium',
  'max-h-0 opacity-0': props.cardSize === 'small'
}))

const contentClasses = computed(() => ({
  'p-4': props.cardSize === 'large',
  'p-2.5': props.cardSize !== 'large'
}))

const titleClasses = computed(() => [
  'font-medium text-highlighted transition-colors hover:text-(--tana-accent)',
  props.cardSize === 'large' ? 'line-clamp-2' : 'line-clamp-1 text-sm'
])

const descriptionClasses = computed(() => ({
  'max-h-20 opacity-100 mt-2': props.cardSize === 'large',
  'max-h-0 opacity-0 mt-0': props.cardSize !== 'large'
}))
</script>

<template>
  <div
    data-testid="bookmark-card"
    :class="cardClasses"
  >
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
        v-if="bookmark.description"
        data-testid="bookmark-description"
        class="overflow-hidden transition-all duration-300"
        :class="descriptionClasses"
      >
        <p class="line-clamp-2 text-sm text-gray-500">
          {{ bookmark.description }}
        </p>
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
