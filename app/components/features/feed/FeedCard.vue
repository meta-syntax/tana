<script setup lang="ts">
import type { RssFeed, FeedStatus } from '~/types'

interface Props {
  feed: RssFeed
}

const props = defineProps<Props>()

const emit = defineEmits<{
  sync: [feed: RssFeed]
  delete: [feed: RssFeed]
  toggleActive: [feed: RssFeed]
}>()

const feedStatus = computed<FeedStatus>(() => {
  if (!props.feed.is_active) return 'inactive'
  if (props.feed.error_count > 0) return 'error'
  return 'active'
})

const lastFetchedDate = computed(() => props.feed.last_fetched_at)
const { relativeTime, updateRelativeTime } = useRelativeTime(lastFetchedDate)

onMounted(() => {
  updateRelativeTime()
})

const syncing = ref(false)

const handleSync = () => {
  if (syncing.value) return
  syncing.value = true
  emit('sync', props.feed)
}

// フィードデータが更新されたらsyncing状態を解除
watch(() => props.feed.updated_at, () => {
  syncing.value = false
})

const displayUrl = computed(() => {
  try {
    return new URL(props.feed.url).hostname
  } catch {
    return props.feed.url
  }
})
</script>

<template>
  <div class="rounded-xl border border-(--tana-border) bg-default p-4 transition-shadow hover:shadow-md">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h3 class="truncate text-sm font-semibold text-highlighted">
            {{ feed.title || displayUrl }}
          </h3>
          <FeedStatusBadge :status="feedStatus" />
        </div>
        <p
          v-if="feed.description"
          class="mt-1 line-clamp-2 text-xs text-gray-500"
        >
          {{ feed.description }}
        </p>
        <div class="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <span class="flex items-center gap-1">
            <UIcon
              name="i-heroicons-link"
              class="size-3.5"
            />
            {{ displayUrl }}
          </span>
          <span
            v-if="relativeTime"
            class="flex items-center gap-1"
          >
            <UIcon
              name="i-heroicons-clock"
              class="size-3.5"
            />
            最終取得: {{ relativeTime }}
          </span>
        </div>
        <p
          v-if="feed.last_error"
          class="mt-2 truncate text-xs text-red-500"
        >
          {{ feed.last_error }}
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-1">
        <UButton
          icon="i-heroicons-arrow-path"
          variant="ghost"
          color="neutral"
          size="sm"
          :loading="syncing"
          :disabled="!feed.is_active"
          @click="handleSync"
        />
        <UButton
          :icon="feed.is_active ? 'i-heroicons-pause' : 'i-heroicons-play'"
          variant="ghost"
          color="neutral"
          size="sm"
          @click="emit('toggleActive', feed)"
        />
        <UButton
          icon="i-heroicons-trash"
          variant="ghost"
          color="error"
          size="sm"
          @click="emit('delete', feed)"
        />
      </div>
    </div>
  </div>
</template>
