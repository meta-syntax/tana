<script setup lang="ts">
import type { Bookmark } from '~/types'

interface Props {
  bookmark: Bookmark
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [bookmark: Bookmark]
  delete: [bookmark: Bookmark]
}>()

// URLからドメインを抽出
const displayUrl = computed(() => {
  try {
    const url = new URL(props.bookmark.url)
    return url.hostname
  } catch {
    return props.bookmark.url
  }
})

// 相対時間を計算
const relativeTime = computed(() => {
  if (!props.bookmark.created_at) return ''
  const date = new Date(props.bookmark.created_at)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffDays > 30) {
    return date.toLocaleDateString('ja-JP')
  } else if (diffDays > 0) {
    return `${diffDays}日前`
  } else if (diffHours > 0) {
    return `${diffHours}時間前`
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分前`
  } else {
    return 'たった今'
  }
})

// 表示タイトル
const displayTitle = computed(() => {
  return props.bookmark.title || props.bookmark.url
})

const isDeleteModalOpen = ref(false)

const handleDelete = () => {
  isDeleteModalOpen.value = false
  emit('delete', props.bookmark)
}
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-xl border border-(--tana-border) bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
  >
    <!-- サムネイル -->
    <a
      :href="bookmark.url"
      target="_blank"
      rel="noopener noreferrer"
      class="block"
    >
      <div class="relative aspect-video overflow-hidden bg-gray-100">
        <img
          v-if="bookmark.thumbnail_url"
          :src="bookmark.thumbnail_url"
          :alt="displayTitle"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        >
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-linear-to-br from-gray-50 to-gray-100"
        >
          <UIcon
            name="i-heroicons-link"
            class="size-12 text-gray-300"
          />
        </div>
      </div>
    </a>

    <!-- コンテンツ -->
    <div class="p-4">
      <a
        :href="bookmark.url"
        target="_blank"
        rel="noopener noreferrer"
        class="block"
      >
        <h3 class="line-clamp-2 font-medium text-(--tana-ink) transition-colors hover:text-(--tana-accent)">
          {{ displayTitle }}
        </h3>
      </a>

      <p
        v-if="bookmark.description"
        class="mt-2 line-clamp-2 text-sm text-gray-500"
      >
        {{ bookmark.description }}
      </p>

      <div class="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span class="flex items-center gap-1">
          <UIcon
            name="i-heroicons-globe-alt"
            class="size-3.5"
          />
          {{ displayUrl }}
        </span>
        <span>{{ relativeTime }}</span>
      </div>
    </div>

    <!-- アクションボタン（ホバー時に表示） -->
    <div class="absolute right-2 top-2 flex gap-1 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
      <UButton
        icon="i-heroicons-pencil-square"
        size="xs"
        color="neutral"
        variant="solid"
        class="bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
        @click.prevent="emit('edit', bookmark)"
      />
      <UButton
        icon="i-heroicons-trash"
        size="xs"
        color="error"
        variant="solid"
        class="bg-white/90 shadow-sm backdrop-blur-sm hover:bg-red-50"
        @click.prevent="isDeleteModalOpen = true"
      />
    </div>

    <BookmarkDeleteModal
      v-model:open="isDeleteModalOpen"
      :title="displayTitle"
      @confirm="handleDelete"
    />
  </div>
</template>
