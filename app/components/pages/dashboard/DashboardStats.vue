<script setup lang="ts">
interface Stats {
  total: number
  pendingOgp: number
  thisWeek: number
}

interface Props {
  stats: Stats
}

const props = defineProps<Props>()
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <UCard class="border border-(--tana-border) bg-white">
      <div class="space-y-2">
        <p class="text-sm text-gray-500">
          総ブックマーク
        </p>
        <p class="text-3xl font-bold text-(--tana-ink)">
          {{ props.stats.total }}
        </p>
        <p class="text-xs text-gray-400">
          {{ props.stats.total === 0 ? '最初のURLを保存しましょう' : '件のブックマークを保存中' }}
        </p>
      </div>
    </UCard>
    <UCard class="border border-(--tana-border) bg-white">
      <div class="space-y-2">
        <p class="text-sm text-gray-500">
          OGP取得待ち
        </p>
        <p class="text-3xl font-bold text-(--tana-ink)">
          {{ props.stats.pendingOgp }}
        </p>
        <p class="text-xs text-gray-400">
          {{ props.stats.pendingOgp === 0 ? 'すべて取得済み' : '自動補完を待っています' }}
        </p>
      </div>
    </UCard>
    <UCard class="border border-(--tana-border) bg-white">
      <div class="space-y-2">
        <p class="text-sm text-gray-500">
          今週の追加数
        </p>
        <p class="text-3xl font-bold text-(--tana-ink)">
          {{ props.stats.thisWeek }}
        </p>
        <p class="text-xs text-gray-400">
          {{ props.stats.thisWeek === 0 ? 'まずは数件から' : '件を今週追加しました' }}
        </p>
      </div>
    </UCard>
  </div>
</template>
