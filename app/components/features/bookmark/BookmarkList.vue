<script setup lang="ts">
import type { Bookmark } from '~/types'

interface Props {
  bookmarks: Bookmark[]
  loading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: []
  edit: [bookmark: Bookmark]
  delete: [bookmark: Bookmark]
}>()
</script>

<template>
  <UCard class="border border-(--tana-border) bg-white">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <h2 class="text-xl font-bold text-(--tana-ink)">
          ブックマーク一覧
        </h2>
        <p class="text-sm text-gray-500">
          保存したURLがここに表示されます
        </p>
      </div>
      <UButton
        icon="i-heroicons-plus"
        class="bg-(--tana-accent) text-white hover:bg-(--tana-accent-strong)"
        @click="emit('add')"
      >
        URLを追加
      </UButton>
    </div>
  </UCard>

  <div
    v-if="props.loading && props.bookmarks.length === 0"
    class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
  >
    <div
      v-for="i in 6"
      :key="i"
      class="overflow-hidden rounded-xl border border-(--tana-border) bg-white"
    >
      <div class="aspect-video animate-pulse bg-gray-100" />
      <div class="space-y-3 p-4">
        <div class="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
        <div class="h-4 w-full animate-pulse rounded bg-gray-100" />
        <div class="flex justify-between">
          <div class="h-3 w-24 animate-pulse rounded bg-gray-100" />
          <div class="h-3 w-16 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </div>
  </div>

  <div
    v-else-if="!props.loading && props.bookmarks.length === 0"
    class="rounded-2xl border border-dashed border-(--tana-border) bg-white p-12 text-center"
  >
    <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-(--tana-accent)/10">
      <UIcon
        name="i-heroicons-bookmark"
        class="size-8 text-(--tana-accent)"
      />
    </div>
    <h3 class="text-lg font-semibold text-(--tana-ink)">
      ブックマークがありません
    </h3>
    <p class="mt-2 text-sm text-gray-500">
      「URLを追加」ボタンから最初のブックマークを保存しましょう
    </p>
    <UButton
      icon="i-heroicons-plus"
      class="mt-6 bg-(--tana-accent) text-white hover:bg-(--tana-accent-strong)"
      @click="emit('add')"
    >
      最初のブックマークを追加
    </UButton>
  </div>

  <div
    v-else
    class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
  >
    <BookmarkCard
      v-for="bookmark in props.bookmarks"
      :key="bookmark.id"
      :bookmark="bookmark"
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
    />
  </div>
</template>
