<script setup lang="ts">
import type { RssFeed } from '~/types'

interface Props {
  feeds: RssFeed[]
  loading: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  add: []
  sync: [feed: RssFeed]
  delete: [feed: RssFeed]
  toggleActive: [feed: RssFeed]
}>()
</script>

<template>
  <div class="space-y-4">
    <!-- ヘッダー -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-highlighted">
          RSSフィード
        </h2>
        <p class="text-sm text-gray-500">
          {{ feeds.length }}件のフィード
        </p>
      </div>
      <UButton
        icon="i-heroicons-plus"
        size="sm"
        @click="emit('add')"
      >
        フィードを追加
      </UButton>
    </div>

    <!-- ローディング -->
    <div
      v-if="loading"
      class="space-y-3"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="h-24 animate-pulse rounded-xl bg-muted"
      />
    </div>

    <!-- 空状態 -->
    <FeedEmptyState
      v-else-if="feeds.length === 0"
      @add="emit('add')"
    />

    <!-- フィード一覧 -->
    <div
      v-else
      class="space-y-3"
    >
      <FeedCard
        v-for="feed in feeds"
        :key="feed.id"
        :feed="feed"
        @sync="emit('sync', feed)"
        @delete="emit('delete', feed)"
        @toggle-active="emit('toggleActive', feed)"
      />
    </div>
  </div>
</template>
