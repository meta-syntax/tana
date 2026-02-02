<script setup lang="ts">
interface Props {
  type: 'initial' | 'searching'
}

defineProps<Props>()
</script>

<template>
  <!-- 初回ローディング（スケルトン） -->
  <div
    v-if="type === 'initial'"
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

  <!-- 検索中のローディング -->
  <div
    v-else
    class="rounded-2xl border border-(--tana-border) bg-white p-12"
  >
    <div class="flex flex-col items-center justify-center gap-4">
      <div class="relative">
        <div class="size-12 rounded-full border-4 border-gray-100" />
        <div
          class="absolute inset-0 size-12 animate-spin rounded-full border-4 border-transparent border-t-(--tana-accent)"
        />
      </div>
      <p class="text-sm text-gray-500">
        検索中...
      </p>
    </div>
  </div>
</template>
