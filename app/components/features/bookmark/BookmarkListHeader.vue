<script setup lang="ts">
interface Stats {
  total: number
  thisWeek: number
}

interface Props {
  stats: Stats
  isSelectionMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelectionMode: false
})

const emit = defineEmits<{
  'add': []
  'manage-tags': []
  'enter-selection': []
  'exit-selection': []
}>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
      <h2 class="text-xl font-bold text-highlighted">
        ブックマーク一覧
      </h2>
      <div class="flex items-center gap-3 text-sm text-muted">
        <span class="flex items-center gap-1">
          <UIcon
            name="i-heroicons-bookmark"
            class="size-4"
          />
          {{ props.stats.total }}件
        </span>
        <span class="text-dimmed">|</span>
        <span class="flex items-center gap-1">
          <UIcon
            name="i-heroicons-calendar"
            class="size-4"
          />
          今週 +{{ props.stats.thisWeek }}
        </span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <UButton
        v-if="props.isSelectionMode"
        variant="ghost"
        color="neutral"
        icon="i-heroicons-x-mark"
        @click="emit('exit-selection')"
      >
        キャンセル
      </UButton>
      <UButton
        v-else
        variant="ghost"
        color="neutral"
        icon="i-heroicons-check-circle"
        @click="emit('enter-selection')"
      >
        選択
      </UButton>
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-heroicons-tag"
        @click="emit('manage-tags')"
      >
        タグ管理
      </UButton>
      <UButton
        icon="i-heroicons-plus"
        class="bg-(--tana-accent) text-white hover:bg-(--tana-accent-strong)"
        @click="emit('add')"
      >
        URLを追加
      </UButton>
    </div>
  </div>
</template>
