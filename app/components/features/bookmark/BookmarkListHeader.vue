<script setup lang="ts">
const emit = defineEmits<{
  add: []
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
</template>
