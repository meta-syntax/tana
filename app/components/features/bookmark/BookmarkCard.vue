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
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-xl border border-(--tana-border) bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
  >
    <BookmarkThumbnail
      :url="bookmark.url"
      :thumbnail-url="bookmark.thumbnail_url"
      :title="displayTitle"
    />

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

      <BookmarkMeta
        :domain="displayUrl"
        :relative-time="relativeTime"
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
