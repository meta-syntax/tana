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
          {{ props.stats.total === 0 ? 'まだブックマークがありません' : '件を保存中' }}
        </p>
      </div>
    </UCard>
    <UCard class="border border-(--tana-border) bg-white">
      <div class="space-y-2">
        <p class="text-sm text-gray-500">
          情報の取得待ち
        </p>
        <p class="text-3xl font-bold text-(--tana-ink)">
          {{ props.stats.pendingOgp }}
        </p>
        <p class="text-xs text-gray-400">
          {{ props.stats.pendingOgp === 0 ? 'すべて取得ずみ' : '件が処理待ち' }}
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
          {{ props.stats.thisWeek === 0 ? '今週はまだ追加なし' : '件を追加' }}
        </p>
      </div>
    </UCard>
  </div>
</template>
