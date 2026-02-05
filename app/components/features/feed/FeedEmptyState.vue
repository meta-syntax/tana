<script setup lang="ts">
const emit = defineEmits<{
  add: []
}>()
</script>

<template>
  <div class="rounded-2xl border border-dashed border-(--tana-border) bg-default p-12 text-center">
    <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
      <UIcon
        name="i-heroicons-rss"
        class="size-8 text-gray-400"
      />
    </div>
    <h3 class="text-lg font-semibold text-highlighted">
      RSSフィードが未登録です
    </h3>
    <p class="mt-2 text-sm text-gray-500">
      RSSフィードを追加すると、新着記事が自動的にブックマークに追加されます
    </p>
    <UButton
      icon="i-heroicons-plus"
      class="mt-6"
      @click="emit('add')"
    >
      フィードを追加
    </UButton>
  </div>
</template>
