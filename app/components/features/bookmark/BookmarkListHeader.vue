<script setup lang="ts">
interface Stats {
  total: number
  thisWeek: number
}

interface Props {
  stats: Stats
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: []
}>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
      <h2 class="text-xl font-bold text-(--tana-ink)">
        ブックマーク一覧
      </h2>
      <div class="flex items-center gap-3 text-sm text-gray-500">
        <span class="flex items-center gap-1">
          <UIcon
            name="i-heroicons-bookmark"
            class="size-4"
          />
          {{ props.stats.total }}件
        </span>
        <span class="text-gray-300">|</span>
        <span class="flex items-center gap-1">
          <UIcon
            name="i-heroicons-calendar"
            class="size-4"
          />
          今週 +{{ props.stats.thisWeek }}
        </span>
      </div>
    </div>
    <UButton
      icon="i-heroicons-plus"
      class="bg-(--tana-accent) text-white hover:bg-(--tana-accent-strong)"
      @click="emit('add')"
    >
      URLを追加
    </UButton>
  </div>
</template>
