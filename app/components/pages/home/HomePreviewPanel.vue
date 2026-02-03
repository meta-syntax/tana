<script setup lang="ts">
const previewItems = [
  {
    title: 'Nuxt 4 移行ガイド - 公式ドキュメント',
    description: 'Nuxt 3からNuxt 4への移行手順を解説します',
    domain: 'nuxt.com',
    time: '3分前',
    thumbnail: 'https://nuxt.com/new-social.jpg'
  },
  {
    title: 'Tailwind CSS v4 の新機能まとめ',
    description: 'パフォーマンス改善と新ユーティリティを紹介',
    domain: 'tailwindcss.com',
    time: '1時間前',
    thumbnail: 'https://tailwindcss.com/opengraph-image.jpg'
  }
]
</script>

<template>
  <div class="relative">
    <div class="absolute -inset-4 rounded-4xl bg-[#f97316]/10 blur-2xl" />

    <!-- ダッシュボード風フレーム -->
    <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
      <!-- フレームヘッダー -->
      <div class="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span class="size-2.5 rounded-full bg-white/20" />
        <span class="size-2.5 rounded-full bg-white/20" />
        <span class="size-2.5 rounded-full bg-white/20" />
        <span class="ml-2 text-xs text-white/40">ダッシュボード</span>
      </div>

      <!-- カードグリッド -->
      <div class="grid grid-cols-2 gap-3 p-4">
        <div
          v-for="item in previewItems"
          :key="item.title"
          class="overflow-hidden rounded-lg border border-white/10 bg-white/5"
        >
          <div class="aspect-[1.91/1] overflow-hidden">
            <img
              :src="item.thumbnail"
              :alt="item.title"
              class="h-full w-full object-cover"
            >
          </div>
          <div class="p-3">
            <p class="line-clamp-1 text-sm font-medium text-white">
              {{ item.title }}
            </p>
            <p class="mt-1 line-clamp-1 text-xs text-white/50">
              {{ item.description }}
            </p>
            <div class="mt-2 flex items-center justify-between text-[10px] text-white/40">
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-heroicons-globe-alt"
                  class="size-3"
                />
                {{ item.domain }}
              </span>
              <span>{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
